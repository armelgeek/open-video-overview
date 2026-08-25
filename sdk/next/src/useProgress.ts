"use client";

import { useEffect, useState, useCallback } from "react";

export interface ProgressEvent {
  eventId: string;
  type: string;
  status: "started" | "processing" | "completed" | "failed";
  progress: number; // 0-100
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

interface UseProgressOptions {
  baseUrl?: string;
  onProgress?: (event: ProgressEvent) => void;
  onComplete?: (event: ProgressEvent) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for subscribing to real-time progress updates
 * Uses Server-Sent Events (SSE) for streaming updates
 */
export function useProgress(
  eventId: string | null,
  options?: UseProgressOptions
) {
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("idle");
  const [message, setMessage] = useState<string>("");
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const baseUrl =
    options?.baseUrl ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");

  useEffect(() => {
    if (!eventId) {
      setIsConnected(false);
      return;
    }

    // Fetch progress history first
    const fetchHistory = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/api/progress/${eventId}/history`
        );
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events);
          if (data.latest) {
            setProgress(data.latest.progress);
            setStatus(data.latest.status);
            setMessage(data.latest.message);
          }
        }
      } catch (err) {
        console.error("[Progress] History fetch failed:", err);
      }
    };

    fetchHistory();

    // Connect to SSE stream
    const eventSource = new EventSource(
      `${baseUrl}/api/progress/${eventId}`
    );

    setIsConnected(true);

    eventSource.onmessage = (event) => {
      try {
        const data: ProgressEvent = JSON.parse(event.data);

        if (data.type === "connected") {
          console.log("[Progress] Connected to stream");
          return;
        }

        // Update state
        setProgress(data.progress);
        setStatus(data.status);
        setMessage(data.message);
        setError(null);

        // Add to history
        setEvents((prev) => [...prev, data]);

        // Call callbacks
        options?.onProgress?.(data);

        if (data.status === "completed") {
          options?.onComplete?.(data);
        }

        if (data.status === "failed") {
          const err = new Error(data.message);
          setError(err);
          options?.onError?.(err);
        }
      } catch (err) {
        console.error("[Progress] Parse error:", err);
      }
    };

    eventSource.onerror = () => {
      console.log("[Progress] Stream closed");
      eventSource.close();
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [eventId, baseUrl, options]);

  return {
    progress, // 0-100
    status, // started, processing, completed, failed
    message,
    events,
    error,
    isConnected,
    isComplete: status === "completed",
    isFailed: status === "failed",
    isProcessing: status === "processing" || status === "started",
  };
}
