# api.py
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import uuid
import asyncio
from dotenv import load_dotenv

# --- LangChain & RAG Imports ---
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI

# --- Import from Multiagent ---
from Multiagent import (
    read_pdf_file,
    scrape_website_text,
    run_summarizer_agent,
    answer_question_orchestrator,
    run_question_suggester_agent,
)

# --- App Initialization ---
app = FastAPI()
processing_cache = {}

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# --- Load API Key and Initialize LLM ---
load_dotenv()
llm = None
initialization_error = None
try:
    google_api_key = os.environ.get("GOOGLE_API_KEY")
    if not google_api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment variables (.env).")
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.2,
        google_api_key=google_api_key
    )
    print("✅ LLM initialized: gemini-1.5-flash")
except Exception as e:
    initialization_error = f"Failed to initialize LLM: {e}"
    print(f"[ERROR] {initialization_error}")

# --- Pydantic Models ---
class ChatRequest(BaseModel):
    session_id: str
    question: str
    chat_history: list


# --- Health check ---
@app.get("/llm-check")
def llm_check():
    if not llm:
        return {"ok": False, "message": f"LLM not ready. {initialization_error}"}
    try:
        r = llm.invoke("Ping.")
        return {"ok": True, "message": "LLM responded OK.", "sample": getattr(r, "content", str(r))}
    except Exception as e:
        return {"ok": False, "message": f"LLM call failed: {e}"}


# --- Async Background Worker ---
async def process_content_worker(session_id: str, raw_content: str, source_name: str, ocr_meta: dict):
    try:
        if not llm:
            raise RuntimeError("LLM not initialized.")
        print(f"[INFO] Worker started for session: {session_id}")

        processing_cache[session_id].update({"progress": "Summarizing content…", "ocr_meta": ocr_meta})

        # --- Summarization ---
        summary = run_summarizer_agent(raw_content, llm)
        if not summary or summary.strip().lower().startswith("error"):
            raise RuntimeError("Summarizer failed.")

        # Cap summary at max 4 paragraphs
        paras = [p.strip() for p in summary.split("\n") if p.strip()]
        if len(paras) > 4:
            summary = "\n\n".join(paras[:4])

        # --- Vector Index ---
        processing_cache[session_id].update({"progress": "Building vector index…"})
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)
        chunks = text_splitter.split_text(raw_content)
        if not chunks:
            raise RuntimeError("Document is empty after splitting.")
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vector_store = FAISS.from_texts(chunks, embedding=embeddings)

        # --- Suggested Questions ---
        processing_cache[session_id].update({"progress": "Suggesting follow-up questions…"})
        suggested_questions = run_question_suggester_agent(summary, llm)

        # --- Done ---
        processing_cache[session_id].update({
            "status": "complete",
            "summary": summary,
            "vector_store": vector_store,
            "suggested_questions": suggested_questions,
            "source_name": source_name,
            "progress": "✅ Finished!"
        })
        print(f"[INFO] Worker finished for session: {session_id}")

    except Exception as e:
        print(f"[ERROR] Worker failed for session {session_id}: {e}")
        processing_cache[session_id] = {
            "status": "error",
            "message": f"❌ LLM or indexing failure: {e}"
        }


# --- API Endpoints ---
@app.post("/process-content/")
async def process_content_endpoint(file: UploadFile = File(None), url: str = Form(None)):
    if not llm:
        return {"success": False, "message": f"❌ LLM not initialized. {initialization_error or ''}".strip()}

    if not file and not url:
        return {"success": False, "message": "Please upload a PDF or provide a URL."}

    session_id = str(uuid.uuid4())
    raw_content, source_name, ocr_meta = "", "", {}

    try:
        if file:
            file_bytes = await file.read()
            raw_content, ocr_meta = read_pdf_file(file_bytes)
            source_name = file.filename
        else:
            raw_content = scrape_website_text(url)
            source_name = url
            ocr_meta = {}

        if isinstance(raw_content, str) and raw_content.startswith("Error"):
            return {"success": False, "message": f"Extraction failed: {raw_content}"}
        if not raw_content or not raw_content.strip():
            return {"success": False, "message": f"Could not extract any text from {source_name}."}

        processing_cache[session_id] = {
            "status": "processing",
            "source_name": source_name,
            "progress": "🚀 Launching analysis…"
        }

        # schedule worker in event loop
        asyncio.create_task(process_content_worker(session_id, raw_content, source_name, ocr_meta))

        return {
            "success": True,
            "session_id": session_id,
            "status": "processing",
            "hint": "🚀 Awesome—your content is on the launchpad! We’re analyzing it right now."
        }

    except Exception as e:
        print(f"[ERROR] process-content failed: {e}")
        return {"success": False, "message": "Unexpected error while processing content."}


@app.get("/status/{session_id}")
async def get_status_endpoint(session_id: str):
    result = processing_cache.get(session_id)
    if not result:
        return {"success": False, "message": "Session not found."}

    response = {
        "success": True,
        "status": result["status"],
        "progress": result.get("progress", "Working…"),
        "ocr_meta": result.get("ocr_meta", {}),
        "source_name": result.get("source_name", "")
    }

    if result["status"] == "complete":
        response.update({
            "summary": result["summary"],
            "suggested_questions": result.get("suggested_questions", [])
        })
    elif result["status"] == "error":
        return {"success": False, "status": "error", "message": result.get("message", "Processing failed.")}

    return response


@app.post("/chat/")
async def chat_endpoint(request: ChatRequest):
    if not llm:
        return {
            "success": False,
            "message": f"LLM is not available. Startup error: {initialization_error}"
        }

    session_data = processing_cache.get(request.session_id)
    if not session_data or session_data.get("status") != "complete":
        return {"success": False, "message": "Session not ready or not found."}

    try:
        answer = answer_question_orchestrator(
            summary=session_data["summary"],
            question=request.question,
            llm=llm,
            chat_history=request.chat_history,
            vector_store=session_data["vector_store"]
        )
        return {"success": True, "answer": answer}
    except Exception as e:
        print(f"[ERROR] Chat failed: {e}")
        return {"success": False, "message": "Error during chat. Please try again later."}
