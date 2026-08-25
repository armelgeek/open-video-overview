import type { Request, Response } from "express";
import { z } from "zod";
import {
  combineImageAndAudio,
  concatenateClips,
} from "./index";

const VideoWebhookPayloadSchema = z.object({
  eventId: z.string().uuid(),
  callbackUrl: z.string().url(),
  data: z.object({
    imagePath: z.string().optional(),
    audioPath: z.string().optional(),
    videoPaths: z.array(z.string()).optional(),
    aspectRatio: z.string().optional(),
    title: z.string().optional(),
    outputDir: z.string().optional(),
  }),
  timestamp: z.string().datetime(),
});

export function createVideoServiceEndpoint(app: any) {
  app.post("/webhooks/combine", async (req: Request, res: Response) => {
    const { eventId, callbackUrl, data } = req.body;

    try {
      VideoWebhookPayloadSchema.parse(req.body);
    } catch (error) {
      return res.status(400).json({
        error: "Invalid payload",
        details: error instanceof Error ? error.message : String(error),
      });
    }

    res.status(202).json({ eventId, status: "accepted" });

    (async () => {
      try {
        console.log(`[VideoService] Processing video for event ${eventId}...`);

        let result: any = {};

        if (data.imagePath && data.audioPath) {
          // Combine image and audio
          const videoPath = await combineImageAndAudio(
            data.imagePath,
            data.audioPath,
            data.outputDir || "./output",
            0,
            data.aspectRatio
          );
          result = { videoPath };
        } else if (data.videoPaths && data.videoPaths.length > 0) {
          // Concatenate clips
          const finalVideoPath = await concatenateClips(
            data.videoPaths,
            data.outputDir || "./output",
            data.title || "final-video"
          );
          result = { finalVideoPath };
        }

        console.log(`[VideoService] Video processed for event ${eventId}`);

        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            status: "completed",
            data: result,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`[VideoService] Error for event ${eventId}: ${message}`);

        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            status: "failed",
            error: {
              code: "VIDEO_PROCESSING_FAILED",
              message,
            },
            timestamp: new Date().toISOString(),
          }),
        });
      }
    })();
  });
}
