# Webhook-Driven Architecture Guide

This project uses a webhook-based, event-driven architecture for service communication. Services are independent, scalable, and communicate via HTTP webhooks.

## Quick Start

### Terminal 1: Start the main workflow
```bash
npm install
npm run dev
```

### Terminal 2+: Start services
```bash
# Run all services at once
npm run services:all

# Or run individual services
npm run services:image      # Port 3001
npm run services:audio      # Port 3002
npm run services:video      # Port 3003
npm run services:storyboard # Port 3004
npm run services:script     # Port 3005
npm run services:summarization # Port 3006
```

## Architecture Overview

```
┌──────────────────────────────────────┐
│  Mastra Workflow (Orchestrator)      │
│  Emits events → Waits for webhooks   │
└───────────┬──────────────────────────┘
            │
    ┌───────┴───────┐
    │ HTTP Events   │
    │               │
┌───▼────┐   ┌──────▼──────┐   ┌──────▼──────┐
│ Image  │   │ Audio       │   │ Video       │
│ Service│   │ Service     │   │ Service     │
│ :3001  │   │ :3002       │   │ :3003       │
└────────┘   └─────────────┘   └─────────────┘
```

Each service:
1. Listens on a webhook endpoint
2. Returns `202 Accepted` immediately
3. Processes the request asynchronously
4. POSTs the result back to the workflow's callback URL

## How It Works

### Event Flow

**1. Workflow emits event:**
```typescript
const response = await webhookClient.emit({
  eventId: crypto.randomUUID(),
  type: "image.generate",
  callbackUrl: "http://localhost:3000/webhooks/callback",
  data: { prompt: "...", aspectRatio: "..." },
  timestamp: new Date().toISOString(),
  timeout: 300000, // 5 min
});
```

**2. Service receives webhook:**
```
POST http://localhost:3001/webhooks/image
Content-Type: application/json

{
  "eventId": "uuid",
  "type": "image.generate",
  "callbackUrl": "...",
  "data": { ... },
  "timestamp": "2026-08-25T..."
}
```

**3. Service returns 202 immediately:**
```
HTTP/1.1 202 Accepted
Content-Type: application/json

{ "eventId": "uuid", "status": "accepted" }
```

**4. Service processes asynchronously, POSTs callback:**
```
POST http://localhost:3000/webhooks/callback
Content-Type: application/json

{
  "eventId": "uuid",
  "status": "completed",
  "data": { "imageData": "base64..." },
  "timestamp": "2026-08-25T..."
}
```

**5. Workflow's callback handler resolves the promise.**

## Service Registry

Services are configured in `src/mastra/webhooks/service-registry.json`:

```json
{
  "services": {
    "image.generate": {
      "url": "http://localhost:3001",
      "webhookPath": "/webhooks/image",
      "timeout": 300000,
      "maxRetries": 3
    },
    // ... other services
  }
}
```

In production, update URLs to your deployed service endpoints (e.g., `https://image-service.myapp.com`).

## Adding a New Service

1. **Create webhook endpoint:**
   ```typescript
   // src/mastra/services/myservice/server.ts
   export function createMyServiceEndpoint(app: any) {
     app.post("/webhooks/myservice", async (req, res) => {
       res.status(202).json({ status: "accepted" });
       // Process async, POST callback
     });
   }
   ```

2. **Register in service registry:**
   ```json
   "myservice.do": {
     "url": "http://localhost:9000",
     "webhookPath": "/webhooks/myservice",
     "timeout": 300000,
     "maxRetries": 3
   }
   ```

3. **Emit from workflow:**
   ```typescript
   const response = await webhookClient.emit({
     eventId: crypto.randomUUID(),
     type: "myservice.do",
     callbackUrl: "...",
     data: { ... },
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

### Development
Services run locally as separate Node processes. Configuration uses `localhost:PORT` URLs.

### Production
Services are deployed to production URLs (Docker, K8s, etc.). Update `service-registry.json` to point to production endpoints:

```json
{
  "services": {
    "image.generate": {
      "url": "https://image-service.myapp.com",
      "webhookPath": "/webhooks/image",
      // ...
    }
  }
}
```

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

### Service not responding
- Check if service is running: `curl http://localhost:3001/webhooks/image -X POST`
- Check service logs for errors
- Verify service registry has correct URL

### Workflow callback timeout
- Check if workflow's callback URL is correct (use `WORKFLOW_CALLBACK_URL` env var)
- Check if service is actually POSTing the callback
- Increase timeout if service takes longer

### Events in dead letter queue
- Check the last error: `dlq[0].lastError`
- Review service logs at that timestamp
- Consider retrying manually: re-emit the event with new `eventId`

## Related Documentation

- **Design Spec:** `docs/superpowers/specs/2026-08-25-webhook-architecture-design.md`
- **Implementation Plan:** `docs/superpowers/plans/2026-08-25-webhook-architecture-implementation.md`
