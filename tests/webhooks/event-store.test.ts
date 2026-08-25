import { describe, it, expect, beforeEach } from "vitest";
import { EventStore } from "../../src/mastra/webhooks/event-store";
import type { WebhookEvent, WebhookResponse } from "../../src/mastra/webhooks/types";

describe("EventStore", () => {
  let store: EventStore;

  beforeEach(() => {
    store = new EventStore();
  });

  it("should create and track an event", () => {
    const event: WebhookEvent = {
      eventId: crypto.randomUUID(),
      type: "image.generate",
      callbackUrl: "http://localhost:3000/callback",
      data: { prompt: "test" },
      timestamp: new Date().toISOString(),
    };

    const record = store.create(event);
    expect(record.status).toBe("pending");
    expect(record.attempts).toBe(0);
  });

  it("should retrieve event status", () => {
    const eventId = crypto.randomUUID();
    const event: WebhookEvent = {
      eventId,
      type: "image.generate",
      callbackUrl: "http://localhost:3000/callback",
      data: {},
      timestamp: new Date().toISOString(),
    };

    store.create(event);
    const status = store.getStatus(eventId);
    expect(status?.status).toBe("pending");
  });

  it("should mark event as completed", () => {
    const eventId = crypto.randomUUID();
    const event: WebhookEvent = {
      eventId,
      type: "image.generate",
      callbackUrl: "http://localhost:3000/callback",
      data: {},
      timestamp: new Date().toISOString(),
    };

    store.create(event);
    const response: WebhookResponse = {
      eventId,
      status: "completed",
      data: { imageData: "base64..." },
      timestamp: new Date().toISOString(),
    };

    store.markCompleted(eventId, response);
    const status = store.getStatus(eventId);
    expect(status?.status).toBe("completed");
    expect(status?.result?.data?.imageData).toBe("base64...");
  });

  it("should track failed events", () => {
    const eventId = crypto.randomUUID();
    const event: WebhookEvent = {
      eventId,
      type: "image.generate",
      callbackUrl: "http://localhost:3000/callback",
      data: {},
      timestamp: new Date().toISOString(),
    };

    store.create(event);
    store.markFailed(eventId, "Image generation failed");
    const status = store.getStatus(eventId);
    expect(status?.status).toBe("failed");
    expect(status?.lastError).toBe("Image generation failed");
  });

  it("should track attempts", () => {
    const eventId = crypto.randomUUID();
    const event: WebhookEvent = {
      eventId,
      type: "image.generate",
      callbackUrl: "http://localhost:3000/callback",
      data: {},
      timestamp: new Date().toISOString(),
    };

    store.create(event);
    store.incrementAttempts(eventId);
    store.incrementAttempts(eventId);
    const status = store.getStatus(eventId);
    expect(status?.attempts).toBe(2);
  });

  it("should retrieve dead letter queue events", () => {
    const eventId1 = crypto.randomUUID();
    const event1: WebhookEvent = {
      eventId: eventId1,
      type: "image.generate",
      callbackUrl: "http://localhost:3000/callback",
      data: {},
      timestamp: new Date().toISOString(),
    };

    store.create(event1);
    store.markFailed(eventId1, "Max retries exceeded");

    const dlq = store.getDeadLetterQueue();
    expect(dlq.length).toBe(1);
    expect(dlq[0].eventId).toBe(eventId1);
  });
});
