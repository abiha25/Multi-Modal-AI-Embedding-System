import { useState } from "react";

const API = "http://localhost:8000";

export default function UploadPanel({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [textName, setTextName] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [statuses, setStatuses] = useState({ text: null, audio: null, video: null });

  const setStatus = (type, msg, kind) =>
    setStatuses(s => ({ ...s, [type]: { msg, kind } }));

  const upload = async (formData, endpoint, type) => {
    setLoading(true);
    setStatus(type, "Processing… this may take a moment", "wait");
    try {
      const res = await fetch(`${API}/${endpoint}`, { method: "POST", body: formData });
      const data = await res.json();
      setStatus(type, `Indexed — ${data.modality} · ID ${data.id.slice(0, 8)}`, "ok");
    } catch (e) {
      setStatus(type, "Error: " + e.message, "err");
    }
    setLoading(false);
  };

  const handleText = () => {
    if (!textContent.trim()) return;
    const fd = new FormData();
    fd.append("content", textContent);
    fd.append("filename", textName || "untitled.txt");
    upload(fd, "ingest/text", "text");
  };

  const handleAudio = () => {
    if (!audioFile) return;
    const fd = new FormData();
    fd.append("file", audioFile);
    upload(fd, "ingest/audio", "audio");
  };

  const handleVideo = () => {
    if (!videoFile) return;
    const fd = new FormData();
    fd.append("file", videoFile);
    upload(fd, "ingest/video", "video");
  };

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
        <span className="page-title">Index</span>
      </div>

      <div className="page-content">
        <h1 className="index-headline">Add content to the index</h1>
        <p className="index-sub">Each file is processed and stored as a vector embedding for semantic retrieval.</p>

        {/* Text */}
        <div className="ingest-block">
          <div className="ingest-head">
            <div className="ingest-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <span className="ingest-label">Text document</span>
          </div>
          <p className="ingest-note">Paste any text — articles, notes, transcripts, documentation.</p>
          <input
            className="field"
            placeholder="Document name (e.g. report.txt)"
            value={textName}
            onChange={e => setTextName(e.target.value)}
          />
          <textarea
            className="field"
            placeholder="Paste content here…"
            value={textContent}
            onChange={e => setTextContent(e.target.value)}
          />
          <button className="primary-btn" onClick={handleText} disabled={loading || !textContent.trim()}>
            Index text
          </button>
          {statuses.text && (
            <div className={`status-msg ${statuses.text.kind}`}>{statuses.text.msg}</div>
          )}
        </div>

        {/* Audio */}
        <div className="ingest-block">
          <div className="ingest-head">
            <div className="ingest-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <span className="ingest-label">Audio file</span>
          </div>
          <p className="ingest-note">.mp3 · .wav · .m4a — transcribed locally via Whisper, no API needed.</p>
          <label className={`file-drop ${audioFile ? "chosen" : ""}`}>
            <input
              type="file"
              accept="audio/*"
              style={{ display: "none" }}
              onChange={e => setAudioFile(e.target.files[0])}
            />
            <span className="file-drop-text">
              {audioFile ? audioFile.name : "Click to choose an audio file"}
            </span>
          </label>
          <button className="primary-btn" onClick={handleAudio} disabled={loading || !audioFile}>
            Index audio
          </button>
          {statuses.audio && (
            <div className={`status-msg ${statuses.audio.kind}`}>{statuses.audio.msg}</div>
          )}
        </div>

        {/* Video */}
        <div className="ingest-block">
          <div className="ingest-head">
            <div className="ingest-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </div>
            <span className="ingest-label">Video file</span>
          </div>
          <p className="ingest-note">.mp4 · .mov — frames captioned via BLIP, audio transcribed via Whisper.</p>
          <label className={`file-drop ${videoFile ? "chosen" : ""}`}>
            <input
              type="file"
              accept="video/*"
              style={{ display: "none" }}
              onChange={e => setVideoFile(e.target.files[0])}
            />
            <span className="file-drop-text">
              {videoFile ? videoFile.name : "Click to choose a video file"}
            </span>
          </label>
          <button className="primary-btn" onClick={handleVideo} disabled={loading || !videoFile}>
            Index video
          </button>
          {statuses.video && (
            <div className={`status-msg ${statuses.video.kind}`}>{statuses.video.msg}</div>
          )}
        </div>
      </div>
    </div>
  );
}
