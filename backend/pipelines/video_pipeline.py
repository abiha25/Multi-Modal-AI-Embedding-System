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
    """Full video pipeline: frames → captions + audio → transcript → embed."""
    
    # Step 1: Frame captions
    frames = extract_frames(file_path, interval_sec=5)
    captions = caption_frames(frames)
    visual_description = " | ".join(captions)
    
    # Step 2: Audio transcription
    audio_path = extract_audio_from_video(file_path)
    transcript = ""
    if os.path.exists(audio_path):
        result = whisper_model.transcribe(audio_path)
        transcript = result["text"].strip()
    
    # Step 3: Combine into rich text for embedding
    combined_text = f"Visual content: {visual_description}. Audio: {transcript}"
    
    # Step 4: Embed
    embedding = get_embedding(combined_text)
    doc_id = str(uuid.uuid4())
    
    store_embedding(
        doc_id=doc_id,
        embedding=embedding,
        text_content=combined_text,
        metadata={
            "modality": "video",
            "filename": filename,
            "file_path": file_path,
            "captions": visual_description,
            "transcript": transcript,
            "preview": combined_text[:300]
        }
    )
    return {
        "id": doc_id,
        "status": "indexed",
        "modality": "video",
        "captions": visual_description,
        "transcript": transcript
    }