# Webhook-Driven Architecture Guide

This project uses a **webhook vocabulary** for event-driven architecture, but implements it as a single-process system for simplicity. All services are registered as handlers within the main Mastra process and communicate via internal function calls.

## Quick Start

```bash
npm install
npm run dev
```

That's it! All services are initialized and ready to process events.

## Architecture Overview

```
┌─────────────────────────────────────────┐
│    Mastra Workflow (Single Process)     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  WebhookClient                  │   │
│  │  Emits: { type, data }          │   │
│  └────────┬────────────────────────┘   │
│           │                             │
│  ┌────────▼──────────────────────────┐ │
│  │  WebhookRegistry                 │ │
│  │  Resolves type → handler         │ │
│  └────────┬──────────────────────────┘ │
│           │                             │
│  ┌────────▼──────────────────────────┐ │
│  │  Handlers (In-Process)           │ │
│  │  • image.generate                │ │
│  │  • audio.generate                │ │
│  │  • video.combine                 │ │
│  │  • storyboard.generate           │ │
│  │  • script.enhance                │ │
│  │  • summarization.compact         │ │
│  └──────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

All event handlers run in-process with no HTTP overhead.

## How It Works

### Event Flow

**1. Workflow emits event:**
```typescript
const response = await webhookClient.emit({
  eventId: crypto.randomUUID(),
  type: "image.generate",
  callbackUrl: "", // Not used in single-process mode
  data: { prompt: "...", aspectRatio: "..." },
  timestamp: new Date().toISOString(),
  timeout: 300000, // 5 min
});
```

**2. WebhookClient looks up handler:**
```typescript
const handler = registry.getHandler("image.generate");
```

**3. Handler executes in-process:**
```typescript
const result = await handler(event.data);
// Returns: { imageData: "..." }
```

**4. Result returned immediately:**
```typescript
response.data // { imageData: "..." }
```

## Handler Registry

Handlers are registered in `src/mastra/webhooks/initializer.ts`:

```typescript
export function initializeWebhookHandlers(registry: WebhookRegistry): void {
  registry.registerHandler("image.generate", async (data) => {
    const imageData = await generateImage(data.prompt, data.aspectRatio);
    return { imageData };
  });
  
  registry.registerHandler("audio.generate", async (data) => {
    const audioData = await generateNarrationAudio(data.narration);
    return { audioData };
  });
  
  // ... more handlers
}
```

This design keeps the **event vocabulary** (type names) consistent while avoiding the complexity of multiple processes.

## Adding a New Handler

1. **Create handler function:**
   ```typescript
   // src/mastra/services/myservice/index.ts
   export async function myCustomFunction(input: any): Promise<any> {
     // Do work
     return { result: "..." };
   }
   ```

2. **Register handler in initializer:**
   ```typescript
   // src/mastra/webhooks/initializer.ts
   import { myCustomFunction } from "../services/myservice";
   
   export function initializeWebhookHandlers(registry: WebhookRegistry): void {
     // ... existing handlers
     
     registry.registerHandler("myservice.do", async (data) => {
       return await myCustomFunction(data.input);
     });
   }
   ```

3. **Emit from workflow:**
   ```typescript
   const response = await webhookClient.emit({
     eventId: crypto.randomUUID(),
     type: "myservice.do",
     callbackUrl: "", // Not used
     data: { input: "..." },
     timestamp: new Date().toISOString(),
   });
   ```

## Error Handling

### Timeouts
If a service doesn't respond within the timeout (default 5 min), the workflow retries up to 3 times with exponential backoff: 1s, 2s, 4s.

### Failed Service
If a service POSTs `status: "failed"`, the callback handler rejects the promise with the error.

### Dead Letter Queue
Events that fail all retries are tracked in the EventStore's dead letter queue for manual investigation:

```typescript
const dlq = webhookClient.getDeadLetterQueue();
console.log("Failed events:", dlq);
```

## Monitoring & Debugging

### View all events:
```typescript
const allEvents = webhookClient.getAllEvents();
allEvents.forEach(e => console.log(`${e.eventId}: ${e.status}`));
```

### Check event status:
```typescript
const status = webhookClient.getEventStatus(eventId);
console.log(status); // { status: "pending" | "completed" | "failed", ... }
```

### Service logs:
Each service logs to console. Look for `[ServiceName]` prefix:
```
[ImageService] Generating image for event abc123...
[ImageService] Image generated for event abc123
```

## Development vs Production

### Development & Production
All handlers run in-process. No external services or configuration needed. Just run `npm run dev`.

### Future: Distributed Architecture
If you need to scale specific handlers independently in the future:
1. Extract handler into separate service
2. Change handler from function call to HTTP webhook
3. Update WebhookClient to use fetch instead of calling handler directly
4. This architecture supports both patterns without code changes to the workflow

## Testing

Run tests:
```bash
npm test                    # Run all tests
npm test -- path/to/test.ts # Run specific test
npm run test:ui             # Open Vitest UI
```

Tests cover:
- Type validation (Zod schemas)
- Event store operations
- WebhookClient emit & callback flow
- Service endpoint handlers
- Error scenarios

## Best Practices

1. **Idempotency** — Services should handle the same `eventId` being received twice (e.g., due to retry). Cache results by `eventId`.

2. **Fast HTTP response** — Always return `202 Accepted` before processing. Long-running tasks happen in the background.

3. **Callback reliability** — If the callback URL is unreachable, services should retry posting. Consider a DLQ for undeliverable callbacks.

4. **Logging** — Include `[ServiceName]` prefix and `eventId` in all logs for easy tracing.

5. **Timeout tuning** — Adjust timeout per service based on expected duration. Image generation (5 min) vs script enhancement (1 min).

6. **Production auth** — Add API key or signed token validation to webhook endpoints for security.

## Troubleshooting

### Handler not found error
- Check that handler is registered in `src/mastra/webhooks/initializer.ts`
- Verify the event `type` name matches the registered handler name
- Check console logs for "All handlers registered" message

### Handler timeout
- Increase `timeout` when emitting the event (default 5 min)
- Review handler function for long-running operations
- Check console logs for handler execution time

### Events in dead letter queue
- Check the last error: `dlq[0].lastError`
- Review console logs at that timestamp
- Verify handler function doesn't throw errors

## Related Documentation

- **Design Spec:** `docs/superpowers/specs/2026-08-25-webhook-architecture-design.md`
- **Implementation Plan:** `docs/superpowers/plans/2026-08-25-webhook-architecture-implementation.md`
