# Setup Guide: Video Overview SDK in Next.js

## Installation

### 1. Install the SDK

```bash
npm install @videooverview/sdk
```

### 2. Configure environment variables

Create a `.env.local` file in your Next.js project:

```env
# URL of the Mastra server
NEXT_PUBLIC_MASTRA_URL=http://localhost:3000
```

For production:

```env
NEXT_PUBLIC_MASTRA_URL=https://api.videooverview.com
```

### 3. Create API route (optional but recommended)

Create `app/api/webhooks/emit/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    // Forward to Mastra backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MASTRA_URL}/api/webhooks/emit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

This protects your API and allows for additional validation/authentication.

## Usage

### Option 1: Direct Client (Simple)

```typescript
"use client";

import { createClient } from "@videooverview/sdk";

export function MyComponent() {
  const handleGenerate = async () => {
    const client = createClient(
      process.env.NEXT_PUBLIC_MASTRA_URL || "http://localhost:3000"
    );

    const result = await client.generateImage({
      prompt: "A beautiful sunset",
      style: "watercolor",
    });

    console.log(result.imageData);
  };

  return <button onClick={handleGenerate}>Generate Image</button>;
}
```

### Option 2: React Hooks (Recommended)

```typescript
"use client";

import { useGenerateImage } from "@videooverview/sdk";

export function ImageGenerator() {
  const { generate, loading, error, data } = useGenerateImage({
    onSuccess: (result) => {
      console.log("Success!", result);
    },
    onError: (error) => {
      console.error("Failed:", error.message);
    },
  });

  return (
    <div>
      <button onClick={() => generate({ prompt: "..." })} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>
      {error && <p style={{ color: "red" }}>{error.message}</p>}
      {data?.imageData && <img src={`data:image/png;base64,${data.imageData}`} />}
    </div>
  );
}
```

### Option 3: Custom Hook

Create `lib/useVideoOverview.ts`:

```typescript
"use client";

import { createClient } from "@videooverview/sdk";

export function useVideoOverview() {
  return createClient(
    process.env.NEXT_PUBLIC_MASTRA_URL || "http://localhost:3000"
  );
}
```

Then use it:

```typescript
"use client";

import { useVideoOverview } from "@/lib/useVideoOverview";

export function MyComponent() {
  const sdk = useVideoOverview();

  const handleGenerate = async () => {
    const result = await sdk.generateImage({ prompt: "..." });
  };

  return <button onClick={handleGenerate}>Generate</button>;
}
```

## Full Example

Create `app/generator/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useGenerateImage } from "@videooverview/sdk";

export default function GeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const { generate, loading, error, data } = useGenerateImage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generate({ prompt, style: "watercolor" });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Image Generator</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image..."
          className="w-full p-3 border rounded-lg"
          rows={4}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:bg-gray-400"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">{error.message}</p>}

      {data?.imageData && (
        <img
          src={`data:image/png;base64,${data.imageData}`}
          alt="Generated"
          className="mt-6 w-full rounded-lg"
        />
      )}
    </div>
  );
}
```

## Running the Full Stack

### Terminal 1: Start Mastra backend

```bash
cd /path/to/mastra
npm run dev
```

### Terminal 2: Start Next.js frontend

```bash
cd /path/to/nextjs-app
npm run dev
```

Visit `http://localhost:3000` (or your Next.js port) and start generating!

## Troubleshooting

### SDK not found

Make sure the SDK is installed:

```bash
npm list @videooverview/sdk
```

### API calls failing

1. Check that Mastra backend is running on the correct URL
2. Verify `NEXT_PUBLIC_MASTRA_URL` env var is set correctly
3. Check browser console for error messages
4. Verify Mastra handlers are registered (look for "All handlers registered" in console)

### Images not displaying

Make sure you're properly converting base64 to data URL:

```typescript
<img src={`data:image/png;base64,${data.imageData}`} alt="Generated" />
```

## TypeScript Support

Full TypeScript support is included:

```typescript
import type { Events } from "@videooverview/sdk";

const request: Events.ImageGenerateRequest = {
  prompt: "...",
  style: "watercolor",
};

const response = await client.generateImage(request);
const imageData: string = response.imageData;
```

## Production Deployment

1. Deploy Mastra backend to your server
2. Update `NEXT_PUBLIC_MASTRA_URL` to production URL
3. Deploy Next.js frontend
4. Test the full flow

For security, consider:
- Adding authentication tokens
- Rate limiting API calls
- Validating inputs server-side
