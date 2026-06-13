import { useState, useEffect, useRef } from "react";
import { Wordmark } from "../App";

const API = "http://localhost:8000";

function ScoreBar({ score }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score * 100), 60);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="score-block">
      <span className="score-num">{(score * 100).toFixed(1)}%</span>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function ResultCard({ r }) {
  return (
    <div className="result-card">
      <div className="result-header">
        <div className="result-left">
          <span className={`modality-pill ${r.modality}`}>{r.modality}</span>
          <span className="result-filename">{r.filename}</span>
        </div>
        <ScoreBar score={r.score} />
      </div>
      <p className="result-preview">{r.preview}</p>
      {r.timestamp_start != null && (
        <p className="result-ts">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {r.timestamp_start}s → {r.timestamp_end}s
        </p>
      )}
      {r.captions && r.timestamp_start == null && (
        <p className="result-ts">Frames: {r.captions.slice(0, 120)}…</p>
      )}
    </div>
  );
}

export default function SearchPanel({ onBack }) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recording, setRecording] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const doSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true); setSearched(true); setResults([]);
    try {
      const fd = new FormData();
      fd.append("query", q); fd.append("n_results", 5);
      const res = await fetch(`${API}/search`, { method: "POST", body: fd });
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) { console.error(e); }
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
        fd.append("file", blob, "query.webm"); fd.append("n_results", 5);
        setLoading(true); setSearched(true); setResults([]);
        try {
          const res = await fetch(`${API}/search/audio`, { method: "POST", body: fd });
          const data = await res.json();
          setQuery(data.query || "");
          setResults(data.results || []);
        } catch (e) { console.error(e); }
        setLoading(false);
        setRecording(false);
      };
      recorder.start();
      setTimeout(() => recorder.stop(), 5000);
    } catch {
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
      <div className="topbar">
        <button className="topbar-wordmark" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <Wordmark size="sm" />
        </button>
        <div className="topbar-sep" />
        <span className="topbar-crumb">Search</span>
        <button className="back-btn" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Home
        </button>
      </div>

      <div className="page-body">
        <p className="page-eyebrow">Semantic retrieval</p>
        <h1 className="page-headline">What are you looking for?</h1>
        <p className="page-sub">Search across all indexed text, audio, and video using natural language.</p>

        <div className="search-bar">
          <input
            ref={inputRef}
            className="search-input"
            placeholder='e.g. "someone explaining neural networks"'
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doSearch(query)}
          />
          <button
            className={`mic-btn ${recording ? "recording" : ""}`}
            onClick={handleMic}
            disabled={loading || recording}
            title="Speak a 5-second query"
          >
            {recording ? "⏺" : "🎙"}
          </button>
          <button className="search-btn" onClick={() => doSearch(query)} disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

        {recording && (
          <div className="recording-hint">
            <span className="rec-dot" />
            Recording — speak now (5 seconds)
          </div>
        )}

        <div className="chips">
          {chips.map(c => (
            <button key={c} className="chip" onClick={() => { setQuery(c); doSearch(c); }}>{c}</button>
          ))}
        </div>

        {loading && <div className="loading-bar" />}

        {!loading && searched && results.length === 0 && (
          <div className="empty">
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
            <div className="results-meta">
              <span className="results-label">Results</span>
              <span className="results-count">{results.length} matches for "{query}"</span>
            </div>
            {results.map(r => <ResultCard key={r.id} r={r} />)}
          </>
        )}

        {!searched && !loading && (
          <div className="empty">
            <div className="empty-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <p className="empty-title">Enter a query above</p>
            <p className="empty-desc">Type, pick a suggestion, or tap the mic to speak.</p>
          </div>
        )}
      </div>
    </div>
  );
}
