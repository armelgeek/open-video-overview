/**
 * HTTP API handler for webhook events
 * Can be used with Express or other HTTP frameworks
 */

import type { Request, Response } from "express";
import type { WebhookEventPayload, WebhookResponse } from "./types";
import { WebhookClient } from "./client";
import { WebhookRegistry } from "./registry";
import { WebhookEventSchema } from "./schemas";

export async function handleWebhookEmit(
  req: Request,
  res: Response,
  webhookClient: WebhookClient
) {
  try {
    // Validate request body
    const event: WebhookEventPayload = WebhookEventSchema.parse(req.body);

    console.log(`[API] Received event: ${event.type} (${event.eventId})`);

    // Emit the event via webhook client
    const response = await webhookClient.emit(event);

    res.status(200).json({
      eventId: event.eventId,
      status: "completed",
      data: response.data,
      timestamp: new Date().toISOString(),
    } as WebhookResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[API] Error: ${message}`);

    res.status(400).json({
      error: message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Example: Register API endpoint with Express
 */
export function setupWebhookApi(
  app: any,
  webhookClient: WebhookClient,
  webhookRegistry: WebhookRegistry
) {
  app.post("/api/webhooks/emit", (req: Request, res: Response) => {
    handleWebhookEmit(req, res, webhookClient);
  });

  console.log("[API] Webhook API endpoint registered at /api/webhooks/emit");
}
