# Real-Time Progress Tracking

Monitor video generation progress in real-time using Server-Sent Events (SSE).

## Backend: Emit Progress Updates

### In Your Handler

```typescript
import { progressTracker } from "@mastra/webhooks/progress-tracker";

export async function generateImageWithProgress(eventId: string, data: any) {
  // Start
  progressTracker.emit({
    eventId,
    type: "image.generate",
    status: "started",
    progress: 0,
    message: "Starting image generation...",
    timestamp: new Date().toISOString(),
  });

  try {
    // Processing
    progressTracker.emit({
      eventId,
      type: "image.generate",
      status: "processing",
      progress: 50,
      message: "Generating image...",
      timestamp: new Date().toISOString(),
    });

    const imageData = await generateImage(data.prompt);

    // Complete
    progressTracker.emit({
      eventId,
      type: "image.generate",
      status: "completed",
      progress: 100,
      message: "Image generated successfully!",
      data: { imageData },
      timestamp: new Date().toISOString(),
    });

    return { imageData };
  } catch (error) {
    // Failed
    progressTracker.emit({
      eventId,
      type: "image.generate",
      status: "failed",
      progress: 0,
      message: `Error: ${error.message}`,
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}
```

## Frontend: Subscribe to Updates

### React Hook

```typescript
"use client";

import { useProgress } from "@videooverview/sdk";

export function ImageGenerator() {
  const [eventId, setEventId] = useState<string | null>(null);
  const { progress, message, status, isProcessing } = useProgress(eventId, {
    onProgress: (event) => console.log(`${event.progress}%`),
    onComplete: (event) => console.log("Done!", event.data),
    onError: (error) => console.error("Failed:", error.message),
  });

  return (
    <div>
      <button onClick={() => setEventId(crypto.randomUUID())}>
        Generate Image
      </button>

      {isProcessing && (
        <div>
          <progress value={progress} max={100} />
          <p>{message}</p>
        </div>
      )}

      {status === "completed" && <p>✅ Complete!</p>}
      {status === "failed" && <p>❌ Failed</p>}
    </div>
  );
}
```

### Progress Component

```typescript
import { ProgressExample } from "@videooverview/sdk/examples/ProgressExample";

export function App() {
  const [eventId, setEventId] = useState<string | null>(null);

  return (
    <div>
      <button onClick={() => setEventId(crypto.randomUUID())}>
        Start Generation
      </button>
      <ProgressExample eventId={eventId} />
    </div>
  );
}
```

## API Endpoints

### Stream Progress (SSE)

```bash
GET /api/progress/:eventId
```

Returns a Server-Sent Events stream with progress updates.

**Example:**

```typescript
const eventSource = new EventSource("/api/progress/event-123");

eventSource.onmessage = (event) => {
  const progress = JSON.parse(event.data);
  console.log(`${progress.progress}% - ${progress.message}`);
};
```

### Get Current Status (REST)

```bash
GET /api/progress/:eventId/status
```

Returns the latest progress event.

**Response:**

```json
{
  "eventId": "event-123",
  "type": "image.generate",
  "status": "processing",
  "progress": 75,
  "message": "Generating image...",
  "timestamp": "2026-08-25T14:30:00.000Z"
}
```

### Get History (REST)

```bash
GET /api/progress/:eventId/history
```

Returns all progress events for an event ID.

**Response:**

```json
{
  "eventId": "event-123",
  "latest": { ... },
  "events": [
    { "status": "started", "progress": 0, ... },
    { "status": "processing", "progress": 25, ... },
    { "status": "processing", "progress": 50, ... },
    { "status": "completed", "progress": 100, ... }
  ]
}
```

### List Active Events (REST)

```bash
GET /api/progress/active
```

Returns all currently processing events.

**Response:**

```json
{
  "count": 2,
  "events": [
    {
      "eventId": "event-123",
      "type": "image.generate",
      "status": "processing",
      "progress": 50,
      ...
    },
    {
      "eventId": "event-456",
      "type": "audio.generate",
      "status": "processing",
      "progress": 75,
      ...
    }
  ]
}
```

## Status Values

- **started** — Handler started processing
- **processing** — Handler is working (can emit multiple times with progress updates)
- **completed** — Handler finished successfully (includes `data`)
- **failed** — Handler encountered an error

## Progress Scale

- `0` — Not started
- `25-75` — Processing (intermediate steps)
- `100` — Completed

## Best Practices

1. **Emit at Key Milestones** — Update progress at meaningful steps, not every millisecond
2. **Meaningful Messages** — Use clear, user-friendly messages
3. **Include Data on Completion** — Return the result in the final `completed` event
4. **Handle Errors** — Always emit `failed` status on error
5. **Use Consistent Event IDs** — Keep the same `eventId` throughout the request lifecycle

## Example: Video Generation with Progress

```typescript
registry.registerHandler("video.generate", async (data) => {
  const eventId = data.eventId; // Passed through

  // Step 1: Storyboard
  progressTracker.emit({
    eventId,
    type: "video.generate",
    status: "processing",
    progress: 10,
    message: "Creating storyboard...",
    timestamp: new Date().toISOString(),
  });
  const storyboard = await generateStoryboard(data.content);

  // Step 2: Images
  progressTracker.emit({
    eventId,
    type: "video.generate",
    status: "processing",
    progress: 40,
    message: `Generating ${storyboard.clips.length} images...`,
    timestamp: new Date().toISOString(),
  });
  const images = await generateImages(storyboard);

  // Step 3: Audio
  progressTracker.emit({
    eventId,
    type: "video.generate",
    status: "processing",
    progress: 70,
    message: "Generating audio narration...",
    timestamp: new Date().toISOString(),
  });
  const audio = await generateAudio(storyboard.narration);

  // Step 4: Video
  progressTracker.emit({
    eventId,
    type: "video.generate",
    status: "processing",
    progress: 90,
    message: "Compositing video...",
    timestamp: new Date().toISOString(),
  });
  const videoPath = await createVideo(images, audio);

  // Complete
  progressTracker.emit({
    eventId,
    type: "video.generate",
    status: "completed",
    progress: 100,
    message: "Video generation complete!",
    data: { videoPath, storyboard, clips: storyboard.clips.length },
    timestamp: new Date().toISOString(),
  });

  return { videoPath };
});
```

## Client Integration

```typescript
"use client";

import { useProgress } from "@videooverview/sdk";
import { ProgressExample } from "@videooverview/sdk/examples/ProgressExample";

export function VideoGenerator() {
  const [eventId, setEventId] = useState<string | null>(null);

  const handleGenerate = async () => {
    const newEventId = crypto.randomUUID();
    setEventId(newEventId);

    try {
      const client = createClient("http://localhost:3000");
      await client.generateVideo({
        content: "Your video content...",
        eventId: newEventId,
      });
    } catch (error) {
      console.error("Generation failed:", error);
    }
  };

  return (
    <div className="max-w-2xl">
      <button onClick={handleGenerate}>Generate Video</button>
      {eventId && <ProgressExample eventId={eventId} />}
    </div>
  );
}
```

## Polling Alternative

If SSE doesn't work in your environment, use polling instead:

```typescript
async function pollProgress(eventId: string, callback: (progress: any) => void) {
  let isComplete = false;

  while (!isComplete) {
    const response = await fetch(`/api/progress/${eventId}/status`);
    const progress = await response.json();

    callback(progress);

    if (progress.status === "completed" || progress.status === "failed") {
      isComplete = true;
    } else {
      await new Promise((r) => setTimeout(r, 1000)); // Poll every 1s
    }
  }
}
```
