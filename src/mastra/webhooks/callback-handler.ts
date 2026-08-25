import type { Request, Response } from "express";
import type { WebhookClient } from "./client";
import { WebhookResponseSchema } from "./schemas";

export function createCallbackHandler(webhookClient: WebhookClient) {
  return async (req: Request, res: Response) => {
    try {
      // Validate callback response
      const validated = WebhookResponseSchema.parse(req.body);

      // Resolve pending callback
      webhookClient.resolveCallback(validated.eventId, validated);

      console.log(
        `[CallbackHandler] Received callback for event ${validated.eventId}`
      );
      res.status(200).json({ received: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid callback payload";
      console.error(`[CallbackHandler] Error: ${message}`);
      res.status(400).json({ error: message });
    }
  };
}
