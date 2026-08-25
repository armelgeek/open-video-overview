import type { WebhookEvent, WebhookResponse } from "./types";

export type WebhookHandler = (data: unknown) => Promise<unknown>;

export class WebhookRegistry {
  private handlers: Map<string, WebhookHandler> = new Map();

  registerHandler(type: string, handler: WebhookHandler): void {
    this.handlers.set(type, handler);
    console.log(`[Registry] Registered handler: ${type}`);
  }

  getHandler(type: string): WebhookHandler | undefined {
    return this.handlers.get(type);
  }

  hasHandler(type: string): boolean {
    return this.handlers.has(type);
  }

  getAllHandlers(): Map<string, WebhookHandler> {
    return new Map(this.handlers);
  }
}
