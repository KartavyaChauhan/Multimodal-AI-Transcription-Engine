# 🐸 Southbridge Transcriber

A multimodal transcription and diarization tool that uses Google's Gemini AI to convert video/audio files into accurate, timestamped subtitles with speaker identification.

## Features

- **Video & Audio Support**: Accepts MP4, MKV, AVI, MOV, WebM, MP3, WAV, M4A, FLAC, OGG
- **Speaker Diarization**: Automatically identifies and labels different speakers
- **Accurate Timestamps**: Timestamps with automatic drift correction for long files
- **Smart Chunking**: Splits long audio into manageable pieces to prevent AI drift
- **Model Fallback**: Automatically switches Gemini models if quota is hit
- **Intermediate Saving**: Saves raw AI responses for debugging and inspection
- **SRT Output**: Generates industry-standard subtitle files

## Installation

```bash
# Clone the repository
git clone https://github.com/KartavyaChauhan/southbridge-transcriber.git
cd southbridge-transcriber

# Install dependencies
bun install
```

## Configuration

1. Create a `.env` file in the project root:
```
GEMINI_API_KEY=your_api_key_here
```

2. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Usage

```bash
# Basic usage
bun run index.ts <video_or_audio_file>

# Examples
bun run index.ts interview.mp4
bun run index.ts podcast.mp3

# With API key flag (alternative to .env)
bun run index.ts video.mp4 --key YOUR_API_KEY
```

## Output

The tool generates:
- `{filename}.srt` - Subtitle file with timestamps and speaker labels
- `.southbridge_intermediates/{filename}/` - Raw AI responses for debugging

## Project Structure

```
southbridge-transcriber/
├── index.ts          # CLI entry point & main pipeline
├── config.ts         # Centralized configuration
├── audio.ts          # FFmpeg audio extraction
├── splitter.ts       # Audio chunking for long files
├── ai.ts             # Gemini AI client with fallback logic
├── formatting.ts     # SRT file generation
└── .env              # API key (not committed)
```

## Pipeline Flow

```
Input (video/audio)
    ↓
Audio Extraction (FFmpeg)
    ↓
Chunking (20-min segments)
    ↓
AI Transcription (Gemini)
    ↓
Timestamp Correction
    ↓
SRT Generation
```

## Configuration Options

All configurable parameters are in `config.ts`:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `CHUNK_DURATION_MINUTES` | 20 | Length of audio chunks |
| `AUDIO_BITRATE` | 128k | Audio quality for extraction |
| `CANDIDATE_MODELS` | gemini-2.5-flash, etc. | AI models to try |
| `MIN_SUBTITLE_DURATION` | 1 sec | Minimum subtitle display time |

## Supported Formats

**Video**: `.mp4`, `.mkv`, `.avi`, `.mov`, `.webm`  
**Audio**: `.mp3`, `.wav`, `.m4a`, `.flac`, `.ogg`

## Known Limitations

1. **Speaker Accuracy**: May misidentify speakers in crosstalk or with similar voices
2. **Timestamp Precision**: Approximate ±2 seconds, especially in long files
3. **Language**: Optimized for English; other languages may have reduced accuracy
4. **File Size**: Max ~2GB per upload; very long files (>3 hours) may timeout
5. **Audio Quality**: Poor recordings = poor transcription

## Error Handling

The tool handles:
- Missing files with clear error messages
- Unsupported formats with format hints
- API quota limits with automatic model fallback
- Network failures with graceful exit

## Dependencies

- [Bun](https://bun.sh) - JavaScript runtime
- [FFmpeg](https://ffmpeg.org) - Audio/video processing
- [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) - Gemini AI SDK
- [Commander](https://www.npmjs.com/package/commander) - CLI framework
- [Chalk](https://www.npmjs.com/package/chalk) - Terminal styling
- [Ora](https://www.npmjs.com/package/ora) - Terminal spinners

## License

ISC
