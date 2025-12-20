import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';

/**
 * Extracts audio from a video file and saves it as an MP3.
 * @param videoPath - The absolute path to the input video.
 * @returns The absolute path to the extracted audio file.
 */
export async function extractAudio(videoPath: string): Promise<string> {
  const spinner = ora('Extracting audio from video...').start();
  
  // Create an output path (same folder as video, but with .mp3 extension)
  const parse = path.parse(videoPath);
  const audioPath = path.join(parse.dir, `${parse.name}.mp3`);

  // If audio already exists (from a previous run), skip extraction to save time
  if (fs.existsSync(audioPath)) {
    spinner.succeed(chalk.green(`Audio already exists: ${audioPath}`));
    return audioPath;
  }

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo() // Remove video stream
      .audioCodec('libmp3lame') // Use MP3 codec
      .audioBitrate('128k') // 128kbps is sufficient for speech
      .save(audioPath)
      .on('end', () => {
        spinner.succeed(chalk.green(`Audio extracted: ${audioPath}`));
        resolve(audioPath);
      })
      .on('error', (err) => {
        spinner.fail(chalk.red('Error extracting audio'));
        console.error(err);
        reject(err);
      });
  });
}
