import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { stat, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import type { AspectRatio } from "../types";

const execFileAsync = promisify(execFile);

const OUTPUT_FPS = 30; // Output frame rate

// Output sizes based on aspect ratio
const OUTPUT_SIZES: Record<AspectRatio, string> = {
  "16:9": "1920x1080",
  "9:16": "1080x1920",
};

export async function combineImageAndAudio(
  imagePath: string,
  audioPath: string,
  outputDir: string,
  clipIndex: number,
  aspectRatio: AspectRatio
): Promise<string> {
  const outputPath = path.join(
    outputDir,
    `clip-${String(clipIndex).padStart(2, "0")}.mp4`
  );

  // Get audio duration using ffprobe
  const { stdout: durationOutput } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    audioPath,
  ]);
  const audioDuration = parseFloat(durationOutput.trim());
  const totalFrames = Math.ceil(audioDuration * OUTPUT_FPS);

  // Get output size based on aspect ratio
  const outputSize = OUTPUT_SIZES[aspectRatio];

  // Zoompan filter: static image (no zoom effect)
  const zoompanFilter = [
    `zoompan=z='1.0'`,
    `x='iw/2-(iw/zoom/2)'`,
    `y='ih/2-(ih/zoom/2)'`,
    `d=${totalFrames}`,
    `s=${outputSize}`,
    `fps=${OUTPUT_FPS}`,
  ].join(":");

  // Combine image + audio into video using ffmpeg
  await execFileAsync("ffmpeg", [
    "-y", // overwrite output
    "-i",
    imagePath,
    "-i",
    audioPath,
    "-vf",
    zoompanFilter,
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-pix_fmt",
    "yuv420p",
    "-shortest",
    outputPath,
  ]);

  // Verify output exists
  await stat(outputPath);

  return outputPath;
}

export async function concatenateClips(
  clipVideoPaths: string[],
  outputDir: string,
  title: string
): Promise<string> {
  const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const outputPath = path.join(outputDir, `${safeName}-final.mp4`);
  const concatListPath = path.join(outputDir, "concat-list.txt");

  // Create concat file for ffmpeg
  // Format: file 'path/to/video.mp4'
  const concatContent = clipVideoPaths.map((p) => `file '${p}'`).join("\n");
  await writeFile(concatListPath, concatContent);

  // Concatenate all clips using ffmpeg concat demuxer
  await execFileAsync("ffmpeg", [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatListPath,
    "-c",
    "copy",
    outputPath,
  ]);

  // Clean up concat list file
  await unlink(concatListPath);

  // Verify output exists
  await stat(outputPath);

  return outputPath;
}
