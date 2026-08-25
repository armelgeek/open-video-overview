import { describe, it, expect, beforeEach, vi } from "vitest";
import { WebhookClient } from "../../src/mastra/webhooks/client";
import { WebhookRegistry } from "../../src/mastra/webhooks/registry";

describe("WebhookClient", () => {
  let client: WebhookClient;
  let registry: WebhookRegistry;

  beforeEach(() => {
    registry = new WebhookRegistry();
    client = new WebhookClient(registry);
  });

  it("should emit an event and wait for callback", async () => {
    const eventId = crypto.randomUUID();
    const callbackUrl = "http://localhost:3000/callback";
    const promise = client.emit({
      eventId,
      type: "image.generate",
      callbackUrl,
      data: { prompt: "test" },
      timestamp: new Date().toISOString(),
      timeout: 5000,
    });

    // Simulate service callback
    setTimeout(() => {
      client.resolveCallback(eventId, {
        eventId,
        status: "completed",
        data: { imageData: "base64..." },
        timestamp: new Date().toISOString(),
      });
    }, 100);

    const response = await promise;
    expect(response.status).toBe("completed");
    expect(response.data?.imageData).toBe("base64...");
  });

  it("should handle timeout", async () => {
    const eventId = crypto.randomUUID();
    const promise = client.emit({
      eventId,
      type: "image.generate",
      callbackUrl: "http://localhost:3000/callback",
      data: {},
      timestamp: new Date().toISOString(),
      timeout: 100,
    });

    // Deliberately don't call resolveCallback
    let errorMessage = "";
    try {
      await promise;
    } catch (e) {
      errorMessage = (e as Error).message;
    }
    expect(errorMessage).toContain("Webhook timeout");
  });

  it("should track event in store", async () => {
    const eventId = crypto.randomUUID();
    const promise = client.emit({
      eventId,
      type: "image.generate",
      callbackUrl: "http://localhost:3000/callback",
      data: {},
      timestamp: new Date().toISOString(),
      timeout: 5000,
    });

    const status = client.getEventStatus(eventId);
    expect(status?.status).toBe("pending");

    // Resolve
    client.resolveCallback(eventId, {
      eventId,
      status: "completed",
      data: {},
      timestamp: new Date().toISOString(),
    });

    await promise;
    const finalStatus = client.getEventStatus(eventId);
    expect(finalStatus?.status).toBe("completed");
  });
});
