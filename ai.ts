import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';
import ora from 'ora';
import chalk from 'chalk';

// The "Fallback" strategy - using current model names (Dec 2025)
const CANDIDATE_MODELS = [
  "models/gemini-2.5-flash",
  "models/gemini-2.0-flash",
  "models/gemini-2.5-pro",
  "models/gemini-2.0-flash-lite"
];

const SYSTEM_PROMPT = `
You are an expert transcription assistant. 
Your task is to transcribe the audio provided perfectly, including speaker diarization and timestamps.

OUTPUT RULES:
1. Output MUST be valid JSON.
2. Structure: Array of objects: { "speaker": "Speaker 1", "start": "MM:SS", "text": "..." }
3. Identify distinct speakers.
4. Do not summarize. Transcribe verbatim.
`;

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private fileManager: GoogleAIFileManager;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.fileManager = new GoogleAIFileManager(apiKey);
  }

  /**
   * Uploads the file and waits for it to be ready (ACTIVE state).
   */
  async uploadMedia(filePath: string, mimeType: string = 'audio/mp3'): Promise<string> {
    const spinner = ora('Uploading audio to Gemini...').start();
    
    try {
      const uploadResponse = await this.fileManager.uploadFile(filePath, {
        mimeType,
        displayName: "Southbridge Audio",
      });
      
      const fileUri = uploadResponse.file.uri;
      const fileName = uploadResponse.file.name;
      spinner.text = 'Processing audio on Google servers...';

      // Poll until state is ACTIVE
      let file = await this.fileManager.getFile(fileName);
      while (file.state === FileState.PROCESSING) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s
        file = await this.fileManager.getFile(fileName);
      }

      if (file.state === FileState.FAILED) {
        throw new Error("Audio processing failed on Google's side.");
      }

      spinner.succeed('Audio ready for analysis.');
      return fileUri;
    } catch (error) {
      spinner.fail('Upload failed.');
      throw error;
    }
  }

  /**
   * Transcribes the audio using the retry/fallback logic.
   */
  async transcribe(fileUri: string): Promise<any> {
    const spinner = ora('Transcribing with Gemini...').start();

    for (const modelName of CANDIDATE_MODELS) {
      spinner.text = `Trying model: ${modelName}...`;
      
      try {
        const model = this.genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent([
          { fileData: { mimeType: "audio/mp3", fileUri } },
          { text: SYSTEM_PROMPT }
        ]);

        const responseText = result.response.text();
        spinner.succeed(chalk.green(`Success with ${modelName}`));
        return JSON.parse(responseText);

      } catch (error: any) {
        const errorMsg = error.message?.toLowerCase() || '';
        // Check for Quota/Rate limit errors
        const isQuotaError = 
          errorMsg.includes('429') || 
          errorMsg.includes('503') ||
          errorMsg.includes('quota') ||
          errorMsg.includes('rate limit') ||
          errorMsg.includes('resource_exhausted') ||
          errorMsg.includes('overloaded');
        
        if (isQuotaError) {
          spinner.warn(chalk.yellow(`Quota hit on ${modelName}. Switching...`));
          // Wait a bit before trying next model
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue; // Try next model
        } else {
          // If it's a real error (like bad request), fail immediately
          spinner.fail(`Error on ${modelName}: ${error.message}`);
          throw error;
        }
      }
    }

    throw new Error("All models exhausted. Please try again later.");
  }
}
