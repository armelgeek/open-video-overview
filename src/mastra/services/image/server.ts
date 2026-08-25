import type { Request, Response } from "express";
import { z } from "zod";
import { generateImage } from "./index";

const ImageWebhookPayloadSchema = z.object({
  eventId: z.string().uuid(),
  callbackUrl: z.string().url(),
  data: z.object({
    prompt: z.string(),
    aspectRatio: z.string().optional(),
    style: z.string().optional(),
  }),
  timestamp: z.string().datetime(),
});

export function createImageServiceEndpoint(app: any) {
  app.post("/webhooks/image", async (req: Request, res: Response) => {
    const { eventId, callbackUrl, data } = req.body;

    // Validate immediately and return 202
    try {
      ImageWebhookPayloadSchema.parse(req.body);
    } catch (error) {
      return res.status(400).json({
        error: "Invalid payload",
        details: error instanceof Error ? error.message : String(error),
      });
    }

    res.status(202).json({ eventId, status: "accepted" });

    // Process async
    (async () => {
      try {
        console.log(`[ImageService] Generating image for event ${eventId}...`);
        const imageData = await generateImage(
          data.prompt,
          data.aspectRatio,
          data.style
        );

        console.log(`[ImageService] Image generated for event ${eventId}`);

        // POST callback
        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            status: "completed",
            data: { imageData },
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`[ImageService] Error for event ${eventId}: ${message}`);

        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            status: "failed",
            error: {
              code: "IMAGE_GENERATION_FAILED",
              message,
            },
            timestamp: new Date().toISOString(),
          }),
        });
      }
    })();
  });
}
