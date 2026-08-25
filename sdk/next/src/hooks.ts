"use client";

import { useState, useCallback, useRef } from "react";
import type {
  Events,
} from "./types";
import { VideoOverviewSDK } from "./client";

interface UseEventOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for generating images
 */
export function useGenerateImage(options?: UseEventOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<Events.ImageGenerateResponse | null>(null);
  const sdkRef = useRef<VideoOverviewSDK | null>(null);

  const generate = useCallback(
    async (request: Events.ImageGenerateRequest) => {
      if (!sdkRef.current) {
        const err = new Error("SDK not initialized");
        setError(err);
        options?.onError?.(err);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await sdkRef.current.generateImage(request);
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return { generate, loading, error, data };
}

/**
 * Hook for generating audio
 */
export function useGenerateAudio(options?: UseEventOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<Events.AudioGenerateResponse | null>(null);
  const sdkRef = useRef<VideoOverviewSDK | null>(null);

  const generate = useCallback(
    async (request: Events.AudioGenerateRequest) => {
      if (!sdkRef.current) {
        const err = new Error("SDK not initialized");
        setError(err);
        options?.onError?.(err);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await sdkRef.current.generateAudio(request);
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return { generate, loading, error, data };
}

/**
 * Hook for generating storyboards
 */
export function useGenerateStoryboard(options?: UseEventOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<Events.StoryboardGenerateResponse | null>(null);
  const sdkRef = useRef<VideoOverviewSDK | null>(null);

  const generate = useCallback(
    async (request: Events.StoryboardGenerateRequest) => {
      if (!sdkRef.current) {
        const err = new Error("SDK not initialized");
        setError(err);
        options?.onError?.(err);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await sdkRef.current.generateStoryboard(request);
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return { generate, loading, error, data };
}

/**
 * Hook for enhancing scripts
 */
export function useEnhanceScript(options?: UseEventOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<Events.ScriptEnhanceResponse | null>(null);
  const sdkRef = useRef<VideoOverviewSDK | null>(null);

  const enhance = useCallback(
    async (request: Events.ScriptEnhanceRequest) => {
      if (!sdkRef.current) {
        const err = new Error("SDK not initialized");
        setError(err);
        options?.onError?.(err);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await sdkRef.current.enhanceScript(request);
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return { enhance, loading, error, data };
}

/**
 * Initialize SDK in a component
 */
export function useSdk(baseUrl: string, timeout?: number) {
  const sdkRef = useRef<VideoOverviewSDK | null>(null);

  if (!sdkRef.current) {
    const { VideoOverviewSDK: SDK } = require("./client");
    sdkRef.current = new SDK({ baseUrl, timeout });
  }

  return sdkRef.current;
}
