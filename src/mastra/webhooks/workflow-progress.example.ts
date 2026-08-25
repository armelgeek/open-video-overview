/**
 * Example: Using progress tracking in video generation workflow
 *
 * Shows how to track progress image-by-image as clips are generated
 */

import { progressTracker } from "./progress-tracker";
import {
  calculateMultiStageProgress,
  getClipDetailedMessage,
  calculateProgress,
  getClipProgressMessage,
} from "./progress-utils";

interface Clip {
  index: number;
  title: string;
  narration: string;
}

export async function generateClipsWithProgress(
  eventId: string,
  clips: Clip[]
) {
  // Start
  progressTracker.emit({
    eventId,
    type: "video.generate",
    status: "started",
    progress: 0,
    message: `Starting to generate ${clips.length} clips...`,
    timestamp: new Date().toISOString(),
  });

  const totalClips = clips.length;

  for (let i = 0; i < clips.length; i++) {
    const clipIndex = i + 1;
    const clip = clips[i];

    // ============================================
    // STAGE 1: Generate Image
    // ============================================

    progressTracker.emit({
      eventId,
      type: "video.generate",
      status: "processing",
      progress: calculateMultiStageProgress(clipIndex - 1, totalClips, "image"),
      message: getClipDetailedMessage(
        clipIndex,
        totalClips,
        clip.title,
        "image"
      ),
      data: {
        stage: "image",
        clip: clipIndex,
        totalClips,
        clipTitle: clip.title,
      },
      timestamp: new Date().toISOString(),
    });

    // Actually generate image
    const imageData = await generateImage(clip.narration);
    console.log(`✓ Image ${clipIndex}/${totalClips} generated`);

    // ============================================
    // STAGE 2: Generate Audio
    // ============================================

    progressTracker.emit({
      eventId,
      type: "video.generate",
      status: "processing",
      progress: calculateMultiStageProgress(clipIndex - 1, totalClips, "audio"),
      message: getClipDetailedMessage(
        clipIndex,
        totalClips,
        clip.title,
        "audio"
      ),
      data: {
        stage: "audio",
        clip: clipIndex,
        totalClips,
        clipTitle: clip.title,
      },
      timestamp: new Date().toISOString(),
    });

    // Actually generate audio
    const audioData = await generateAudio(clip.narration);
    console.log(`✓ Audio ${clipIndex}/${totalClips} generated`);

    // ============================================
    // STAGE 3: Combine Image + Audio
    // ============================================

    progressTracker.emit({
      eventId,
      type: "video.generate",
      status: "processing",
      progress: calculateMultiStageProgress(
        clipIndex - 1,
        totalClips,
        "combine"
      ),
      message: getClipDetailedMessage(
        clipIndex,
        totalClips,
        clip.title,
        "combine"
      ),
      data: {
        stage: "combine",
        clip: clipIndex,
        totalClips,
        clipTitle: clip.title,
      },
      timestamp: new Date().toISOString(),
    });

    // Actually combine
    const videoPath = await combineImageAndAudio(imageData, audioData);
    console.log(`✓ Clip ${clipIndex}/${totalClips} complete`);

    // Update overall progress (simple version)
    const overallProgress = Math.round((clipIndex / totalClips) * 100);
    progressTracker.emit({
      eventId,
      type: "video.generate",
      status: "processing",
      progress: overallProgress,
      message: `Completed ${clipIndex}/${totalClips} clips`,
      data: {
        clipsCompleted: clipIndex,
        totalClips,
        currentClipTitle: clip.title,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // ============================================
  // FINAL STAGE: Concatenate all clips
  // ============================================

  progressTracker.emit({
    eventId,
    type: "video.generate",
    status: "processing",
    progress: 95,
    message: "Concatenating all clips into final video...",
    data: {
      stage: "concatenate",
      clipsCount: totalClips,
    },
    timestamp: new Date().toISOString(),
  });

  // Actually concatenate
  const finalVideoPath = await concatenateAllClips(
    clips.map((_, i) => `clip_${i}.mp4`)
  );

  // ============================================
  // COMPLETE
  // ============================================

  progressTracker.emit({
    eventId,
    type: "video.generate",
    status: "completed",
    progress: 100,
    message: "Video generation complete!",
    data: {
      finalVideoPath,
      clipsGenerated: totalClips,
      duration: "2m 30s",
    },
    timestamp: new Date().toISOString(),
  });

  return { finalVideoPath };
}

// Stub functions for this example
async function generateImage(narration: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1000));
  return "base64-image-data";
}

async function generateAudio(narration: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1500));
  return "base64-audio-data";
}

async function combineImageAndAudio(
  image: string,
  audio: string
): Promise<string> {
  await new Promise((r) => setTimeout(r, 1000));
  return "video-file-path.mp4";
}

async function concatenateAllClips(paths: string[]): Promise<string> {
  await new Promise((r) => setTimeout(r, 2000));
  return "final-video.mp4";
}

/**
 * Usage in the initializer:
 *
 * registry.registerHandler("video.generate", async (data) => {
 *   const eventId = data.eventId;
 *   return generateClipsWithProgress(eventId, data.clips);
 * });
 */
