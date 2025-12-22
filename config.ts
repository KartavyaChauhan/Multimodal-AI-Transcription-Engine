/**
 * Centralized configuration for Southbridge Transcriber
 * 
 * This file contains all configurable parameters in one place,
 * making it easy to adjust behavior without hunting through code.
 */

// ===========================================
// AUDIO PROCESSING
// ===========================================

/**
 * Duration of audio chunks in minutes.
 * Longer = fewer API calls but higher risk of AI "drift" (losing context).
 * Shorter = more API calls but better timestamp accuracy.
 * Recommended: 15-20 minutes for optimal balance.
 */
export const CHUNK_DURATION_MINUTES = 20;
export const CHUNK_DURATION_SECONDS = CHUNK_DURATION_MINUTES * 60;

/**
 * Audio bitrate for extraction (kbps).
 * 128k is sufficient for speech; higher values waste bandwidth.
 */
export const AUDIO_BITRATE = '128k';

/**
 * Supported input formats.
 * Video formats are converted to audio before processing.
 */
export const SUPPORTED_VIDEO_FORMATS = ['.mp4', '.mkv', '.avi', '.mov', '.webm'];
export const SUPPORTED_AUDIO_FORMATS = ['.mp3', '.wav', '.m4a', '.flac', '.ogg'];
export const SUPPORTED_FORMATS = [...SUPPORTED_VIDEO_FORMATS, ...SUPPORTED_AUDIO_FORMATS];

// ===========================================
// AI MODEL CONFIGURATION
// ===========================================

/**
 * Gemini models to try, in order of preference.
 * If a model hits quota (429), we automatically try the next one.
 * 
 * Note: Model names change frequently. Check Google's docs if errors occur.
 * Last updated: December 2025
 */
export const CANDIDATE_MODELS = [
  "models/gemini-2.5-flash",      // Fastest, try first
  "models/gemini-2.0-flash",      // Fallback 1
  "models/gemini-2.5-pro",        // More capable, slower
  "models/gemini-2.0-flash-lite"  // Lightweight fallback
];

/**
 * System prompt for transcription.
 * Instructs the AI on output format and behavior.
 */
export const TRANSCRIPTION_PROMPT = `
You are an expert transcription assistant. 
Your task is to transcribe the audio provided perfectly, including speaker diarization and timestamps.

OUTPUT RULES:
1. Output MUST be valid JSON.
2. Structure: Array of objects: { "speaker": "Speaker 1", "start": "MM:SS", "text": "..." }
3. Identify distinct speakers.
4. Do not summarize. Transcribe verbatim.
`;

// ===========================================
// OUTPUT CONFIGURATION
// ===========================================

/**
 * Default minimum subtitle duration in seconds.
 * Ensures subtitles don't flash too quickly.
 */
export const MIN_SUBTITLE_DURATION = 1;

/**
 * Default duration for the last subtitle (seconds).
 * Since we don't know when audio ends, we assume this duration.
 */
export const LAST_SUBTITLE_DURATION = 3;

// ===========================================
// LIMITATIONS & KNOWN ISSUES
// ===========================================

/**
 * KNOWN LIMITATIONS:
 * 
 * 1. SPEAKER ACCURACY: AI may misidentify speakers in:
 *    - Crosstalk (multiple people talking at once)
 *    - Similar-sounding voices
 *    - Background noise or music
 * 
 * 2. TIMESTAMP PRECISION: Timestamps are approximate (±2 seconds)
 *    - Long audio may experience "drift"
 *    - Chunking helps but doesn't eliminate this
 * 
 * 3. LANGUAGE: Currently optimized for English
 *    - Other languages may have reduced accuracy
 *    - No automatic language detection
 * 
 * 4. FILE SIZE: Gemini has limits:
 *    - Max ~2GB per file upload
 *    - Very long files (>3 hours) may timeout
 * 
 * 5. AUDIO QUALITY: Poor audio = poor transcription
 *    - Phone recordings may have issues
 *    - Recommended: Clear speech, minimal background noise
 */
