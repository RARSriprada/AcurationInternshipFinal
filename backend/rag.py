# rag.py
import traceback
import logging
from langchain_community.vectorstores import FAISS

from Multiagent import _invoke

log = logging.getLogger(__name__)

def run_rag_pipeline(vector_store: FAISS, question: str, llm, chat_history: list = None) -> str:
    """
    Use the provided FAISS vector_store to retrieve relevant chunks and answer with the LLM.
    """
    try:
        similar_docs = vector_store.similarity_search(question, k=4)
        if not similar_docs:
            return "🤷 No relevant answer found in the document. Try asking in a different way."

        context = "\n\n---\n\n".join([d.page_content for d in similar_docs])
        history = ""
        if chat_history:
            history = "\n".join([f"{m['role']}: {m['content']}" for m in chat_history])

        prompt = (
            "You are a precise assistant. Use ONLY the retrieved context below and (optional) chat history to answer. "
            "If the answer isn't present, say: 'The answer is not available in the provided documents.'\n\n"
            f"Chat History:\n{history}\n\n"
            f"Retrieved Context:\n{context}\n\n"
            f"Question: {question}\n\n"
            "Answer:"
        )
        return _invoke(llm, prompt)
    except Exception as e:
        log.error(f"Error in RAG pipeline: {e}")
        traceback.print_exc()
        return f"Error during retrieval-augmented generation: {e}"
