import { useState } from "react";
import { Wordmark } from "../App";

const API = "http://localhost:8000";

function IngestCard({ icon, label, note, children }) {
  return (
    <div className="ingest-card">
      <div className="ingest-card-head">
        <div className="ingest-card-icon">{icon}</div>
        <div className="ingest-card-info">
          <div className="ingest-card-label">{label}</div>
          <div className="ingest-card-note">{note}</div>
        </div>
      </div>
      <div className="ingest-card-body">{children}</div>
    </div>
  );
}

function StatusMsg({ status }) {
  if (!status) return null;
  return <div className={`status ${status.kind}`}>{status.msg}</div>;
}

export default function UploadPanel({ onBack }) {
  const [loading,      setLoading]      = useState(false);
  const [textContent,  setTextContent]  = useState("");
  const [textName,     setTextName]     = useState("");
  const [audioFile,    setAudioFile]    = useState(null);
  const [videoFile,    setVideoFile]    = useState(null);
  const [statuses,     setStatuses]     = useState({ text: null, audio: null, video: null });

  const setStatus = (type, msg, kind) =>
    setStatuses(s => ({ ...s, [type]: { msg, kind } }));

  const upload = async (formData, endpoint, type) => {
    setLoading(true);
    setStatus(type, "Processing — this may take a moment…", "wait");
    try {
      const res  = await fetch(`${API}/${endpoint}`, { method: "POST", body: formData });
      const data = await res.json();
      const chunks = data.chunks ? ` · ${data.chunks} chunk${data.chunks > 1 ? "s" : ""}` : "";
      setStatus(type, `Indexed — ${data.modality}${chunks} · ID ${String(data.id).slice(0, 8)}`, "ok");
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

  const TextIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );

  const AudioIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );

  const VideoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  );

  return (
    <div className="page">
      <div className="topbar">
        <button className="topbar-wordmark" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <Wordmark size="sm" />
        </button>
        <div className="topbar-sep" />
        <span className="topbar-crumb">Index</span>
        <button className="back-btn" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Home
        </button>
      </div>

      <div className="page-body">
        <p className="page-eyebrow">Content ingestion</p>
        <h1 className="page-headline">Add to the index</h1>
        <p className="page-sub">Each file is chunked, embedded, and stored as vectors for semantic retrieval.</p>

        <div className="ingest-stack">

          <IngestCard
            icon={<TextIcon />}
            label="Text document"
            note="Articles, notes, transcripts, documentation — chunked automatically"
          >
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
            <button
              className="primary-btn"
              onClick={handleText}
              disabled={loading || !textContent.trim()}
            >
              Index text
            </button>
            <StatusMsg status={statuses.text} />
          </IngestCard>

          <IngestCard
            icon={<AudioIcon />}
            label="Audio file"
            note=".mp3 · .wav · .m4a — transcribed locally via Whisper, indexed by segment"
          >
            <label className={`file-drop ${audioFile ? "chosen" : ""}`}>
              <input
                type="file" accept="audio/*"
                style={{ display: "none" }}
                onChange={e => setAudioFile(e.target.files[0])}
              />
              <span className="file-drop-text">
                {audioFile ? audioFile.name : "Click to choose an audio file"}
              </span>
            </label>
            <button
              className="primary-btn"
              onClick={handleAudio}
              disabled={loading || !audioFile}
            >
              Index audio
            </button>
            <StatusMsg status={statuses.audio} />
          </IngestCard>

          <IngestCard
            icon={<VideoIcon />}
            label="Video file"
            note=".mp4 · .mov — frames captioned via BLIP, audio transcribed via Whisper"
          >
            <label className={`file-drop ${videoFile ? "chosen" : ""}`}>
              <input
                type="file" accept="video/*"
                style={{ display: "none" }}
                onChange={e => setVideoFile(e.target.files[0])}
              />
              <span className="file-drop-text">
                {videoFile ? videoFile.name : "Click to choose a video file"}
              </span>
            </label>
            <button
              className="primary-btn"
              onClick={handleVideo}
              disabled={loading || !videoFile}
            >
              Index video
            </button>
            <StatusMsg status={statuses.video} />
          </IngestCard>

        </div>
      </div>
    </div>
  );
}
