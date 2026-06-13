import { useState } from "react";
import UploadPanel from "./components/UploadPanel";
import SearchPanel from "./components/SearchPanel";
import "./app.css";

function Wordmark({ size = "md" }) {
  const s = size === "sm" ? { grid: 14, gap: 2, font: 13 } : { grid: 18, gap: 3, font: 14 };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: s.gap, width: s.grid, height: s.grid
      }}>
        {[1, 0.4, 0.65, 0.25].map((op, i) => (
          <span key={i} style={{
            borderRadius: 2, background: "#111110", opacity: op, display: "block"
          }} />
        ))}
      </div>
      <span style={{ fontSize: s.font, fontWeight: 600, letterSpacing: "0.01em", color: "#111110" }}>
        Mosaic
      </span>
    </div>
  );
}

export { Wordmark };

export default function App() {
  const [page, setPage] = useState("home");

  if (page === "search") return <SearchPanel onBack={() => setPage("home")} />;
  if (page === "index")  return <UploadPanel onBack={() => setPage("home")} />;

  return (
    <div className="home">
      <div style={{ marginBottom: 56 }}>
        <Wordmark />
      </div>

      <div className="home-hero">
        <h1 className="home-headline">
          Search what you<br /><em>mean,</em> not what<br />you typed.
        </h1>
        <p className="home-sub">
          Index text, audio, and video. Retrieve anything with a natural language query — or your voice.
        </p>
      </div>

      <div className="home-cards">
        <button className="hcard" onClick={() => setPage("search")}>
          <div className="hcard-tag">Retrieve</div>
          <div className="hcard-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <h2 className="hcard-title">Search the index</h2>
          <p className="hcard-desc">Find content across all modalities by meaning, not keywords. Type a query or speak it.</p>
          <div className="hcard-cta">
            Open search
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </button>

        <button className="hcard" onClick={() => setPage("index")}>
          <div className="hcard-tag">Ingest</div>
          <div className="hcard-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <h2 className="hcard-title">Add to the index</h2>
          <p className="hcard-desc">Upload text documents, audio files, or videos. Each is chunked, embedded, and stored for retrieval.</p>
          <div className="hcard-cta">
            Open index
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </button>
      </div>

      <div className="home-tech">
        {["Gemini Embeddings", "Whisper STT", "BLIP Vision", "ChromaDB", "FastAPI"].map(t => (
          <span key={t} className="tech-pill">{t}</span>
        ))}
      </div>
    </div>
  );
}
