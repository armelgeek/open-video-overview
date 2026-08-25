import { describe, it, expect, beforeEach, vi } from "vitest";
import { createCallbackHandler } from "../../src/mastra/webhooks/callback-handler";
import type { WebhookClient } from "../../src/mastra/webhooks/client";

describe("Callback Handler", () => {
  let mockClient: WebhookClient;
  let handler: any;

  beforeEach(() => {
    mockClient = {
      resolveCallback: vi.fn(),
    } as any;

    handler = createCallbackHandler(mockClient);
  });

  it("should handle valid callback", async () => {
    const eventId = crypto.randomUUID();
    const req = {
      body: {
        eventId,
        status: "completed" as const,
        data: { imageData: "base64..." },
        timestamp: new Date().toISOString(),
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await handler(req as any, res as any);

    expect(mockClient.resolveCallback).toHaveBeenCalledWith(eventId, req.body);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should reject invalid callback", async () => {
    const req = {
      body: {
        // Missing required fields
        status: "completed",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
