import { ProcessedResult } from "../types";

const MAX_FILE_SIZE_MB = 19; // Safe limit below 20MB for inline

export const processAudioWithGemini = async (
  file: File
): Promise<ProcessedResult> => {
  const formData = new FormData();
  formData.append('audio', file);

  try {
    const response = await fetch('http://localhost:3001/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.statusText}`);
    }

    const result = await response.json();
    return result as ProcessedResult;
  } catch (error) {
    console.error("Transcription Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "An unknown error occurred while processing the audio."
    );
  }
};

export const validateFile = (file: File): string | null => {
  const validTypes = ["audio/mp3", "audio/mpeg", "video/mp4", "audio/mp4", "audio/wav"];
  if (!validTypes.includes(file.type)) {
    return "Invalid file format. Please upload MP3 or MP4.";
  }

  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    return `File too large (${fileSizeMB.toFixed(1)}MB). Limit is ~${MAX_FILE_SIZE_MB}MB for this demo.`;
  }

  return null;
};
