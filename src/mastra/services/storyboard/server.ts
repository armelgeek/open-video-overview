import type { Request, Response } from "express";
import { z } from "zod";
import { generateOverallStoryboard } from "./index";

const StoryboardWebhookPayloadSchema = z.object({
  eventId: z.string().uuid(),
  callbackUrl: z.string().url(),
  data: z.object({
    content: z.string(),
    style: z.string().optional(),
    format: z.string().optional(),
    language: z.string().optional(),
    customInstructions: z.string().optional(),
    narrativeStyle: z.string().optional(),
  }),
  timestamp: z.string().datetime(),
});

export function createStoryboardServiceEndpoint(app: any) {
  app.post("/webhooks/storyboard", async (req: Request, res: Response) => {
    const { eventId, callbackUrl, data } = req.body;

    try {
      StoryboardWebhookPayloadSchema.parse(req.body);
    } catch (error) {
      return res.status(400).json({
        error: "Invalid payload",
        details: error instanceof Error ? error.message : String(error),
      });
    }

    res.status(202).json({ eventId, status: "accepted" });

    (async () => {
      try {
        console.log(
          `[StoryboardService] Generating storyboard for event ${eventId}...`
        );
        const storyboard = await generateOverallStoryboard(
          null,
          data.content,
          data.style,
          data.format,
          data.language,
          data.customInstructions,
          data.narrativeStyle
        );

        console.log(
          `[StoryboardService] Storyboard generated for event ${eventId}`
        );

        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            status: "completed",
            data: storyboard,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `[StoryboardService] Error for event ${eventId}: ${message}`
        );

        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            status: "failed",
            error: {
              code: "STORYBOARD_GENERATION_FAILED",
              message,
            },
            timestamp: new Date().toISOString(),
          }),
        });
      }
    })();
  });
}
