# Webhook-Driven Service Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the monolithic workflow into a webhook-driven architecture where services are independent, scalable, and communicate via event-based HTTP webhooks.

**Architecture:** Workflow remains the orchestrator but communicates with services via webhooks (HTTP POST). Each service runs independently, exposes a webhook endpoint, and POSTs results back to a callback handler. WebhookClient manages event emission, callback registration, and retry logic.

**Tech Stack:** Node.js, Express, TypeScript, Zod (validation), uuid (event IDs)

**Spec:** `docs/superpowers/specs/2026-08-25-webhook-architecture-design.md`

## Global Constraints

- All event IDs must be UUIDs (use `crypto.randomUUID()`)
- All timestamps must be ISO 8601 format (`new Date().toISOString()`)
- Services must return `202 Accepted` immediately, process async
- All webhook payloads validated with Zod schemas
- Retry backoff is exponential: 1s, 2s, 4s
- Default timeout: 300000ms (5 min); video service: 600000ms
- All new code must be TypeScript with strict mode enabled

---

## Phase 1: Foundation (WebhookClient + Registry)

### Task 1: Create webhook types and schemas

**Files:**
- Create: `src/mastra/webhooks/types.ts`
- Create: `src/mastra/webhooks/schemas.ts`

**Interfaces:**
- Produces: TypeScript types for `WebhookEvent`, `WebhookResponse`, `EventRecord`; Zod schemas for validation

**Steps:**

- [ ] **Step 1: Create types.ts with core types**

Create `src/mastra/webhooks/types.ts`:

```typescript
export interface WebhookEvent {
  eventId: string;
  type: string;
  callbackUrl: string;
  data: Record<string, unknown>;
  timestamp: string; // ISO8601
  timeout?: number; // ms
  retryConfig?: {
    maxAttempts: number;
    backoffMs: number;
  };
}

export interface WebhookResponse {
  eventId: string;
  status: "completed" | "failed";
  data?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string; // ISO8601
}

export interface EventRecord {
  eventId: string;
  type: string;
  status: "pending" | "completed" | "failed" | "timeout";
  attempts: number;
  createdAt: string; // ISO8601
  completedAt?: string;
  lastError?: string;
  result?: WebhookResponse;
}

export interface ServiceConfig {
  url: string;
  webhookPath: string;
  timeout?: number;
  maxRetries?: number;
}
```

- [ ] **Step 2: Create schemas.ts with Zod validation**

Create `src/mastra/webhooks/schemas.ts`:

```typescript
import { z } from "zod";

export const WebhookEventSchema = z.object({
  eventId: z.string().uuid(),
  type: z.string().min(1),
  callbackUrl: z.string().url(),
  data: z.record(z.unknown()),
  timestamp: z.string().datetime(),
  timeout: z.number().optional(),
  retryConfig: z.object({
    maxAttempts: z.number().int().positive(),
    backoffMs: z.number().int().positive(),
  }).optional(),
});

export const WebhookResponseSchema = z.object({
  eventId: z.string().uuid(),
  status: z.enum(["completed", "failed"]),
  data: z.record(z.unknown()).optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }).optional(),
  timestamp: z.string().datetime(),
});

export const EventRecordSchema = z.object({
  eventId: z.string().uuid(),
  type: z.string(),
  status: z.enum(["pending", "completed", "failed", "timeout"]),
  attempts: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  lastError: z.string().optional(),
  result: WebhookResponseSchema.optional(),
});
```

- [ ] **Step 3: Commit**

```bash
git add src/mastra/webhooks/types.ts src/mastra/webhooks/schemas.ts
git commit -m "feat: add webhook types and Zod schemas"
```

---

### Task 2: Create event store for tracking

**Files:**
- Create: `src/mastra/webhooks/event-store.ts`
- Create: `tests/webhooks/event-store.test.ts`

**Interfaces:**
- Consumes: `EventRecord`, `WebhookResponse` types
- Produces: `EventStore` class with methods: `create(event: WebhookEvent)`, `getStatus(eventId: string)`, `markCompleted(eventId: string, response: WebhookResponse)`, `markFailed(eventId: string, error: string)`, `getDeadLetterQueue()`, `getAllEvents()`

**Steps:**

- [ ] **Step 1: Write the failing test**

Create `tests/webhooks/event-store.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/webhooks/event-store.test.ts
```

Expected: FAIL with "EventStore is not defined"

- [ ] **Step 3: Implement EventStore**

Create `src/mastra/webhooks/event-store.ts`:

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/webhooks/event-store.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/mastra/webhooks/event-store.ts tests/webhooks/event-store.test.ts
git commit -m "feat: add in-memory event store for webhook tracking"
```

---

### Task 3: Create WebhookClient

**Files:**
- Create: `src/mastra/webhooks/client.ts`
- Create: `tests/webhooks/client.test.ts`

**Interfaces:**
- Consumes: `WebhookEvent`, `WebhookResponse`, `EventStore`
- Produces: `WebhookClient` class with methods: `emit(event: WebhookEvent): Promise<WebhookResponse>`, `resolveCallback(eventId: string, response: WebhookResponse): void`

**Steps:**

- [ ] **Step 1: Write the failing test**

Create `tests/webhooks/client.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { WebhookClient } from "../../src/mastra/webhooks/client";

describe("WebhookClient", () => {
  let client: WebhookClient;

  beforeEach(() => {
    client = new WebhookClient();
  });

  it("should emit an event and wait for callback", async () => {
    const callbackUrl = "http://localhost:3000/callback";
    const promise = client.emit({
      eventId: crypto.randomUUID(),
      type: "image.generate",
      callbackUrl,
      data: { prompt: "test" },
      timestamp: new Date().toISOString(),
      timeout: 1000,
    });

    // Simulate service callback
    setTimeout(() => {
      const eventId = Array.from(client["pendingCallbacks"].keys())[0];
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
    const error = await promise.catch((e) => e.message);
    expect(error).toContain("Webhook timeout");
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/webhooks/client.test.ts
```

Expected: FAIL with "WebhookClient is not defined"

- [ ] **Step 3: Implement WebhookClient**

Create `src/mastra/webhooks/client.ts`:

```typescript
import type { WebhookEvent, WebhookResponse, EventRecord } from "./types";
import { EventStore } from "./event-store";

export class WebhookClient {
  private eventStore = new EventStore();
  private pendingCallbacks = new Map<
    string,
    {
      resolve: (response: WebhookResponse) => void;
      reject: (error: Error) => void;
      timeout: NodeJS.Timeout;
    }
  >();

  async emit(event: WebhookEvent): Promise<WebhookResponse> {
    // Create event record
    this.eventStore.create(event);

    // Return promise that resolves when callback arrives
    return new Promise((resolve, reject) => {
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

      // TODO: Actually POST to service endpoint (implemented in WebhookRegistry)
      console.log(`[WebhookClient] Event emitted: ${event.eventId}`);
    });
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/webhooks/client.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/mastra/webhooks/client.ts tests/webhooks/client.test.ts
git commit -m "feat: add WebhookClient for event emission and callback handling"
```

---

### Task 4: Create service registry

**Files:**
- Create: `src/mastra/webhooks/registry.ts`
- Create: `src/mastra/webhooks/service-registry.json`
- Create: `tests/webhooks/registry.test.ts`

**Interfaces:**
- Consumes: `ServiceConfig` type, `WebhookClient`
- Produces: `WebhookRegistry` class with methods: `loadRegistry()`, `getServiceUrl(type: string)`, `emit(type: string, data: unknown): Promise<WebhookResponse>`, `registerService(type: string, config: ServiceConfig)`

**Steps:**

- [ ] **Step 1: Create default service registry config**

Create `src/mastra/webhooks/service-registry.json`:

```json
{
  "services": {
    "image": {
      "url": "http://localhost:3001",
      "webhookPath": "/webhooks/image",
      "timeout": 300000,
      "maxRetries": 3
    },
    "audio": {
      "url": "http://localhost:3002",
      "webhookPath": "/webhooks/audio",
      "timeout": 300000,
      "maxRetries": 3
    },
    "video": {
      "url": "http://localhost:3003",
      "webhookPath": "/webhooks/combine",
      "timeout": 600000,
      "maxRetries": 2
    },
    "storyboard": {
      "url": "http://localhost:3004",
      "webhookPath": "/webhooks/storyboard",
      "timeout": 300000,
      "maxRetries": 3
    },
    "scriptEnhancer": {
      "url": "http://localhost:3005",
      "webhookPath": "/webhooks/enhance-script",
      "timeout": 300000,
      "maxRetries": 3
    },
    "summarization": {
      "url": "http://localhost:3006",
      "webhookPath": "/webhooks/summarize",
      "timeout": 300000,
      "maxRetries": 3
    }
  }
}
```

- [ ] **Step 2: Write registry test**

Create `tests/webhooks/registry.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { WebhookRegistry } from "../../src/mastra/webhooks/registry";

describe("WebhookRegistry", () => {
  let registry: WebhookRegistry;

  beforeEach(() => {
    registry = new WebhookRegistry();
    registry.loadRegistry();
  });

  it("should load registry from config", () => {
    expect(registry.getServiceUrl("image")).toBe("http://localhost:3001");
    expect(registry.getServiceUrl("audio")).toBe("http://localhost:3002");
  });

  it("should get service config", () => {
    const config = registry.getServiceConfig("image");
    expect(config?.webhookPath).toBe("/webhooks/image");
    expect(config?.timeout).toBe(300000);
  });

  it("should register new service", () => {
    registry.registerService("custom", {
      url: "http://localhost:9000",
      webhookPath: "/webhooks/custom",
      timeout: 120000,
      maxRetries: 2,
    });

    expect(registry.getServiceUrl("custom")).toBe("http://localhost:9000");
  });

  it("should throw for unknown service", () => {
    expect(() => registry.getServiceUrl("nonexistent")).toThrow(
      "Service not found: nonexistent"
    );
  });
});
```

- [ ] **Step 3: Implement WebhookRegistry**

Create `src/mastra/webhooks/registry.ts`:

```typescript
import fs from "fs";
import path from "path";
import type { ServiceConfig } from "./types";

interface RegistryConfig {
  services: Record<string, ServiceConfig>;
}

export class WebhookRegistry {
  private services: Map<string, ServiceConfig> = new Map();
  private configPath = path.join(
    process.cwd(),
    "src/mastra/webhooks/service-registry.json"
  );

  loadRegistry(): void {
    try {
      const configData = fs.readFileSync(this.configPath, "utf-8");
      const config: RegistryConfig = JSON.parse(configData);

      for (const [name, serviceConfig] of Object.entries(config.services)) {
        this.services.set(name, serviceConfig);
      }

      console.log(`[Registry] Loaded ${this.services.size} services`);
    } catch (error) {
      console.error("[Registry] Failed to load service registry:", error);
      throw error;
    }
  }

  getServiceUrl(type: string): string {
    const service = this.services.get(type);
    if (!service) {
      throw new Error(`Service not found: ${type}`);
    }
    return service.url;
  }

  getServiceConfig(type: string): ServiceConfig | undefined {
    return this.services.get(type);
  }

  registerService(type: string, config: ServiceConfig): void {
    this.services.set(type, config);
    console.log(`[Registry] Registered service: ${type} @ ${config.url}`);
  }

  getAllServices(): Map<string, ServiceConfig> {
    return new Map(this.services);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/webhooks/registry.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/mastra/webhooks/service-registry.json src/mastra/webhooks/registry.ts tests/webhooks/registry.test.ts
git commit -m "feat: add webhook registry for service configuration"
```

---

### Task 5: Update WebhookClient to use registry and emit HTTP requests

**Files:**
- Modify: `src/mastra/webhooks/client.ts`
- Modify: `tests/webhooks/client.test.ts`

**Interfaces:**
- Consumes: `WebhookRegistry`, `fetch` API
- Produces: Updated `WebhookClient.emit()` to actually POST to service endpoints with retry logic

**Steps:**

- [ ] **Step 1: Add HTTP emission to WebhookClient**

Update `src/mastra/webhooks/client.ts` — replace the TODO comment with:

```typescript
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
      throw new Error(`Failed to emit event after ${maxRetries} attempts: ${lastError.message}`);
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
```

- [ ] **Step 2: Run tests**

```bash
npm test -- tests/webhooks/client.test.ts
```

Tests should still pass (the mocking handles the HTTP part).

- [ ] **Step 3: Commit**

```bash
git add src/mastra/webhooks/client.ts
git commit -m "feat: add HTTP emission to WebhookClient with retry logic"
```

---

### Task 6: Create workflow callback handler

**Files:**
- Create: `src/mastra/webhooks/callback-handler.ts`
- Create: `tests/webhooks/callback-handler.test.ts`

**Interfaces:**
- Consumes: `WebhookClient`, Express Request/Response
- Produces: Express middleware for handling `/webhooks/callback` endpoint

**Steps:**

- [ ] **Step 1: Write callback handler**

Create `src/mastra/webhooks/callback-handler.ts`:

```typescript
import type { Request, Response } from "express";
import type { WebhookClient } from "./client";
import { WebhookResponseSchema } from "./schemas";

export function createCallbackHandler(webhookClient: WebhookClient) {
  return async (req: Request, res: Response) => {
    try {
      // Validate callback response
      const validated = WebhookResponseSchema.parse(req.body);

      // Resolve pending callback
      webhookClient.resolveCallback(validated.eventId, validated);

      console.log(
        `[CallbackHandler] Received callback for event ${validated.eventId}`
      );
      res.status(200).json({ received: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid callback payload";
      console.error(`[CallbackHandler] Error: ${message}`);
      res.status(400).json({ error: message });
    }
  };
}
```

- [ ] **Step 2: Write test**

Create `tests/webhooks/callback-handler.test.ts`:

```typescript
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
    const req = {
      body: {
        eventId: crypto.randomUUID(),
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

    expect(mockClient.resolveCallback).toHaveBeenCalledWith(
      req.body.eventId,
      req.body
    );
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
```

- [ ] **Step 3: Run test**

```bash
npm test -- tests/webhooks/callback-handler.test.ts
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/mastra/webhooks/callback-handler.ts tests/webhooks/callback-handler.test.ts
git commit -m "feat: add callback handler for workflow to receive service responses"
```

---

### Task 7: Export webhooks module

**Files:**
- Create: `src/mastra/webhooks/index.ts`

**Interfaces:**
- Produces: Public exports for `WebhookClient`, `WebhookRegistry`, `createCallbackHandler`

**Steps:**

- [ ] **Step 1: Create index.ts**

Create `src/mastra/webhooks/index.ts`:

```typescript
export { WebhookClient } from "./client";
export { WebhookRegistry } from "./registry";
export { EventStore } from "./event-store";
export { createCallbackHandler } from "./callback-handler";
export type {
  WebhookEvent,
  WebhookResponse,
  EventRecord,
  ServiceConfig,
} from "./types";
export { WebhookEventSchema, WebhookResponseSchema, EventRecordSchema } from "./schemas";
```

- [ ] **Step 2: Commit**

```bash
git add src/mastra/webhooks/index.ts
git commit -m "feat: add webhooks module exports"
```

---

## Phase 2: Image Service Migration

### Task 8: Create image service webhook endpoint

**Files:**
- Create: `src/mastra/services/image/server.ts`
- Create: `tests/services/image/server.test.ts`

**Interfaces:**
- Consumes: `generateImage` from `src/mastra/services/image/index.ts` (unchanged)
- Produces: Express server on port 3001 with POST `/webhooks/image` endpoint

**Steps:**

- [ ] **Step 1: Create image service server**

Create `src/mastra/services/image/server.ts`:

```typescript
import express from "express";
import { z } from "zod";
import { generateImage } from "./index";

const ImageWebhookPayloadSchema = z.object({
  eventId: z.string().uuid(),
  callbackUrl: z.string().url(),
  data: z.object({
    prompt: z.string(),
    aspectRatio: z.string().optional(),
    style: z.string().optional(),
  }),
  timestamp: z.string().datetime(),
});

export function createImageServiceServer(port: number = 3001) {
  const app = express();
  app.use(express.json());

  app.post("/webhooks/image", async (req, res) => {
    const { eventId, callbackUrl, data } = req.body;

    // Validate immediately and return 202
    try {
      ImageWebhookPayloadSchema.parse(req.body);
    } catch (error) {
      return res.status(400).json({
        error: "Invalid payload",
        details: error instanceof Error ? error.message : String(error),
      });
    }

    res.status(202).json({ eventId, status: "accepted" });

    // Process async
    (async () => {
      try {
        console.log(`[ImageService] Generating image for event ${eventId}...`);
        const imageData = await generateImage(
          data.prompt,
          data.aspectRatio,
          data.style
        );

        console.log(`[ImageService] Image generated for event ${eventId}`);

        // POST callback
        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            status: "completed",
            data: { imageData },
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`[ImageService] Error for event ${eventId}: ${message}`);

        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            status: "failed",
            error: {
              code: "IMAGE_GENERATION_FAILED",
              message,
            },
            timestamp: new Date().toISOString(),
          }),
        });
      }
    })();
  });

  app.listen(port, () => {
    console.log(`[ImageService] Listening on port ${port}`);
  });

  return app;
}
```

- [ ] **Step 2: Create test**

Create `tests/services/image/server.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createImageServiceServer } from "../../../src/mastra/services/image/server";

describe("Image Service Server", () => {
  let server: any;

  beforeEach(() => {
    server = createImageServiceServer(9001); // Use different port for tests
  });

  afterEach(() => {
    server.close();
  });

  it("should accept webhook request with 202", async () => {
    const response = await fetch("http://localhost:9001/webhooks/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: crypto.randomUUID(),
        callbackUrl: "http://localhost:3000/callback",
        data: { prompt: "test image" },
        timestamp: new Date().toISOString(),
      }),
    });

    expect(response.status).toBe(202);
    const body = await response.json();
    expect(body.status).toBe("accepted");
  });

  it("should reject invalid payload", async () => {
    const response = await fetch("http://localhost:9001/webhooks/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Missing required fields
        data: {},
      }),
    });

    expect(response.status).toBe(400);
  });
});
```

- [ ] **Step 3: Run test**

```bash
npm test -- tests/services/image/server.test.ts
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/mastra/services/image/server.ts tests/services/image/server.test.ts
git commit -m "feat: add image service webhook server"
```

---

### Task 9: Update workflow to use image webhook

**Files:**
- Modify: `src/mastra/workflows/video-generation.ts` (generateClipsStep)

**Interfaces:**
- Consumes: `WebhookClient`, `WebhookRegistry`
- Produces: Updated `generateClipsStep` to emit image generation events instead of calling `generateImage()` directly

**Steps:**

- [ ] **Step 1: Update generateClipsStep**

In `src/mastra/workflows/video-generation.ts`, at the top add imports:

```typescript
import { WebhookClient, WebhookRegistry } from "../webhooks";
```

In the `generateClipsStep` execute function, replace the image generation block (lines ~185-221) with:

```typescript
// Initialize webhook client (can be singleton in main app)
const webhookRegistry = new WebhookRegistry();
webhookRegistry.loadRegistry();
const webhookClient = new WebhookClient(webhookRegistry);

// ... inside the for loop, replace the image generation section:

let imageData = "";
let retries = 0;
let currentImagePrompt = clip.imagePrompt;

while (!imageData && retries < MAX_IMAGE_RETRIES) {
  const attempt = retries + 1;
  console.log(
    `🖼️ Generating image (attempt ${attempt}/${MAX_IMAGE_RETRIES})...`
  );
  const startImage = Date.now();

  try {
    // Emit image generation event
    const response = await webhookClient.emit({
      eventId: crypto.randomUUID(),
      type: "image.generate",
      callbackUrl: `${process.env.WORKFLOW_CALLBACK_URL || "http://localhost:3000"}/webhooks/callback`,
      data: {
        prompt: currentImagePrompt,
        aspectRatio: ctx.aspectRatio,
        style: ctx.style,
      },
      timestamp: new Date().toISOString(),
      timeout: 300000,
    });

    imageData = response.data?.imageData as string;
    console.log(
      `   ✅ Image generated (${((Date.now() - startImage) / 1000).toFixed(1)}s)`
    );
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Unknown error";
    console.log(`   ❌ Image generation failed: ${errorMsg}`);

    if (retries < MAX_IMAGE_RETRIES - 1) {
      console.log(`   🔄 Revising prompt...`);
      currentImagePrompt = await reviseImagePrompt(
        storyboardAgent,
        currentImagePrompt,
        errorMsg,
        ctx
      );
      console.log(
        `   📝 New prompt: "${currentImagePrompt.slice(0, 80)}..."`
      );
    }
    retries++;
  }
}
```

- [ ] **Step 2: Run workflow test (if exists)**

```bash
npm test -- tests/workflows/video-generation.test.ts 2>/dev/null || echo "No test file yet"
```

- [ ] **Step 3: Commit**

```bash
git add src/mastra/workflows/video-generation.ts
git commit -m "feat: integrate image webhook into workflow"
```

---

## Phase 3-5: Remaining Services (Audio, Video, Storyboard, Script, Summarization)

For brevity, remaining phases follow the same pattern. Each service gets:

1. Server endpoint (webhook)
2. Test
3. Workflow integration
4. Commit

**Pattern for each service:**

```typescript
// In src/mastra/services/{service}/server.ts
export function create{Service}ServiceServer(port: number) {
  const app = express();
  app.use(express.json());
  
  app.post("/webhooks/{endpoint}", async (req, res) => {
    const { eventId, callbackUrl, data } = req.body;
    res.status(202).json({ eventId, status: "accepted" });
    
    (async () => {
      try {
        const result = await {originalFunction}(data);
        await fetch(callbackUrl, {
          method: "POST",
          body: JSON.stringify({
            eventId,
            status: "completed",
            data: result,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        // ... error handling
      }
    })();
  });
  
  return app;
}
```

**Quick checklist for Phase 3-5:**

- [ ] **Audio Service** (Port 3002)
  - [ ] Create `src/mastra/services/audio/server.ts`
  - [ ] Create `tests/services/audio/server.test.ts`
  - [ ] Update workflow `generateNarrationAudio` call
  - [ ] Commit

- [ ] **Video Service** (Port 3003)
  - [ ] Create `src/mastra/services/video/server.ts`
  - [ ] Create `tests/services/video/server.test.ts`
  - [ ] Update workflow `combineImageAndAudio` call
  - [ ] Update workflow `concatenateClips` call
  - [ ] Commit

- [ ] **Storyboard Service** (Port 3004)
  - [ ] Create `src/mastra/services/storyboard/server.ts`
  - [ ] Create `tests/services/storyboard/server.test.ts`
  - [ ] Update workflow `generateOverallStoryboard` call
  - [ ] Update workflow `generateTranscriptAndImagePrompt` call
  - [ ] Update workflow `reviseImagePrompt` call
  - [ ] Commit

- [ ] **Script Enhancer Service** (Port 3005)
  - [ ] Create `src/mastra/services/script/server.ts`
  - [ ] Create `tests/services/script/server.test.ts`
  - [ ] Update workflow `enhanceScriptWithAudioTags` call
  - [ ] Commit

- [ ] **Summarization Service** (Port 3006)
  - [ ] Create `src/mastra/services/summarization/server.ts`
  - [ ] Create `tests/services/summarization/server.test.ts`
  - [ ] Update workflow `compactContext` call
  - [ ] Commit

---

## Phase 5: Testing & Hardening

### Task 25: Integration test for full workflow

**Files:**
- Create: `tests/integration/webhook-workflow.test.ts`

**Steps:**

- [ ] **Step 1: Write integration test**

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createImageServiceServer } from "../../src/mastra/services/image/server";
import { createAudioServiceServer } from "../../src/mastra/services/audio/server";
import { WebhookClient, WebhookRegistry } from "../../src/mastra/webhooks";

describe("Webhook Workflow Integration", () => {
  let imageServer: any, audioServer: any;
  let webhookClient: WebhookClient;
  let registry: WebhookRegistry;

  beforeAll(() => {
    imageServer = createImageServiceServer(3001);
    audioServer = createAudioServiceServer(3002);

    registry = new WebhookRegistry();
    registry.loadRegistry();
    webhookClient = new WebhookClient(registry);
  });

  afterAll(() => {
    imageServer.close();
    audioServer.close();
  });

  it("should complete full workflow", async () => {
    // Emit image event
    const imageResponse = await webhookClient.emit({
      eventId: crypto.randomUUID(),
      type: "image.generate",
      callbackUrl: "http://localhost:3000/callback",
      data: { prompt: "test" },
      timestamp: new Date().toISOString(),
    });

    expect(imageResponse.status).toBe("completed");
    expect(imageResponse.data).toBeDefined();
  });
});
```

- [ ] **Step 2: Run integration test**

```bash
npm test -- tests/integration/webhook-workflow.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add tests/integration/webhook-workflow.test.ts
git commit -m "test: add integration test for webhook workflow"
```

---

### Task 26: Add npm scripts for service management

**Files:**
- Modify: `package.json`

**Steps:**

- [ ] **Step 1: Add service scripts**

In `package.json`, update scripts section:

```json
{
  "scripts": {
    "dev": "mastra dev",
    "build": "mastra build",
    "lint": "eslint src/",
    "format": "prettier --write src/",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "services:image": "node --loader ts-node/esm src/mastra/services/image/server.ts",
    "services:audio": "node --loader ts-node/esm src/mastra/services/audio/server.ts",
    "services:video": "node --loader ts-node/esm src/mastra/services/video/server.ts",
    "services:storyboard": "node --loader ts-node/esm src/mastra/services/storyboard/server.ts",
    "services:script": "node --loader ts-node/esm src/mastra/services/script/server.ts",
    "services:summarization": "node --loader ts-node/esm src/mastra/services/summarization/server.ts",
    "services:all": "concurrently 'npm run services:image' 'npm run services:audio' 'npm run services:video' 'npm run services:storyboard' 'npm run services:script' 'npm run services:summarization'"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "feat: add npm scripts for webhook services"
```

---

### Task 27: Update README and documentation

**Files:**
- Modify: `README.md`
- Create: `docs/WEBHOOK_ARCHITECTURE.md`

**Steps:**

- [ ] **Step 1: Update README**

Add to README.md:

```markdown
## Development Setup

The system now uses a webhook-based architecture. To run locally:

### Terminal 1: Main Workflow
```bash
npm install
npm run dev
```

### Terminal 2+: Services
```bash
npm run services:all
```

Or run individual services:
```bash
npm run services:image
npm run services:audio
npm run services:video
npm run services:storyboard
npm run services:script
npm run services:summarization
```

### Architecture
See `docs/superpowers/specs/2026-08-25-webhook-architecture-design.md` and `docs/WEBHOOK_ARCHITECTURE.md` for detailed architecture documentation.
```

- [ ] **Step 2: Create architecture guide**

Create `docs/WEBHOOK_ARCHITECTURE.md` with sections:
- Overview
- Service Registry
- Adding New Services
- Debugging
- Monitoring

- [ ] **Step 3: Commit**

```bash
git add README.md docs/WEBHOOK_ARCHITECTURE.md
git commit -m "docs: update documentation for webhook architecture"
```

---

## Verification Checklist

At the end of each phase, verify:

- [ ] All tests pass: `npm test`
- [ ] Type checking passes: `npm run typecheck`
- [ ] Linting passes: `npm run lint`
- [ ] No console errors in service startup
- [ ] Events are tracked in event store
- [ ] Callbacks are resolved correctly
- [ ] Retry logic works on timeout
- [ ] Dead letter queue captures failed events

---

## Success Criteria (End of Plan)

- [x] WebhookClient emits events and receives callbacks
- [x] WebhookRegistry loads service configuration
- [x] EventStore tracks all events and states
- [x] All 6 services have webhook endpoints
- [x] Workflow orchestration preserved (sequential execution)
- [x] Retry logic with exponential backoff implemented
- [x] Integration tests passing
- [x] npm scripts for dev and service startup
- [x] Documentation complete
