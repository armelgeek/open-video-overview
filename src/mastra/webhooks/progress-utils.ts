/**
 * Utility functions for calculating progress based on steps/images
 */

export interface ProgressStep {
  current: number; // Current step (1-based)
  total: number; // Total steps
  status: "starting" | "processing" | "completed";
  message: string;
}

/**
 * Calculate overall progress percentage from steps
 * Example: 3 images done out of 5 = 60%
 */
export function calculateProgress(step: ProgressStep): number {
  const baseProgress = Math.round((step.current / step.total) * 100);
  return Math.min(baseProgress, 100);
}

/**
 * Generate progress message for image generation
 */
export function getImageProgressMessage(step: ProgressStep): string {
  if (step.status === "starting") {
    return `Preparing to generate image ${step.current}/${step.total}...`;
  }

  if (step.status === "processing") {
    return `Generating image ${step.current}/${step.total}: ${step.message}`;
  }

  return `Image ${step.current}/${step.total} complete`;
}

/**
 * Generate progress message for clip generation (image + audio)
 */
export function getClipProgressMessage(
  step: ProgressStep,
  substep?: "image" | "audio" | "combine"
): string {
  const substepText =
    substep === "image"
      ? "generating image"
      : substep === "audio"
        ? "generating audio"
        : substep === "combine"
          ? "combining"
          : "processing";

  if (step.status === "starting") {
    return `Preparing clip ${step.current}/${step.total}...`;
  }

  if (step.status === "processing") {
    return `Clip ${step.current}/${step.total}: ${substepText}`;
  }

  return `Clip ${step.current}/${step.total} complete`;
}

/**
 * Calculate progress for multi-stage operations
 * Example: image (0-33%), audio (33-66%), combine (66-100%)
 */
export function calculateMultiStageProgress(
  clipIndex: number,
  totalClips: number,
  stage: "image" | "audio" | "combine"
): number {
  // Base progress from clip completion
  const clipProgress = (clipIndex / totalClips) * 100;

  // Add stage progress within current clip
  const stageProgress = stage === "image" ? 0.2 : stage === "audio" ? 0.5 : 0.8;
  const clipStageProgress = (1 / totalClips) * stageProgress * 100;

  return Math.round(clipProgress + clipStageProgress);
}

/**
 * Generate detailed message for clip generation with stage
 */
export function getClipDetailedMessage(
  clipIndex: number,
  totalClips: number,
  clipTitle: string,
  stage: "image" | "audio" | "combine"
): string {
  const stageText =
    stage === "image"
      ? "Generating image"
      : stage === "audio"
        ? "Generating audio"
        : "Combining image + audio";

  return `Clip ${clipIndex}/${totalClips} [${clipTitle}]: ${stageText}`;
}
