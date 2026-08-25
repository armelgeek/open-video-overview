import type { Request, Response } from "express";
import { z } from "zod";
import { compactContext } from "./index";

const SummarizationWebhookPayloadSchema = z.object({
  eventId: z.string().uuid(),
  callbackUrl: z.string().url(),
  data: z.object({
    content: z.string(),
    maxLength: z.number().optional(),
  }),
  timestamp: z.string().datetime(),
});

export function createSummarizationServiceEndpoint(app: any) {
  app.post("/webhooks/summarize", async (req: Request, res: Response) => {
    const { eventId, callbackUrl, data } = req.body;

    try {
      SummarizationWebhookPayloadSchema.parse(req.body);
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
          `[SummarizationService] Summarizing content for event ${eventId}...`
        );
        const summary = await compactContext(null, data.content);

        console.log(
          `[SummarizationService] Content summarized for event ${eventId}`
        );

        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            status: "completed",
            data: { summary },
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `[SummarizationService] Error for event ${eventId}: ${message}`
        );

        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            status: "failed",
            error: {
              code: "SUMMARIZATION_FAILED",
              message,
            },
            timestamp: new Date().toISOString(),
          }),
        });
      }
    })();
  });
}
