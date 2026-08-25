// Webhook event types that match the server
export type EventType =
  | "image.generate"
  | "audio.generate"
  | "video.combine"
  | "video.concatenate"
  | "storyboard.generate"
  | "script.enhance"
  | "summarization.compact";

export interface WebhookEventPayload {
  eventId: string;
  type: EventType;
  callbackUrl: string;
  data: Record<string, unknown>;
  timestamp: string;
  timeout?: number;
}

export interface WebhookResponse<T = Record<string, unknown>> {
  eventId: string;
  status: "completed" | "failed";
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

// Event-specific payloads
export namespace Events {
  export interface ImageGenerateRequest {
    prompt: string;
    aspectRatio?: string;
    style?: string;
  }

  export interface ImageGenerateResponse {
    imageData: string;
  }

  export interface AudioGenerateRequest {
    narration: string;
    language?: string;
    voiceId?: string;
  }

  export interface AudioGenerateResponse {
    audioData: string;
  }

  export interface VideoCombineRequest {
    imagePath: string;
    audioPath: string;
    outputDir?: string;
    aspectRatio?: string;
  }

  export interface VideoCombineResponse {
    videoPath: string;
  }

  export interface VideoConcatenateRequest {
    videoPaths: string[];
    outputDir?: string;
    title?: string;
  }

  export interface VideoConcatenateResponse {
    finalVideoPath: string;
  }

  export interface StoryboardGenerateRequest {
    content: string;
    style?: string;
    format?: string;
    language?: string;
    customInstructions?: string;
    narrativeStyle?: string;
  }

  export interface StoryboardGenerateResponse {
    title: string;
    narrativeFlow: string;
    narrativeStyle: string;
    clipOutlines: Array<{
      index: number;
      clipType: string;
      title: string;
      summary: string;
    }>;
  }

  export interface ScriptEnhanceRequest {
    narration: string;
    narrativeStyle?: string;
  }

  export interface ScriptEnhanceResponse {
    enhancedNarration: string;
  }

  export interface SummarizationCompactRequest {
    content: string;
    maxLength?: number;
  }

  export interface SummarizationCompactResponse {
    summary: string;
  }
}

export interface SDKConfig {
  baseUrl: string;
  timeout?: number;
}
