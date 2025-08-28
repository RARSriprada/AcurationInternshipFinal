# Multiagent.py
import requests
import pymupdf as fitz
from bs4 import BeautifulSoup
import pytesseract
from PIL import Image
import io
import logging
import shutil
from tenacity import retry, stop_after_attempt, wait_exponential, before_sleep_log

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

# ---------- Robust LLM wrapper (sync only) ----------
@retry(wait=wait_exponential(multiplier=1, min=2, max=8),
       stop=stop_after_attempt(3), before_sleep=before_sleep_log(log, logging.INFO))
def _invoke(llm, prompt: str):
    r = llm.invoke(prompt)
    return getattr(r, "content", str(r))


# ---------- Input utilities ----------
def scrape_website_text(url: str) -> str:
    try:
        response = requests.get(url, timeout=15, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()
        text = soup.get_text(separator='\n', strip=True)
        return text
    except Exception as e:
        return f"Error scraping website: {e}"


def configure_tesseract():
    """Checks if Tesseract is installed and available in PATH."""
    if not shutil.which("tesseract"):
        raise RuntimeError(
            "⚠️ Tesseract not found in system PATH.\n"
            "Please install it from https://github.com/UB-Mannheim/tesseract/wiki "
            "and ensure you check the box 'Add Tesseract to system PATH' during installation."
        )


def read_pdf_file(file_bytes: bytes) -> tuple[str, dict]:
    """
    Reads text from a PDF, falling back to OCR if needed.
    Returns (content, metadata).
    """
    try:
        configure_tesseract()
        text_content = ""
        meta = {"total_pages": 0, "ocr_pages": 0}

        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            meta["total_pages"] = len(doc)
            for page_num, page in enumerate(doc):
                page_text = page.get_text().strip()
                if page_text:
                    text_content += page_text + "\n"
                else:
                    meta["ocr_pages"] += 1
                    pix = page.get_pixmap(dpi=300)
                    img = Image.open(io.BytesIO(pix.tobytes("png")))
                    ocr_text = pytesseract.image_to_string(img)
                    text_content += ocr_text + "\n"
        
        return text_content.strip(), meta

    except Exception as e:
        error_message = f"Error reading PDF file: {e}"
        log.error(error_message)
        return error_message, {}


# ---------- Summarizer Agent ----------
def run_summarizer_agent(content: str, llm) -> str:
    log.info("Summarizer Agent is working...")

    try:
        if not content or not content.strip():
            return "⚠️ No content available to summarize."

        # Split into chunks
        chunks = [content[i:i + 3500] for i in range(0, len(content), 3500)]
        log.info(f"Splitting into {len(chunks)} chunks for summarization")

        if not chunks:
            return "⚠️ Document produced no valid chunks for summarization."

        partials = []
        for idx, chunk in enumerate(chunks, start=1):
            map_prompt = (
                "You are a precise summarizer. Summarize the following text chunk, "
                "capturing key facts, names, dates, and details. "
                "Write clearly and concisely:\n\n"
                f"{chunk}\n\n"
                "Chunk Summary:"
            )
            try:
                partial_summary = _invoke(llm, map_prompt)
                if partial_summary and not partial_summary.lower().startswith("error"):
                    partials.append(partial_summary)
                else:
                    partials.append("[This chunk could not be summarized]")
                log.info(f"✅ Chunk {idx}/{len(chunks)} summarized")
            except Exception as e:
                log.error(f"❌ Failed to summarize chunk {idx}: {e}")
                partials.append("[This chunk failed]")

        # If nothing succeeded
        if not any(p.strip() and not p.startswith("[") for p in partials):
            return "⚠️ No summary could be generated — all LLM attempts failed."

        # Reduce step (combine partial summaries)
        reduce_prompt = (
            "You are a master synthesizer. Combine these chunk summaries into a single, "
            "cohesive, comprehensive final summary. "
            "The final summary must be at most **4 paragraphs long**. "
            "Prefer clarity, readability, and completeness, but stay concise:\n\n"
            f"{chr(10).join(partials)}\n\nFinal Summary (max 4 paragraphs):"
        )
        final_summary = _invoke(llm, reduce_prompt)

        if not final_summary or final_summary.strip().lower().startswith("error"):
            return "⚠️ Summary generation failed at the synthesis step."

        return final_summary

    except Exception as e:
        log.error(f"Error during summarization pipeline: {e}")
        return f"⚠️ Error during summarization: {e}"


# ---------- Question Suggester Agent ----------
def run_question_suggester_agent(summary: str, llm) -> list[str]:
    log.info("Question Suggester Agent is working...")
    try:
        prompt = f"""
Generate exactly 3 short, useful follow-up questions a user might ask based on this summary.
Return them as a clean numbered list without extra text.

Summary:
{summary}

Questions:
"""
        text = _invoke(llm, prompt)
        lines = [ln.strip(" -•") for ln in text.splitlines() if ln.strip()]
        out = []
        for ln in lines:
            if ln[0].isdigit() and "." in ln:
                ln = ln.split(". ", 1)[-1]
            out.append(ln)
        return out[:3]
    except Exception as e:
        log.error(f"Question suggester error: {e}")
        return []


# ---------- Q&A Agent ----------
def run_qa_agent(summary: str, question: str, llm, chat_history: list) -> str:
    log.info("Q&A Agent is working (summary only)...")
    try:
        history = "\n".join([f"{m['role']}: {m['content']}" for m in (chat_history or [])])
        prompt = (
            "Answer the user's question using ONLY the provided summary and chat history. "
            "If the answer is not in the summary, respond exactly:\n"
            "'The answer is not available in the provided summary.'\n\n"
            f"Chat History:\n{history}\n\n"
            f"Summary:\n{summary}\n\n"
            f"User Question: {question}\n\n"
            "Answer:"
        )
        return _invoke(llm, prompt)
    except Exception as e:
        return f"Error in QA agent: {e}"


# ---------- Orchestrator ----------
def answer_question_orchestrator(summary: str, question: str, llm, chat_history: list, vector_store) -> str:
    initial = run_qa_agent(summary, question, llm, chat_history)
    if "not available in the provided summary" in initial.lower():
        log.info("Answer not in summary — escalating to RAG 🔎")
        from rag import run_rag_pipeline   # Lazy import to avoid circular import
        return run_rag_pipeline(vector_store, question, llm, chat_history)
    return initial
