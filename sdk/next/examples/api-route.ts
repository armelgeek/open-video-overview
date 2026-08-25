/**
 * Next.js App Router API route example
 * Place this at: app/api/webhooks/emit/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import type { WebhookEventPayload, WebhookResponse } from "@videooverview/sdk";

// Initialize the webhook client from the backend
// This connects to your Mastra webhook handlers
const MASTRA_BASE_URL = process.env.MASTRA_BASE_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const event: WebhookEventPayload = await request.json();

    // Validate the event
    if (!event.eventId || !event.type || !event.data) {
      return NextResponse.json(
        { error: "Invalid event payload" },
        { status: 400 }
      );
    }

    // Forward to the Mastra webhook client
    // In production, you might want to add authentication/validation here
    const response = await fetch(`${MASTRA_BASE_URL}/api/webhooks/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any authentication headers needed
        // "Authorization": `Bearer ${process.env.MASTRA_API_KEY}`,
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`Mastra API returned ${response.status}`);
    }

    const result: WebhookResponse = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API Route] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
