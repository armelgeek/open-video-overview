import type { WebhookEvent, WebhookResponse, EventRecord } from "./types";

export class EventStore {
  private events: Map<string, EventRecord> = new Map();

  create(event: WebhookEvent): EventRecord {
    const record: EventRecord = {
      eventId: event.eventId,
      type: event.type,
      status: "pending",
      attempts: 0,
      createdAt: new Date().toISOString(),
    };
    this.events.set(event.eventId, record);
    return record;
  }

  getStatus(eventId: string): EventRecord | undefined {
    return this.events.get(eventId);
  }

  markCompleted(eventId: string, response: WebhookResponse): void {
    const record = this.events.get(eventId);
    if (record) {
      record.status = "completed";
      record.completedAt = new Date().toISOString();
      record.result = response;
    }
  }

  markFailed(eventId: string, error: string): void {
    const record = this.events.get(eventId);
    if (record) {
      record.status = "failed";
      record.lastError = error;
      record.completedAt = new Date().toISOString();
    }
  }

  markTimeout(eventId: string): void {
    const record = this.events.get(eventId);
    if (record) {
      record.status = "timeout";
      record.completedAt = new Date().toISOString();
      record.lastError = "Webhook request timeout";
    }
  }

  incrementAttempts(eventId: string): void {
    const record = this.events.get(eventId);
    if (record) {
      record.attempts++;
    }
  }

  getDeadLetterQueue(): EventRecord[] {
    return Array.from(this.events.values()).filter(
      (r) => r.status === "failed" || r.status === "timeout"
    );
  }

  getAllEvents(): EventRecord[] {
    return Array.from(this.events.values());
  }

  clear(): void {
    this.events.clear();
  }
}
