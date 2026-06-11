import { useState } from "react";

const API = "http://localhost:8000";
const MODALITY_ICONS = { text: "📝", audio: "🎵", video: "🎬" };
const MODALITY_COLORS = {
  text: "bg-blue-900/40 text-blue-300 border-blue-800",
  audio: "bg-purple-900/40 text-purple-300 border-purple-800",
  video: "bg-green-900/40 text-green-300 border-green-800",
};

export default function SearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const fd = new FormData();
      fd.append("query", query);
      fd.append("n_results", 5);
      const res = await fetch(`${API}/search`, { method: "POST", body: fd });
      const data = await res.json();
      setResults(data.results);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-200 mb-1">Semantic Search</h2>
        <p className="text-sm text-gray-500">Search across text, audio, and video using natural language.</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <input
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          placeholder='e.g. "Find video where someone is drinking milk"'
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Example queries */}
      <div className="flex flex-wrap gap-2">
        {[
          "Find the audio of someone singing",
          "Video showing outdoor scenery",
          "Document about machine learning",
        ].map(q => (
          <button
            key={q}
            onClick={() => { setQuery(q); }}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-3 py-1.5 rounded-full transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-12 text-gray-500 text-sm">Embedding query and searching...</div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">No results found. Try indexing some content first.</div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">{results.length} results for "{query}"</p>
          {results.map((r, i) => (
            <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{MODALITY_ICONS[r.modality]}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${MODALITY_COLORS[r.modality]}`}>
                    {r.modality}
                  </span>
                  <span className="text-sm text-gray-300 font-medium">{r.filename}</span>
                </div>
                <span className="text-xs text-gray-500">
                  Score: <span className="text-indigo-400 font-semibold">{(r.score * 100).toFixed(1)}%</span>
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{r.preview}</p>
              {r.captions && (
                <p className="text-xs text-gray-600">🎞️ Frames: {r.captions.slice(0, 120)}...</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}