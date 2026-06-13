import uuid
from embedder import get_embedding
from vectorstore import store_embedding

CHUNK_SIZE = 400      # words per chunk
CHUNK_OVERLAP = 80   # words of overlap between chunks

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """
    Sliding-window chunker. Splits text into overlapping word-windows
    so long documents don't collapse into a single blurry vector.
    e.g. 1000-word doc → ~3 chunks that each share 80 words with their neighbours.
    """
    words = text.split()
    if len(words) <= chunk_size:
        return [text]  # short enough — keep as one chunk

    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        if end == len(words):
            break
        start += chunk_size - overlap  # slide forward, keeping `overlap` words
    return chunks


def ingest_text(content: str, filename: str) -> dict:
    """Chunk, embed, and store a text document."""
    chunks = chunk_text(content)
    ids = []

    for i, chunk in enumerate(chunks):
        embedding = get_embedding(chunk)
        doc_id = str(uuid.uuid4())
        store_embedding(
            doc_id=doc_id,
            embedding=embedding,
            text_content=chunk,
            metadata={
                "modality": "text",
                "filename": filename,
                "chunk_index": i,
                "total_chunks": len(chunks),
                "preview": chunk[:300],
            }
        )
        ids.append(doc_id)

    return {
        "id": ids[0] if ids else "",
        "status": "indexed",
        "modality": "text",
        "chunks": len(ids),
    }
