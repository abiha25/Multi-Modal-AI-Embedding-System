import chromadb
from chromadb.config import Settings

client = chromadb.PersistentClient(path="./chroma_store")

collection = client.get_or_create_collection(
    name="multimodal_index",
    metadata={"hnsw:space": "cosine"}
)

def store_embedding(
    doc_id: str,
    embedding: list[float],
    text_content: str,
    metadata: dict
):
    """Store a vector + metadata in ChromaDB."""
    collection.upsert(
        ids=[doc_id],
        embeddings=[embedding],
        documents=[text_content],
        metadatas=[metadata]
    )

def search(query_embedding: list[float], n_results: int = 5):
    """Return top-n results for a query embedding."""
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        include=["documents", "metadatas", "distances"]
    )
    return results