# Mosaic — Multi-Modal Search

A proof-of-concept system for indexing and semantically searching across **text, audio, and video** using a unified natural language query interface.

Built with Google Gemini embeddings, OpenAI Whisper, BLIP image captioning, ChromaDB, FastAPI, and React.

---

## What It Does

Upload any combination of text, audio, or video files. Then search across all of them with a single natural language query — the system finds the most semantically relevant result regardless of its original format.

| Query | Returns |
|-------|---------|
| "person walking outdoors" | Video clip showing someone walking |
| "solo travel vlog" | Audio file of a travel vlog |
| "machine learning introduction" | Text document about ML |

---

## Architecture

```
User (React UI)
      ↓
FastAPI Backend
      ↓
┌─────────────────────────────────────────┐
│           Processing Pipelines          │
│  Text  → Sliding-window chunks          │
│          → Gemini Embeddings            │
│  Audio → Whisper (local) → segments     │
│          → Gemini Embeddings            │
│  Video → FFmpeg frames                  │
│          → BLIP captions (HuggingFace)  │
│          → Whisper transcript           │
│          → Gemini Embeddings            │
└─────────────────────────────────────────┘
      ↓
ChromaDB (persistent local vector store)
      ↓
Cosine similarity search → Ranked results
```

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Embeddings | Google Gemini (`gemini-embedding-001`) |
| Audio transcription | OpenAI Whisper (runs locally, no API key) |
| Video frame captioning | BLIP (`Salesforce/blip-image-captioning-base`) |
| Video processing | MoviePy + FFmpeg |
| Vector database | ChromaDB (persistent, local) |
| Backend | Python FastAPI |
| Frontend | React + Vite + Tailwind CSS |

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- FFmpeg installed and on PATH
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### Install FFmpeg (Windows)
```bash
winget install --id Gyan.FFmpeg -e
```
Then restart your terminal.

---

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/abiha25/multimodal-search.git
cd multimodal-search
```

### 2. Configure environment
Create `backend/.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

**Note:** First startup downloads ~990MB of BLIP model weights from HuggingFace. This only happens once — weights are cached locally after that.

Wait for:
```
INFO: Application startup complete.
```

### 4. Frontend
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ingest/text` | Index a text document |
| POST | `/ingest/audio` | Upload and index an audio file |
| POST | `/ingest/video` | Upload and index a video file |
| POST | `/search` | Semantic search across all indexed content |
| GET | `/health` | Health check |

Full API docs available at [http://localhost:8000/docs](http://localhost:8000/docs) (FastAPI auto-generated Swagger UI).

---

## Project Structure

```
Multi-Modal-AI-Embedding-System/
├── .env
├── .gitignore
├── env.example
├── README.md
│
├── backend/
│   ├── main.py                  # FastAPI app
│   ├── embedder.py              # Gemini embedding wrapper
│   ├── vectorstore.py           # ChromaDB interface
│   ├── requirements.txt
│   └── pipelines/
│       ├── text_pipeline.py
│       ├── audio_pipeline.py
│       └── video_pipeline.py
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── eslint.config.js
    └── src/
        ├── main.jsx
        ├── app.css
        ├── index.css
        ├── App.jsx
        ├── assets/
        │   └── hero.png
        └── components/
            ├── SearchPanel.jsx
            ├── UploadPanel.jsx
            └── ResultCard.jsx
```

---

## Supported File Formats

| Modality | Formats | Indexing strategy |
|----------|---------|-------------------|
| Text | Any text content (pasted directly) | Sliding-window chunks (400 words, 80-word overlap) |
| Audio | `.mp3`, `.wav`, `.m4a` | Per-segment via Whisper |
| Video | `.mp4`, `.mov` | Per 5-second chunk (BLIP caption + Whisper transcript fused) |
