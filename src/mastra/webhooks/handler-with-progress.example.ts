/**
 * Example: Using progress tracker in webhook handlers
 *
 * Add this to your handler to emit progress updates:
 */

import { progressTracker } from "./progress-tracker";

export async function handleImageGenerationWithProgress(
  eventId: string,
  data: any
) {
  // Emit: Started
  progressTracker.emit({
    eventId,
    type: "image.generate",
    status: "started",
    progress: 0,
    message: "Starting image generation...",
    timestamp: new Date().toISOString(),
  });

  try {
    // Emit: Processing
    progressTracker.emit({
      eventId,
      type: "image.generate",
      status: "processing",
      progress: 25,
      message: "Validating prompt...",
      timestamp: new Date().toISOString(),
    });

    // ... some work ...
    await new Promise((r) => setTimeout(r, 1000));

    progressTracker.emit({
      eventId,
      type: "image.generate",
      status: "processing",
      progress: 50,
      message: "Generating image...",
      timestamp: new Date().toISOString(),
    });

    // ... more work ...
    const imageData = "base64...";
    await new Promise((r) => setTimeout(r, 2000));

    progressTracker.emit({
      eventId,
      type: "image.generate",
      status: "processing",
      progress: 75,
      message: "Encoding result...",
      timestamp: new Date().toISOString(),
    });

    // ... final work ...
    await new Promise((r) => setTimeout(r, 500));

    // Emit: Completed
    progressTracker.emit({
      eventId,
      type: "image.generate",
      status: "completed",
      progress: 100,
      message: "Image generation complete!",
      data: { imageData },
      timestamp: new Date().toISOString(),
    });

    return { imageData };
  } catch (error) {
    // Emit: Failed
    progressTracker.emit({
      eventId,
      type: "image.generate",
      status: "failed",
      progress: 0,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}

/**
 * To use this in the initializer:
 *
 * import { handleImageGenerationWithProgress } from "./handler-with-progress.example";
 *
 * export function initializeWebhookHandlers(registry: WebhookRegistry): void {
 *   registry.registerHandler("image.generate", async (data) => {
 *     const eventId = ... // get from context
 *     return handleImageGenerationWithProgress(eventId, data);
 *   });
 * }
 */
