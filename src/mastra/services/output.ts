import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { Buffer } from "node:buffer";
import { fileURLToPath } from "node:url";
import type { ClipWithImage } from "../types";

export interface OutputPaths {
  baseDir: string;
  imagesDir: string;
  audioDir: string;
  videosDir: string;
}

// Get project root directory (3 levels up from this file: services -> mastra -> src -> root)
function getProjectRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFile);
  return join(currentDir, "..", "..", "..");
}

export async function createOutputDirs(
  projectName: string
): Promise<OutputPaths> {
  const timestamp = Date.now();
  const safeName = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const baseDir = join(getProjectRoot(), "output", `${safeName}-${timestamp}`);
  const imagesDir = join(baseDir, "images");
  const audioDir = join(baseDir, "audio");
  const videosDir = join(baseDir, "videos");

  await mkdir(imagesDir, { recursive: true });
  await mkdir(audioDir, { recursive: true });
  await mkdir(videosDir, { recursive: true });

  return { baseDir, imagesDir, audioDir, videosDir };
}

export async function saveClipImage(
  clip: ClipWithImage,
  imagesDir: string
): Promise<string> {
  const filename = `clip-${String(clip.index).padStart(2, "0")}-${clip.clipType}.png`;
  const filePath = join(imagesDir, filename);

  const imageBuffer = Buffer.from(clip.imageData, "base64");
  await writeFile(filePath, imageBuffer);

  return filePath;
}

export async function saveClipAudio(
  clipIndex: number,
  audioData: Buffer,
  audioDir: string
): Promise<string> {
  const filename = `clip-${String(clipIndex).padStart(2, "0")}.mp3`;
  const filePath = join(audioDir, filename);

  await writeFile(filePath, audioData);

  return filePath;
}

export async function saveManifest(
  baseDir: string,
  manifest: {
    title: string;
    clips: Array<{
      index: number;
      clipType: string;
      title: string;
      narration: string;
      imagePath: string;
      audioPath?: string;
    }>;
  }
): Promise<string> {
  const filePath = join(baseDir, "manifest.json");
  await writeFile(filePath, JSON.stringify(manifest, null, 2));
  return filePath;
}
