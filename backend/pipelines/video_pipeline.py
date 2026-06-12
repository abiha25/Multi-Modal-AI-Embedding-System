import uuid
import os
import whisper
from moviepy.editor import VideoFileClip
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration
from embedder import get_embedding
from vectorstore import store_embedding
import torch

# Load models once
whisper_model = whisper.load_model("base")
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained(
    "Salesforce/blip-image-captioning-base"
)

def extract_frames(video_path: str, interval_sec: int = 5) -> list[Image.Image]:
    """Extract one frame every `interval_sec` seconds."""
    clip = VideoFileClip(video_path)
    frames = []
    for t in range(0, int(clip.duration), interval_sec):
        frame = clip.get_frame(t)
        frames.append(Image.fromarray(frame))
    clip.close()
    return frames

def caption_frames(frames: list[Image.Image]) -> list[str]:
    """Generate captions for each frame using BLIP."""
    captions = []
    for frame in frames:
        inputs = blip_processor(frame, return_tensors="pt")
        with torch.no_grad():
            output = blip_model.generate(**inputs, max_new_tokens=50)
        caption = blip_processor.decode(output[0], skip_special_tokens=True)
        captions.append(caption)
    return captions

def extract_audio_from_video(video_path: str) -> str:
    """Extract audio track and save as wav."""
    audio_path = video_path.replace(".mp4", "_audio.wav").replace(".mov", "_audio.wav")
    clip = VideoFileClip(video_path)
    if clip.audio:
        clip.audio.write_audiofile(audio_path, verbose=False, logger=None)
    clip.close()
    return audio_path

def ingest_video(file_path: str, filename: str) -> dict:
    """Video pipeline with per-segment timestamp indexing."""

    # Step 1: Extract frames with timestamps
    clip = VideoFileClip(file_path)
    duration = int(clip.duration)
    interval = 5

    frame_data = []
    for t in range(0, duration, interval):
        frame = clip.get_frame(t)
        img = Image.fromarray(frame)
        inputs = blip_processor(img, return_tensors="pt")
        with torch.no_grad():
            output = blip_model.generate(**inputs, max_new_tokens=50)
        caption = blip_processor.decode(output[0], skip_special_tokens=True)
        frame_data.append({"t": t, "caption": caption})
    clip.close()

    # Step 2: Transcribe audio with segments
    audio_path = file_path.replace(".mp4", "_audio.wav").replace(".mov", "_audio.wav")
    clip2 = VideoFileClip(file_path)
    seg_transcripts = []
    if clip2.audio:
        clip2.audio.write_audiofile(audio_path, verbose=False, logger=None)
        result = whisper_model.transcribe(audio_path)
        seg_transcripts = result.get("segments", [])
    clip2.close()

    # Step 3: Index each 5-second chunk with its timestamp
    ids = []
    for fd in frame_data:
        t_start = fd["t"]
        t_end = min(t_start + interval, duration)

        # Find whisper segments overlapping this window
        spoken = " ".join(
            s["text"].strip() for s in seg_transcripts
            if s["start"] < t_end and s["end"] > t_start
        )

        combined = f"Visual: {fd['caption']}."
        if spoken:
            combined += f" Audio: {spoken}"

        embedding = get_embedding(combined)
        doc_id = str(uuid.uuid4())
        store_embedding(doc_id, embedding, combined, {
            "modality": "video", "filename": filename,
            "file_path": file_path,
            "captions": fd["caption"],
            "transcript": spoken,
            "timestamp_start": t_start,
            "timestamp_end": t_end,
            "preview": f"[{t_start}s → {t_end}s] {combined[:250]}"
        })
        ids.append(doc_id)

    return {"id": ids[0] if ids else "", "status": "indexed",
            "modality": "video", "segments": len(ids)}