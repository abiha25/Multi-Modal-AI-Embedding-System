import { useState } from "react";

const API = "http://localhost:8000";

export default function SearchPanel({ onBack }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

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
            className="search-go"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

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
                {r.captions && (
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
            <p className="empty-desc">Pick a suggestion or type your own to begin searching.</p>
          </div>
        )}
      </div>
    </div>
  );
}
