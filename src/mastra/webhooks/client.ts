import type { WebhookEvent, WebhookResponse, EventRecord } from "./types";
import { EventStore } from "./event-store";
import type { WebhookRegistry } from "./registry";

export class WebhookClient {
  private eventStore = new EventStore();
  private registry: WebhookRegistry;
  private pendingCallbacks = new Map<
    string,
    {
      resolve: (response: WebhookResponse) => void;
      reject: (error: Error) => void;
      timeout: NodeJS.Timeout;
    }
  >();

  constructor(registry: WebhookRegistry) {
    this.registry = registry;
  }

  async emit(event: WebhookEvent): Promise<WebhookResponse> {
    // Create event record
    this.eventStore.create(event);
    this.eventStore.incrementAttempts(event.eventId);

    // Setup timeout promise
    const response = new Promise<WebhookResponse>((resolve, reject) => {
      const timeoutMs = event.timeout || 300000;
      const timeout = setTimeout(() => {
        this.pendingCallbacks.delete(event.eventId);
        this.eventStore.markTimeout(event.eventId);
        reject(
          new Error(
            `Webhook timeout after ${timeoutMs}ms for event ${event.eventId}`
          )
        );
      }, timeoutMs);

      this.pendingCallbacks.set(event.eventId, {
        resolve,
        reject,
        timeout,
      });
    });

    // Process event (sync or async depending on handler)
    this.processEvent(event).catch((error) => {
      const pending = this.pendingCallbacks.get(event.eventId);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingCallbacks.delete(event.eventId);
        this.eventStore.markFailed(event.eventId, error.message);
        pending.reject(error);
      }
    });

    return response;
  }

  private async processEvent(event: WebhookEvent): Promise<void> {
    const handler = this.registry.getHandler(event.type);
    if (!handler) {
      throw new Error(`No handler registered for event type: ${event.type}`);
    }

    try {
      const result = await handler(event.data);
      console.log(
        `[WebhookClient] Event ${event.eventId} (${event.type}) processed`
      );

      // Resolve callback with result
      this.resolveCallback(event.eventId, {
        eventId: event.eventId,
        status: "completed",
        data: result as Record<string, unknown>,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Handler failed for ${event.type}: ${message}`);
    }
  }

  resolveCallback(eventId: string, response: WebhookResponse): void {
    const pending = this.pendingCallbacks.get(eventId);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingCallbacks.delete(eventId);

      if (response.status === "completed") {
        this.eventStore.markCompleted(eventId, response);
        pending.resolve(response);
      } else {
        this.eventStore.markFailed(
          eventId,
          response.error?.message || "Unknown error"
        );
        pending.reject(
          new Error(response.error?.message || "Webhook request failed")
        );
      }
    }
  }

  getEventStatus(eventId: string): EventRecord | undefined {
    return this.eventStore.getStatus(eventId);
  }

  getAllEvents(): EventRecord[] {
    return this.eventStore.getAllEvents();
  }

  getDeadLetterQueue(): EventRecord[] {
    return this.eventStore.getDeadLetterQueue();
  }
}
