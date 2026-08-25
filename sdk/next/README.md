# Video Overview Next.js SDK

TypeScript SDK for interacting with the Video Overview API from your Next.js application.

## Installation

```bash
npm install @videooverview/sdk
```

## Quick Start

### Using the Client

```typescript
import { createClient } from "@videooverview/sdk";

const client = createClient("http://localhost:3000");

// Generate an image
const image = await client.generateImage({
  prompt: "A beautiful sunset over mountains",
  style: "watercolor",
  aspectRatio: "16:9",
});

console.log(image.imageData); // base64 encoded image
```

### Using React Hooks

```typescript
"use client"; // Next.js 13+ App Router

import { useGenerateImage } from "@videooverview/sdk";

export function ImageGenerator() {
  const { generate, loading, error, data } = useGenerateImage({
    onSuccess: (result) => {
      console.log("Image generated:", result);
    },
    onError: (error) => {
      console.error("Failed:", error.message);
    },
  });

  const handleGenerate = async () => {
    await generate({
      prompt: "A beautiful sunset",
      style: "anime",
    });
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Image"}
      </button>
      {error && <p style={{ color: "red" }}>{error.message}</p>}
      {data?.imageData && (
        <img src={`data:image/png;base64,${data.imageData}`} alt="Generated" />
      )}
    </div>
  );
}
```

## API Reference

### Client Methods

#### `generateImage(request)`
Generate an image from a text prompt.

```typescript
const result = await client.generateImage({
  prompt: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  style?: string;
});
// Returns: { imageData: string (base64) }
```

#### `generateAudio(request)`
Generate audio narration from text.

```typescript
const result = await client.generateAudio({
  narration: string;
  language?: string;
  voiceId?: string;
});
// Returns: { audioData: string (base64) }
```

#### `generateStoryboard(request)`
Generate a video storyboard from content.

```typescript
const result = await client.generateStoryboard({
  content: string;
  style?: string;
  format?: string;
  language?: string;
  customInstructions?: string;
  narrativeStyle?: string;
});
// Returns: {
//   title: string;
//   narrativeFlow: string;
//   clipOutlines: Array<{...}>;
// }
```

#### `enhanceScript(request)`
Enhance a script with audio tags for expressive TTS.

```typescript
const result = await client.enhanceScript({
  narration: string;
  narrativeStyle?: string;
});
// Returns: { enhancedNarration: string }
```

#### `combineVideo(request)`
Combine an image and audio into a video clip.

```typescript
const result = await client.combineVideo({
  imagePath: string;
  audioPath: string;
  outputDir?: string;
  aspectRatio?: string;
});
// Returns: { videoPath: string }
```

#### `concatenateVideos(request)`
Concatenate multiple video clips.

```typescript
const result = await client.concatenateVideos({
  videoPaths: string[];
  outputDir?: string;
  title?: string;
});
// Returns: { finalVideoPath: string }
```

#### `summarizeContent(request)`
Summarize or compact content.

```typescript
const result = await client.summarizeContent({
  content: string;
  maxLength?: number;
});
// Returns: { summary: string }
```

### React Hooks

#### `useGenerateImage(options?)`
Hook for image generation with loading/error state.

```typescript
const { generate, loading, error, data } = useGenerateImage({
  onSuccess: (data) => {},
  onError: (error) => {},
});

await generate({ prompt: "..." });
```

#### `useGenerateAudio(options?)`
Hook for audio generation.

```typescript
const { generate, loading, error, data } = useGenerateAudio(options);
await generate({ narration: "..." });
```

#### `useGenerateStoryboard(options?)`
Hook for storyboard generation.

```typescript
const { generate, loading, error, data } = useGenerateStoryboard(options);
await generate({ content: "..." });
```

#### `useEnhanceScript(options?)`
Hook for script enhancement.

```typescript
const { enhance, loading, error, data } = useEnhanceScript(options);
await enhance({ narration: "..." });
```

## Configuration

### Base URL

Set the base URL when creating a client:

```typescript
// Development
const client = createClient("http://localhost:3000");

// Production
const client = createClient("https://api.videooverview.com");
```

### Timeout

Customize the request timeout (in milliseconds):

```typescript
const client = createClient("http://localhost:3000", {
  timeout: 600000, // 10 minutes
});
```

## Error Handling

All methods throw errors on failure:

```typescript
try {
  const result = await client.generateImage({ prompt: "..." });
} catch (error) {
  console.error(error.message);
  // Handle error appropriately
}
```

With hooks:

```typescript
const { generate, error } = useGenerateImage();

if (error) {
  console.error(error.message);
}
```

## TypeScript

Full TypeScript support with typed event payloads and responses:

```typescript
import type { Events } from "@videooverview/sdk";

const request: Events.ImageGenerateRequest = {
  prompt: "...",
  style: "watercolor",
};

const response: Events.ImageGenerateResponse = await client.generateImage(request);
```

## Browser Support

Works in modern browsers with ES2020 support (Chrome, Firefox, Safari, Edge).

## License

MIT
