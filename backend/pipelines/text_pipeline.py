import uuid
from embedder import get_embedding
from vectorstore import store_embedding

def ingest_text(content: str, filename: str) -> dict:
    """Embed and store a text document."""
    embedding = get_embedding(content)
    doc_id = str(uuid.uuid4())
    
    store_embedding(
        doc_id=doc_id,
        embedding=embedding,
        text_content=content,
        metadata={
            "modality": "text",
            "filename": filename,
            "preview": content[:300]
        }
    )
    return {"id": doc_id, "status": "indexed", "modality": "text"}