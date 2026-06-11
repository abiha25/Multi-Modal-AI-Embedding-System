import { useState } from "react";

const API = "http://localhost:8000";

export default function UploadPanel() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [textName, setTextName] = useState("");

  const upload = async (formData, endpoint) => {
    setLoading(true);
    setStatus("Processing... this may take a moment ⏳");
    try {
      const res = await fetch(`${API}/${endpoint}`, { method: "POST", body: formData });
      const data = await res.json();
      setStatus(`✅ Indexed! Modality: ${data.modality} | ID: ${data.id.slice(0, 8)}...`);
    } catch (e) {
      setStatus("❌ Error: " + e.message);
    }
    setLoading(false);
  };

  const handleFile = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    upload(fd, `ingest/${type}`);
  };

  const handleText = () => {
    if (!textContent.trim()) return;
    const fd = new FormData();
    fd.append("content", textContent);
    fd.append("filename", textName || "untitled.txt");
    upload(fd, "ingest/text");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-200">Index New Content</h2>

      {/* Text */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <span>📝</span> Text Document
        </div>
        <input
          className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Document name (e.g. report.txt)"
          value={textName}
          onChange={e => setTextName(e.target.value)}
        />
        <textarea
          className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-indigo-500 h-28 resize-none"
          placeholder="Paste your text content here..."
          value={textContent}
          onChange={e => setTextContent(e.target.value)}
        />
        <button
          onClick={handleText}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Index Text
        </button>
      </div>

      {/* Audio */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <span>🎵</span> Audio File
        </div>
        <p className="text-xs text-gray-500">Supports .mp3, .wav, .m4a — will be transcribed with Whisper</p>
        <input
          type="file" accept="audio/*"
          onChange={e => handleFile(e, "audio")}
          className="text-sm text-gray-400 file:mr-3 file:bg-gray-700 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1.5 file:text-sm file:cursor-pointer"
        />
      </div>

      {/* Video */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <span>🎬</span> Video File
        </div>
        <p className="text-xs text-gray-500">Supports .mp4, .mov — frames will be captioned + audio transcribed</p>
        <input
          type="file" accept="video/*"
          onChange={e => handleFile(e, "video")}
          className="text-sm text-gray-400 file:mr-3 file:bg-gray-700 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1.5 file:text-sm file:cursor-pointer"
        />
      </div>

      {/* Status */}
      {status && (
        <div className={`text-sm px-4 py-3 rounded-lg ${
          status.startsWith("✅") ? "bg-green-900/40 text-green-300 border border-green-800"
          : status.startsWith("❌") ? "bg-red-900/40 text-red-300 border border-red-800"
          : "bg-yellow-900/40 text-yellow-300 border border-yellow-800"
        }`}>
          {status}
        </div>
      )}
    </div>
  );
}