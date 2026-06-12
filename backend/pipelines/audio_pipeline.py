import uuid
import whisper
import os
from embedder import get_embedding
from vectorstore import store_embedding

whisper_model = whisper.load_model("base")

def ingest_audio(file_path: str, filename: str) -> dict:
    """Transcribe audio with Whisper, split into segments, embed each one."""
    result = whisper_model.transcribe(file_path)
    segments = result.get("segments", [])

    if not segments:
        # Fallback: index whole file as one chunk
        transcript = result["text"].strip() or "[No speech detected]"
        embedding = get_embedding(transcript)
        doc_id = str(uuid.uuid4())
        store_embedding(doc_id, embedding, transcript, {
            "modality": "audio", "filename": filename,
            "file_path": file_path, "transcript": transcript,
            "timestamp_start": 0, "timestamp_end": 0,
            "preview": transcript[:300]
        })
        return {"id": doc_id, "status": "indexed", "modality": "audio", "segments": 1}

    ids = []
    for seg in segments:
        text = seg["text"].strip()
        if not text:
            continue
        start = round(seg["start"], 1)
        end = round(seg["end"], 1)
        embedding = get_embedding(text)
        doc_id = str(uuid.uuid4())
        store_embedding(doc_id, embedding, text, {
            "modality": "audio", "filename": filename,
            "file_path": file_path, "transcript": text,
            "timestamp_start": start, "timestamp_end": end,
            "preview": f"[{start}s → {end}s] {text[:250]}"
        })
        ids.append(doc_id)

    return {"id": ids[0] if ids else "", "status": "indexed",
            "modality": "audio", "segments": len(ids)}