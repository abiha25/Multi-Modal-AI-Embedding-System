from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil, os, uuid

from pipelines.text_pipeline import ingest_text
from pipelines.audio_pipeline import ingest_audio
from pipelines.video_pipeline import ingest_video
from embedder import get_query_embedding
from vectorstore import search

app = FastAPI(title="MultiModal Search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── Upload Endpoints ──────────────────────────────────────────

@app.post("/ingest/text")
async def ingest_text_endpoint(content: str = Form(...), filename: str = Form(...)):
    result = ingest_text(content, filename)
    return result

@app.post("/ingest/audio")
async def ingest_audio_endpoint(file: UploadFile = File(...)):
    path = f"{UPLOAD_DIR}/{uuid.uuid4()}_{file.filename}"
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    result = ingest_audio(path, file.filename)
    return result

@app.post("/ingest/video")
async def ingest_video_endpoint(file: UploadFile = File(...)):
    path = f"{UPLOAD_DIR}/{uuid.uuid4()}_{file.filename}"
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    result = ingest_video(path, file.filename)
    return result

# ── Search Endpoint ───────────────────────────────────────────

@app.post("/search")
async def search_endpoint(query: str = Form(...), n_results: int = Form(5)):
    query_emb = get_query_embedding(query)
    raw = search(query_emb, n_results=n_results)
    
    results = []
    for i in range(len(raw["ids"][0])):
        results.append({
            "id": raw["ids"][0][i],
            "score": round(1 - raw["distances"][0][i], 4),  # cosine similarity
            "modality": raw["metadatas"][0][i].get("modality"),
            "filename": raw["metadatas"][0][i].get("filename"),
            "preview": raw["metadatas"][0][i].get("preview"),
            "transcript": raw["metadatas"][0][i].get("transcript", ""),
            "captions": raw["metadatas"][0][i].get("captions", ""),
        })
    
    return {"query": query, "results": results}

@app.get("/health")
def health():
    return {"status": "ok"}