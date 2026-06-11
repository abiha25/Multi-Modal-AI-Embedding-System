import uuid
import whisper
import os
from embedder import get_embedding
from vectorstore import store_embedding

# Load once at startup (use "base" for speed, "small" for better accuracy)
whisper_model = whisper.load_model("base")

def ingest_audio(file_path: str, filename: str) -> dict:
    """Transcribe audio with Whisper, then embed the transcript."""
    
    # Step 1: Transcribe
    result = whisper_model.transcribe(file_path)
    transcript = result["text"].strip()
    
    if not transcript:
        transcript = "[No speech detected]"
    
    # Step 2: Embed transcript
    embedding = get_embedding(transcript)
    doc_id = str(uuid.uuid4())
    
    # Step 3: Store
    store_embedding(
        doc_id=doc_id,
        embedding=embedding,
        text_content=transcript,
        metadata={
            "modality": "audio",
            "filename": filename,
            "file_path": file_path,
            "transcript": transcript,
            "preview": transcript[:300]
        }
    )
    return {
        "id": doc_id,
        "status": "indexed",
        "modality": "audio",
        "transcript": transcript
    }