import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { CHUNK_DURATION_SECONDS } from './config';

/**
 * Gets the duration of a media file in seconds.
 */
async function getDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    // ffprobe comes bundled with most ffmpeg installs
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const duration = metadata.format.duration;
      if (!duration) return reject(new Error('Could not determine file duration'));
      resolve(duration);
    });
  });
}

/**
 * Splits the audio file into smaller chunks.
 * Returns an array of paths to the chunk files.
 * @param audioPath - Path to the audio file
 * @param chunkDuration - Duration of each chunk in seconds (default from config)
 */
export async function splitAudio(audioPath: string, chunkDuration: number = CHUNK_DURATION_SECONDS): Promise<string[]> {
  const spinner = ora('Checking audio duration...').start();
  
  try {
    const duration = await getDuration(audioPath);
    
    // If file is short, skip splitting logic
    if (duration <= chunkDuration) {
      spinner.succeed('Audio is short enough. No splitting needed.');
      return [audioPath];
    }

    const totalChunks = Math.ceil(duration / chunkDuration);
    spinner.text = `Long audio detected (${Math.floor(duration/60)}m). Splitting into ${totalChunks} chunks...`;
    
    const chunks: string[] = [];
    const parse = path.parse(audioPath);
    const outputDir = path.join(parse.dir, `${parse.name}_chunks`);

    // Create a folder for chunks so we don't clutter the root
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    for (let i = 0; i < totalChunks; i++) {
      const startTime = i * chunkDuration;
      const chunkFileName = `part_${i + 1}${parse.ext}`;
      const chunkPath = path.join(outputDir, chunkFileName);
      
      chunks.push(chunkPath);

      // Skip if chunk already exists (Resuming previous run)
      if (fs.existsSync(chunkPath)) {
        continue;
      }

      await new Promise<void>((resolve, reject) => {
        ffmpeg(audioPath)
          .setStartTime(startTime)
          .setDuration(chunkDuration)
          .audioCodec('copy') // Fast copy, no re-encoding quality loss
          .save(chunkPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err));
      });
    }

    spinner.succeed(chalk.green(`Successfully split into ${chunks.length} parts in /${parse.name}_chunks`));
    return chunks;

  } catch (error) {
    spinner.fail('Failed to split audio.');
    throw error;
  }
}
