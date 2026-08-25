/**
 * Custom hook to initialize the Video Overview SDK
 * Usage: const sdk = useVideoOverview();
 */

import { useMemo } from "react";
import { VideoOverviewSDK } from "@videooverview/sdk";

export function useVideoOverview(
  baseUrl: string = process.env.NEXT_PUBLIC_MASTRA_URL || "http://localhost:3000",
  timeout?: number
): VideoOverviewSDK {
  return useMemo(() => {
    return new VideoOverviewSDK({
      baseUrl,
      timeout: timeout || 300000, // 5 min default
    });
  }, [baseUrl, timeout]);
}

/**
 * Or use this for direct client initialization:
 *
 * // In your Next.js config or .env.local:
 * NEXT_PUBLIC_MASTRA_URL=http://localhost:3000
 *
 * // In your component:
 * 'use client'
 *
 * import { createClient } from "@videooverview/sdk";
 *
 * const client = createClient(
 *   process.env.NEXT_PUBLIC_MASTRA_URL || "http://localhost:3000"
 * );
 */
