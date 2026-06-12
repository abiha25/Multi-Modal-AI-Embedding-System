import { useState } from "react";

const API = "http://localhost:8000";

export default function SearchPanel({ onBack }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recording, setRecording] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setResults([]);
    try {
      const fd = new FormData();
      fd.append("query", query);
      fd.append("n_results", 5);
      const res = await fetch(`${API}/search`, { method: "POST", body: fd });
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleMic = async () => {
    if (recording) return;
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        const fd = new FormData();
        fd.append("file", blob, "query.webm");
        fd.append("n_results", 5);
        setLoading(true);
        setSearched(true);
        setResults([]);
        try {
          const res = await fetch(`${API}/search/audio`, { method: "POST", body: fd });
          const data = await res.json();
          setQuery(data.query || "");
          setResults(data.results || []);
        } catch (e) {
          console.error(e);
        }
        setLoading(false);
        setRecording(false);
      };
      recorder.start();
      setTimeout(() => recorder.stop(), 5000);
    } catch (e) {
      alert("Microphone access denied.");
      setRecording(false);
    }
  };

  const chips = [
    "person walking outdoors",
    "solo travel vlog",
    "machine learning introduction",
    "someone speaking about technology",
  ];

  return (
    <div className="page">
      <div className="page-topbar">
        <button className="back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Home
        </button>
        <div className="page-divider" />
        <span className="page-title">Retrieve</span>
      </div>

      <div className="page-content">
        <h1 className="search-headline">What are you looking for?</h1>
        <p className="search-sub">Search across all indexed text, audio, and video using natural language.</p>

        <div className="search-row">
          <input
            className="search-input"
            placeholder='e.g. "person walking outdoors"'
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleMic}
            disabled={loading || recording}
            title="Speak a 5-second query"
            style={{
              background: recording ? "#dc2626" : "#f5f5f5",
              border: "none",
              borderLeft: "1px solid #e8e8e8",
              padding: "0 16px",
              cursor: recording ? "not-allowed" : "pointer",
              fontSize: "16px",
              transition: "background 0.15s",
            }}
          >
            {recording ? "⏺" : "🎙"}
          </button>
          <button
            className="search-go"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

        {recording && (
          <p style={{ fontSize: "12px", color: "#dc2626", marginBottom: "12px" }}>
            Recording… speak now (5 seconds)
          </p>
        )}

        <div className="suggestion-chips">
          {chips.map(c => (
            <button key={c} className="chip" onClick={() => setQuery(c)}>{c}</button>
          ))}
        </div>

        {loading && <div className="loading-line" />}

        {!loading && searched && results.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <p className="empty-title">No results found</p>
            <p className="empty-desc">Try indexing some content first, then search again.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="results-header">
              <span className="results-label">Results</span>
              <span className="results-count">{results.length} found for "{query}"</span>
            </div>
            {results.map(r => (
              <div key={r.id} className="result-card">
                <div className="result-top">
                  <div className="result-left">
                    <span className={`modality-pill ${r.modality}`}>{r.modality}</span>
                    <span className="result-filename">{r.filename}</span>
                  </div>
                  <span className="result-score">{(r.score * 100).toFixed(1)}%</span>
                </div>
                <p className="result-preview">{r.preview}</p>
                {(r.timestamp_start !== null && r.timestamp_start !== undefined) && (
                <p className="result-captions">
                ⏱ {r.timestamp_start}s → {r.timestamp_end}s
                </p>
                )}
                {r.captions && !r.timestamp_start && (
                  <p className="result-captions">Frames: {r.captions.slice(0, 140)}…</p>
                )}
              </div>
            ))}
          </>
        )}

        {!searched && !loading && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <p className="empty-title">Enter a query above</p>
            <p className="empty-desc">Type a query, pick a suggestion, or tap the mic to speak.</p>
          </div>
        )}
      </div>
    </div>
  );
}
