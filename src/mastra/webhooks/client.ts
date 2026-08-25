import type { WebhookEvent, WebhookResponse, EventRecord } from "./types";
import { EventStore } from "./event-store";
import { WebhookRegistry } from "./registry";

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

    // Emit to service
    this.emitToService(event).catch((error) => {
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

  private async emitToService(event: WebhookEvent): Promise<void> {
    const serviceConfig = this.registry.getServiceConfig(event.type);
    if (!serviceConfig) {
      throw new Error(`No service configured for event type: ${event.type}`);
    }

    const url = `${serviceConfig.url}${serviceConfig.webhookPath}`;
    const maxRetries = serviceConfig.maxRetries || 3;
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < maxRetries) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        });

        if (!response.ok) {
          throw new Error(
            `Service returned ${response.status}: ${response.statusText}`
          );
        }

        console.log(
          `[WebhookClient] Event ${event.eventId} accepted by ${event.type}`
        );
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempt++;

        if (attempt < maxRetries) {
          const backoffMs = (event.retryConfig?.backoffMs || 1000) * attempt;
          console.log(
            `[WebhookClient] Retry ${attempt}/${maxRetries} after ${backoffMs}ms`
          );
          await new Promise((r) => setTimeout(r, backoffMs));
        }
      }
    }

    if (lastError) {
      throw new Error(
        `Failed to emit event after ${maxRetries} attempts: ${lastError.message}`
      );
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
