import { describe, it, expect, beforeEach } from "vitest";
import { WebhookClient } from "../../src/mastra/webhooks/client";
import { WebhookRegistry } from "../../src/mastra/webhooks/registry";
import { progressTracker } from "../../src/mastra/webhooks/progress-tracker";

describe("Webhook Integration", () => {
  let client: WebhookClient;
  let registry: WebhookRegistry;

  beforeEach(() => {
    registry = new WebhookRegistry();
    client = new WebhookClient(registry);
    progressTracker.clear();
  });

  it("should emit event and get response", async () => {
    const eventId = crypto.randomUUID();

    // Register a simple handler
    registry.registerHandler("test.operation", async (data) => {
      return { result: "success", input: data };
    });

    const response = await client.emit({
      eventId,
      type: "test.operation",
      callbackUrl: "",
      data: { message: "hello" },
      timestamp: new Date().toISOString(),
    });

    expect(response.status).toBe("completed");
    expect(response.data?.result).toBe("success");
    expect(response.data?.input).toEqual({ message: "hello" });
  });

  it("should handle handler errors", async () => {
    const eventId = crypto.randomUUID();

    registry.registerHandler("test.failing", async () => {
      throw new Error("Handler failed");
    });

    await expect(
      client.emit({
        eventId,
        type: "test.failing",
        callbackUrl: "",
        data: {},
        timestamp: new Date().toISOString(),
      })
    ).rejects.toThrow("Handler failed");
  });

  it("should track event in store", async () => {
    const eventId = crypto.randomUUID();

    registry.registerHandler("test.track", async (data) => {
      return { tracked: true };
    });

    const promise = client.emit({
      eventId,
      type: "test.track",
      callbackUrl: "",
      data: {},
      timestamp: new Date().toISOString(),
    });

    const status = client.getEventStatus(eventId);
    expect(status?.status).toBe("pending");

    await promise;

    const finalStatus = client.getEventStatus(eventId);
    expect(finalStatus?.status).toBe("completed");
  });

  it("should emit progress during handler execution", async () => {
    const eventId = crypto.randomUUID();
    const progressUpdates: number[] = [];

    // Subscribe to progress
    progressTracker.subscribe(eventId, (event) => {
      progressUpdates.push(event.progress);
    });

    // Register handler that emits progress
    registry.registerHandler("test.progress", async (data) => {
      progressTracker.emit({
        eventId,
        type: "test.progress",
        status: "started",
        progress: 0,
        message: "Starting...",
        timestamp: new Date().toISOString(),
      });

      await new Promise((r) => setTimeout(r, 10));

      progressTracker.emit({
        eventId,
        type: "test.progress",
        status: "processing",
        progress: 50,
        message: "Half way...",
        timestamp: new Date().toISOString(),
      });

      await new Promise((r) => setTimeout(r, 10));

      progressTracker.emit({
        eventId,
        type: "test.progress",
        status: "completed",
        progress: 100,
        message: "Done!",
        timestamp: new Date().toISOString(),
      });

      return { success: true };
    });

    await client.emit({
      eventId,
      type: "test.progress",
      callbackUrl: "",
      data: {},
      timestamp: new Date().toISOString(),
    });

    expect(progressUpdates).toContain(0);
    expect(progressUpdates).toContain(50);
    expect(progressUpdates).toContain(100);
  });

  it("should handle timeout", async () => {
    const eventId = crypto.randomUUID();

    registry.registerHandler("test.slow", async () => {
      // Never resolves
      return new Promise(() => {});
    });

    await expect(
      client.emit({
        eventId,
        type: "test.slow",
        callbackUrl: "",
        data: {},
        timestamp: new Date().toISOString(),
        timeout: 50, // Very short timeout for testing
      })
    ).rejects.toThrow("timeout");

    const status = client.getEventStatus(eventId);
    expect(status?.status).toBe("timeout");
  });

  it("should support multiple sequential events", async () => {
    registry.registerHandler("test.seq", async (data: any) => {
      return { sequence: data.num };
    });

    for (let i = 1; i <= 3; i++) {
      const response = await client.emit({
        eventId: crypto.randomUUID(),
        type: "test.seq",
        callbackUrl: "",
        data: { num: i },
        timestamp: new Date().toISOString(),
      });

      expect(response.data?.sequence).toBe(i);
    }

    const allEvents = client.getAllEvents();
    expect(allEvents).toHaveLength(3);
  });

  it("should get dead letter queue for failed events", async () => {
    registry.registerHandler("test.fail", async () => {
      throw new Error("Always fails");
    });

    // Emit a failing event
    await expect(
      client.emit({
        eventId: crypto.randomUUID(),
        type: "test.fail",
        callbackUrl: "",
        data: {},
        timestamp: new Date().toISOString(),
      })
    ).rejects.toThrow();

    const dlq = client.getDeadLetterQueue();
    expect(dlq.length).toBeGreaterThan(0);
    expect(dlq[0].status).toBe("failed");
  });
});
