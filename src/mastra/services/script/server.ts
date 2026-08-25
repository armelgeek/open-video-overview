import type { Request, Response } from "express";
import { z } from "zod";
import { enhanceScriptWithAudioTags } from "./index";

const ScriptWebhookPayloadSchema = z.object({
  eventId: z.string().uuid(),
  callbackUrl: z.string().url(),
  data: z.object({
    narration: z.string(),
    narrativeStyle: z.string().optional(),
  }),
  timestamp: z.string().datetime(),
});

export function createScriptServiceEndpoint(app: any) {
  app.post("/webhooks/enhance-script", async (req: Request, res: Response) => {
    const { eventId, callbackUrl, data } = req.body;

    try {
      ScriptWebhookPayloadSchema.parse(req.body);
    } catch (error) {
      return res.status(400).json({
        error: "Invalid payload",
        details: error instanceof Error ? error.message : String(error),
      });
    }

    res.status(202).json({ eventId, status: "accepted" });

    (async () => {
      try {
        console.log(`[ScriptService] Enhancing script for event ${eventId}...`);
        const enhancedNarration = await enhanceScriptWithAudioTags(
          null,
          data.narration,
          data.narrativeStyle || "natural and engaging"
        );

        console.log(`[ScriptService] Script enhanced for event ${eventId}`);

        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            status: "completed",
            data: { enhancedNarration },
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`[ScriptService] Error for event ${eventId}: ${message}`);

        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            status: "failed",
            error: {
              code: "SCRIPT_ENHANCEMENT_FAILED",
              message,
            },
            timestamp: new Date().toISOString(),
          }),
        });
      }
    })();
  });
}
