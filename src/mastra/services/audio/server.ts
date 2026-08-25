import type { Request, Response } from "express";
import { z } from "zod";
import { generateNarrationAudio } from "./index";

const AudioWebhookPayloadSchema = z.object({
  eventId: z.string().uuid(),
  callbackUrl: z.string().url(),
  data: z.object({
    narration: z.string(),
    language: z.string().optional(),
    voiceId: z.string().optional(),
  }),
  timestamp: z.string().datetime(),
});

export function createAudioServiceEndpoint(app: any) {
  app.post("/webhooks/audio", async (req: Request, res: Response) => {
    const { eventId, callbackUrl, data } = req.body;

    // Validate immediately and return 202
    try {
      AudioWebhookPayloadSchema.parse(req.body);
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
        console.log(`[AudioService] Generating audio for event ${eventId}...`);
        const audioBuffer = await generateNarrationAudio(
          data.narration,
          data.language,
          data.voiceId
        );

        // Convert buffer to base64
        const audioBase64 = Buffer.isBuffer(audioBuffer)
          ? audioBuffer.toString("base64")
          : audioBuffer;

        console.log(`[AudioService] Audio generated for event ${eventId}`);

        // POST callback
        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            status: "completed",
            data: { audioData: audioBase64 },
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`[AudioService] Error for event ${eventId}: ${message}`);

        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            status: "failed",
            error: {
              code: "AUDIO_GENERATION_FAILED",
              message,
            },
            timestamp: new Date().toISOString(),
          }),
        });
      }
    })();
  });
}
