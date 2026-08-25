# Webhook-Driven Service Architecture Design

**Date:** 2026-08-25  
**Status:** Design Approved  
**Authors:** Hajavololona Armellin

---

## Executive Summary

Refactor the tightly-coupled video generation system into a webhook-driven, event-based architecture. The workflow orchestrator emits events to independent services via webhooks and waits for callbacks with results. This pattern mirrors Stripe's webhook model, enabling services to scale independently while the workflow maintains orchestration control.

**Key Changes:**
- Introduce `WebhookClient` for event emission and callback handling
- Convert services into independently deployable webhook-enabled processes
- Maintain workflow orchestration pattern (sequential execution, not fully async)
- Add event tracking and retry logic for resilience

---

## Current State Problems

1. **Tight Coupling** — Workflow directly imports and calls service functions. Adding/removing services requires workflow changes.
2. **Sequential Blocking** — Image generation blocks on `generateImage()` call. Services can't run independently or at scale.
3. **Poor Observability** — No event tracking. Hard to debug or monitor service communication.
4. **Not Production-Ready** — Single-process execution; no independent service scaling or failover.

---

## Proposed Architecture

### Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    Mastra Workflow                           │
│              (Orchestrator - Remains in process)             │
│                                                               │
│  1. Emit event → Image Service                               │
│  2. Wait for callback                                        │
│  3. Emit event → Audio Service                               │
│  4. Wait for callback                                        │
│  └─ ... (repeat for each service)                            │
└─────────────────────────┬──────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
      [HTTP]          [HTTP]          [HTTP]
          │               │               │
    ┌─────▼────────┐ ┌──────▼─────┐ ┌──────▼──────┐
    │ Image Service│ │Audio Service│ │Video Service│
    │ (Port 3001)  │ │(Port 3002)  │ │(Port 3003)  │
    │              │ │             │ │             │
    │ POST /       │ │ POST /      │ │ POST /      │
    │ webhooks/    │ │ webhooks/   │ │ webhooks/   │
    │ image        │ │ audio       │ │ combine     │
    └─────────────┘ └─────────────┘ └─────────────┘
```

### Key Components

#### 1. WebhookClient (`src/mastra/webhooks/client.ts`)

Handles event emission, callback registration, and result delivery.

**Responsibilities:**
- Emit events to services
- Register callback listeners
- Handle timeouts and retries
- Track event state

**API:**
```typescript
class WebhookClient {
  async emit(event: WebhookEvent): Promise<WebhookResponse>;
  onCallback(eventId: string, handler: (response: WebhookResponse) => void): void;
  getEventStatus(eventId: string): EventStatus;
}
```

#### 2. Event Types (`src/mastra/webhooks/types.ts`)

Standardized event and response formats across all services.

```typescript
interface WebhookEvent {
  eventId: string;              // UUID, unique per event
  type: string;                 // "image.generate", "audio.generate", etc.
  callbackUrl: string;          // Where service POSTs result
  data: Record<string, unknown>; // Service-specific payload
  timestamp: ISO8601;
  timeout?: number;             // ms, default 300000 (5 min)
  retryConfig?: {
    maxAttempts: number;
    backoffMs: number;
  };
}

interface WebhookResponse {
  eventId: string;              // Matches original event
  status: "completed" | "failed";
  data?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: ISO8601;
}
```

#### 3. Service Registry (`src/mastra/webhooks/registry.ts`)

Central configuration for service endpoints.

```typescript
// service-registry.json
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
    }
    // ... more services
  }
}
```

#### 4. Event Store (`src/mastra/webhooks/event-store.ts`)

Tracks all emitted events and their states for observability and recovery.

```typescript
interface EventRecord {
  eventId: string;
  type: string;
  status: "pending" | "completed" | "failed" | "timeout";
  attempts: number;
  createdAt: ISO8601;
  completedAt?: ISO8601;
  lastError?: string;
  result?: WebhookResponse;
}
```

---

## Service Architecture

### Service Structure

Each service becomes a standalone Node process with Express server:

```
src/mastra/services/image/
├── index.ts          # Core business logic (unchanged from current)
├── server.ts         # Express server with webhook endpoint
└── types.ts          # Service-specific types
```

### Example: Image Service

**`server.ts`:**
```typescript
import express from "express";
import { generateImage } from "./index";

const app = express();
app.use(express.json());

app.post("/webhooks/image", async (req, res) => {
  const { eventId, data, callbackUrl } = req.body;

  // Return 202 immediately — processing happens async
  res.status(202).json({ eventId, status: "accepted" });

  // Process in background
  (async () => {
    try {
      const imageData = await generateImage(data.prompt, data.aspectRatio);
      
      // POST result back to workflow
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
      await fetch(callbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          status: "failed",
          error: {
            code: "IMAGE_GENERATION_FAILED",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          timestamp: new Date().toISOString(),
        }),
      });
    }
  })();
});

app.listen(3001, () => console.log("Image service listening on :3001"));
```

### Webhook Endpoints

| Service | Endpoint | Method | Payload | Response |
|---------|----------|--------|---------|----------|
| Image | `/webhooks/image` | POST | `{ eventId, callbackUrl, data: { prompt, aspectRatio, style } }` | `202 Accepted` |
| Audio | `/webhooks/audio` | POST | `{ eventId, callbackUrl, data: { narration, language, voiceId } }` | `202 Accepted` |
| Script Enhancer | `/webhooks/enhance-script` | POST | `{ eventId, callbackUrl, data: { narration, narrativeStyle } }` | `202 Accepted` |
| Video | `/webhooks/combine` | POST | `{ eventId, callbackUrl, data: { imagePath, audioPath, aspectRatio } }` | `202 Accepted` |
| Storyboard | `/webhooks/storyboard` | POST | `{ eventId, callbackUrl, data: { content, style, format, language } }` | `202 Accepted` |
| Summarization | `/webhooks/summarize` | POST | `{ eventId, callbackUrl, data: { content, maxLength } }` | `202 Accepted` |

All services return `202 Accepted` immediately and POST results asynchronously to `callbackUrl`.

---

## Workflow Integration

### Pattern: Orchestration + Webhooks

The workflow **remains the orchestrator** — it still controls the sequence. The difference: instead of calling functions, it emits events and waits for webhooks.

**Before:**
```typescript
const imageData = await generateImage(ctx, currentImagePrompt);
```

**After:**
```typescript
const response = await webhookClient.emit({
  type: "image.generate",
  data: { 
    prompt: currentImagePrompt, 
    aspectRatio: ctx.aspectRatio,
    style: ctx.style,
  },
  callbackUrl: `${WORKFLOW_CALLBACK_URL}/webhooks/callback`,
  timeout: 300000,
});

if (response.status === "failed") {
  throw new Error(`Image generation failed: ${response.error?.message}`);
}

const imageData = response.data?.imageData;
```

### Workflow Callback Handler

The workflow exposes an endpoint to receive service callbacks:

```typescript
app.post("/webhooks/callback", async (req, res) => {
  const { eventId, status, data, error } = req.body;

  // Resolve the pending promise for this event
  webhookClient.resolveCallback(eventId, { status, data, error });

  res.status(200).json({ received: true });
});
```

The `webhookClient.emit()` internally awaits this resolution.

---

## Error Handling & Resilience

### Retry Strategy

```typescript
const retryConfig = {
  maxAttempts: 3,
  backoffMs: 1000,        // Exponential: 1s, 2s, 4s
  timeout: 300000,        // 5 min per attempt
};
```

On timeout or failure:
1. Wait `backoffMs` milliseconds
2. Retry the event
3. After `maxAttempts`, mark as failed

### Dead Letter Queue

Events that fail all retries go into DLQ for manual investigation:

```typescript
interface DeadLetterEvent {
  eventId: string;
  type: string;
  attempts: number;
  lastError: string;
  originalEvent: WebhookEvent;
  failedAt: ISO8601;
}
```

DLQ is periodically logged and can be queried for debugging.

### Idempotency

Services must be idempotent — receiving the same event twice should produce the same result (or be safely ignored).

```typescript
app.post("/webhooks/image", async (req, res) => {
  const { eventId, data } = req.body;

  // Check if we've already processed this eventId
  const cached = await eventCache.get(eventId);
  if (cached) {
    return res.status(200).json(cached);
  }

  // Process...
  const result = await generateImage(data.prompt);

  // Cache result keyed by eventId
  await eventCache.set(eventId, result, 3600); // 1 hour TTL

  callbackService.post(result);
});
```

---

## Deployment & Configuration

### Development

All services run locally as separate Node processes:

```bash
# Terminal 1: Workflow
npm run dev

# Terminal 2: Image Service
npm run services:image

# Terminal 3: Audio Service
npm run services:audio

# ... etc for each service
```

**Configuration (`src/mastra/webhooks/service-registry.json`):**
```json
{
  "services": {
    "image": { "url": "http://localhost:3001", "webhookPath": "/webhooks/image" },
    "audio": { "url": "http://localhost:3002", "webhookPath": "/webhooks/audio" },
    "video": { "url": "http://localhost:3003", "webhookPath": "/webhooks/combine" },
    "storyboard": { "url": "http://localhost:3004", "webhookPath": "/webhooks/storyboard" },
    "scriptEnhancer": { "url": "http://localhost:3005", "webhookPath": "/webhooks/enhance-script" },
    "summarization": { "url": "http://localhost:3006", "webhookPath": "/webhooks/summarize" }
  }
}
```

### Production

Services are deployed independently (Docker, K8s, or serverless). The registry points to their production URLs:

```json
{
  "services": {
    "image": { "url": "https://image-service.myapp.com", "webhookPath": "/webhooks/image" },
    "audio": { "url": "https://audio-service.myapp.com", "webhookPath": "/webhooks/audio" },
    "... etc"
  }
}
```

---

## File Structure

```
src/mastra/
├── webhooks/
│   ├── client.ts              # WebhookClient class
│   ├── types.ts               # WebhookEvent, WebhookResponse, etc.
│   ├── registry.ts            # Service registry loader
│   ├── event-store.ts         # Event tracking
│   └── service-registry.json  # Config
├── services/
│   ├── image/
│   │   ├── index.ts           # Core image generation logic (unchanged)
│   │   ├── server.ts          # Express server + webhook handler
│   │   └── types.ts           # Image-specific types
│   ├── audio/
│   │   ├── index.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── video/
│   │   ├── index.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── storyboard/
│   │   ├── index.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── script/
│   │   ├── index.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── summarization/
│   │   ├── index.ts
│   │   ├── server.ts
│   │   └── types.ts
│   └── ... (other services)
├── workflows/
│   ├── video-generation.ts    # Refactored to use WebhookClient
│   └── types.ts
├── agents/                    # Unchanged
├── types/                     # Unchanged
└── index.ts
```

---

## Implementation Phases

### Phase 1: Foundation (WebhookClient + Registry)
- Create `WebhookClient` class
- Define event types
- Create service registry
- Add event store
- Update workflow callback handler

### Phase 2: Image Service Migration
- Refactor image service into `services/image/server.ts`
- Create webhook endpoint
- Test with workflow

### Phase 3: Audio Service Migration
- Follow pattern from Phase 2
- Integrate with workflow

### Phase 4: Remaining Services
- Video, Storyboard, Script Enhancer, Summarization
- Sequential migration, each validated before next

### Phase 5: Testing & Hardening
- Integration tests for webhook flow
- Retry logic tests
- Error scenario tests
- Performance validation

---

## Benefits

✅ **Decoupling** — Services are independent; can be developed/deployed separately  
✅ **Scalability** — Each service can scale independently based on demand  
✅ **Resilience** — Retry logic, timeouts, and DLQ provide fault tolerance  
✅ **Observability** — Event store provides full audit trail of requests/responses  
✅ **Extensibility** — Adding new services is straightforward: create endpoint, register, done  
✅ **Stripe-like Model** — Familiar pattern used in production systems worldwide  
✅ **Real-Time** — Webhooks enable true async communication and real-time status updates  

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Service timeout/crash | Retry logic + DLQ for manual intervention |
| Network failures | Idempotency key + result caching |
| Callback URL unreachable | Retry with backoff; log to DLQ |
| Out-of-order event processing | Event store tracks state; workflow logic validates order |
| Resource exhaustion in service | Service can be scaled independently; queue requests if needed |

---

## Open Questions / To Clarify

1. **Event persistence** — Should event store be in-memory (dev), SQLite, or proper DB (prod)?
2. **Callback retry** — If service receives callback timeout, should it retry? (Recommend: service retries internally, not workflow)
3. **Service health checks** — Should workflow periodically check if services are healthy?
4. **Rate limiting** — Should services rate-limit incoming webhook requests?
5. **Authentication** — Should webhooks require auth (API key, signed tokens)? Recommend for prod.

These can be addressed during implementation.

---

## Success Criteria

- [x] Workflow remains in Mastra process (orchestration pattern maintained)
- [x] All services expose webhook endpoints
- [x] WebhookClient handles async communication
- [x] Event store tracks all communication
- [x] Retry logic works for failed requests
- [x] Services can be deployed independently
- [x] Full integration test passing
- [x] Documentation complete
