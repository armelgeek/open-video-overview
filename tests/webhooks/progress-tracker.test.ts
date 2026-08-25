import { describe, it, expect, beforeEach } from "vitest";
import { ProgressTracker, type ProgressEvent } from "../../src/mastra/webhooks/progress-tracker";

describe("ProgressTracker", () => {
  let tracker: ProgressTracker;

  beforeEach(() => {
    tracker = new ProgressTracker();
  });

  it("should emit progress events", () => {
    const eventId = crypto.randomUUID();
    const event: ProgressEvent = {
      eventId,
      type: "image.generate",
      status: "processing",
      progress: 50,
      message: "Generating image...",
      timestamp: new Date().toISOString(),
    };

    tracker.emit(event);

    const lastEvent = tracker.getLastEvent(eventId);
    expect(lastEvent).toBeDefined();
    expect(lastEvent?.progress).toBe(50);
    expect(lastEvent?.message).toBe("Generating image...");
  });

  it("should track event history", () => {
    const eventId = crypto.randomUUID();

    tracker.emit({
      eventId,
      type: "image.generate",
      status: "started",
      progress: 0,
      message: "Starting...",
      timestamp: new Date().toISOString(),
    });

    tracker.emit({
      eventId,
      type: "image.generate",
      status: "processing",
      progress: 50,
      message: "Processing...",
      timestamp: new Date().toISOString(),
    });

    tracker.emit({
      eventId,
      type: "image.generate",
      status: "completed",
      progress: 100,
      message: "Complete!",
      timestamp: new Date().toISOString(),
    });

    const history = tracker.getHistory(eventId);
    expect(history).toHaveLength(3);
    expect(history[0].progress).toBe(0);
    expect(history[1].progress).toBe(50);
    expect(history[2].progress).toBe(100);
  });

  it("should subscribe to progress updates", () => {
    const eventId = crypto.randomUUID();
    const updates: ProgressEvent[] = [];

    const unsubscribe = tracker.subscribe(eventId, (event) => {
      updates.push(event);
    });

    tracker.emit({
      eventId,
      type: "image.generate",
      status: "processing",
      progress: 50,
      message: "Processing...",
      timestamp: new Date().toISOString(),
    });

    expect(updates).toHaveLength(1);
    expect(updates[0].progress).toBe(50);

    unsubscribe();

    tracker.emit({
      eventId,
      type: "image.generate",
      status: "processing",
      progress: 75,
      message: "More processing...",
      timestamp: new Date().toISOString(),
    });

    // Should not receive new updates after unsubscribe
    expect(updates).toHaveLength(1);
  });

  it("should track active events", () => {
    const eventId1 = crypto.randomUUID();
    const eventId2 = crypto.randomUUID();

    tracker.emit({
      eventId: eventId1,
      type: "image.generate",
      status: "processing",
      progress: 50,
      message: "Processing image 1...",
      timestamp: new Date().toISOString(),
    });

    tracker.emit({
      eventId: eventId2,
      type: "audio.generate",
      status: "completed",
      progress: 100,
      message: "Audio complete",
      timestamp: new Date().toISOString(),
    });

    const active = tracker.getActive();
    expect(active.size).toBe(1);
    expect(active.has(eventId1)).toBe(true);
    expect(active.has(eventId2)).toBe(false);
  });

  it("should clear history", () => {
    const eventId = crypto.randomUUID();

    tracker.emit({
      eventId,
      type: "image.generate",
      status: "processing",
      progress: 50,
      message: "Processing...",
      timestamp: new Date().toISOString(),
    });

    let history = tracker.getHistory(eventId);
    expect(history).toHaveLength(1);

    tracker.clear(eventId);

    history = tracker.getHistory(eventId);
    expect(history).toHaveLength(0);
  });

  it("should handle multiple listeners", () => {
    const eventId = crypto.randomUUID();
    const updates1: ProgressEvent[] = [];
    const updates2: ProgressEvent[] = [];

    tracker.subscribe(eventId, (event) => {
      updates1.push(event);
    });

    tracker.subscribe(eventId, (event) => {
      updates2.push(event);
    });

    tracker.emit({
      eventId,
      type: "image.generate",
      status: "processing",
      progress: 50,
      message: "Processing...",
      timestamp: new Date().toISOString(),
    });

    expect(updates1).toHaveLength(1);
    expect(updates2).toHaveLength(1);
  });
});
