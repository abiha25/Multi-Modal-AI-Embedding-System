import { useState } from "react";
import UploadPanel from "./components/UploadPanel";
import SearchPanel from "./components/SearchPanel";
import "./app.css";

export default function App() {
  const [page, setPage] = useState("home");

  if (page === "search") return <SearchPanel onBack={() => setPage("home")} />;
  if (page === "index") return <UploadPanel onBack={() => setPage("home")} />;

  return (
    <div className="home">
      <div className="home-header">
        <div className="home-logo">
          <span className="logo-dot" />
          <span className="logo-text">MultiModal Search</span>
        </div>
        <p className="home-tagline">
          Index and retrieve across text, audio, and video — with one natural language query.
        </p>
      </div>

      <div className="home-cards">
        <button className="hcard" onClick={() => setPage("search")}>
          <div className="hcard-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <div className="hcard-body">
            <h2 className="hcard-title">Retrieve</h2>
            <p className="hcard-desc">Search across all indexed content using natural language. Find text, audio, and video by meaning — not keywords.</p>
          </div>
          <div className="hcard-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </button>

        <button className="hcard" onClick={() => setPage("index")}>
          <div className="hcard-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div className="hcard-body">
            <h2 className="hcard-title">Index</h2>
            <p className="hcard-desc">Add text documents, audio recordings, and video files to the system. Each is processed and embedded for semantic search.</p>
          </div>
          <div className="hcard-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </button>
      </div>

      <div className="home-footer">
        <span className="badge">Gemini Embeddings</span>
        <span className="badge">Whisper STT</span>
        <span className="badge">BLIP Captioning</span>
        <span className="badge">ChromaDB</span>
      </div>
    </div>
  );
}
