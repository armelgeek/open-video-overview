import type {
  EventType,
  WebhookEventPayload,
  WebhookResponse,
  SDKConfig,
  Events,
} from "./types";

export class VideoOverviewSDK {
  private baseUrl: string;
  private timeout: number;

  constructor(config: SDKConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.timeout = config.timeout || 300000; // 5 min default
  }

  /**
   * Generate an image from a prompt
   */
  async generateImage(
    request: Events.ImageGenerateRequest
  ): Promise<Events.ImageGenerateResponse> {
    return this.emit<Events.ImageGenerateResponse>("image.generate", request);
  }

  /**
   * Generate audio narration from text
   */
  async generateAudio(
    request: Events.AudioGenerateRequest
  ): Promise<Events.AudioGenerateResponse> {
    return this.emit<Events.AudioGenerateResponse>("audio.generate", request);
  }

  /**
   * Combine image and audio into a video clip
   */
  async combineVideo(
    request: Events.VideoCombineRequest
  ): Promise<Events.VideoCombineResponse> {
    return this.emit<Events.VideoCombineResponse>("video.combine", request);
  }

  /**
   * Concatenate multiple video clips
   */
  async concatenateVideos(
    request: Events.VideoConcatenateRequest
  ): Promise<Events.VideoConcatenateResponse> {
    return this.emit<Events.VideoConcatenateResponse>(
      "video.concatenate",
      request
    );
  }

  /**
   * Generate a storyboard from content
   */
  async generateStoryboard(
    request: Events.StoryboardGenerateRequest
  ): Promise<Events.StoryboardGenerateResponse> {
    return this.emit<Events.StoryboardGenerateResponse>(
      "storyboard.generate",
      request
    );
  }

  /**
   * Enhance a script with audio tags
   */
  async enhanceScript(
    request: Events.ScriptEnhanceRequest
  ): Promise<Events.ScriptEnhanceResponse> {
    return this.emit<Events.ScriptEnhanceResponse>("script.enhance", request);
  }

  /**
   * Summarize/compact content
   */
  async summarizeContent(
    request: Events.SummarizationCompactRequest
  ): Promise<Events.SummarizationCompactResponse> {
    return this.emit<Events.SummarizationCompactResponse>(
      "summarization.compact",
      request
    );
  }

  /**
   * Generic emit function for custom events
   */
  private async emit<T = Record<string, unknown>>(
    type: EventType,
    data: unknown
  ): Promise<T> {
    const eventId = this.generateUUID();
    const event: WebhookEventPayload = {
      eventId,
      type,
      callbackUrl: "", // Not used in single-process mode
      data: data as Record<string, unknown>,
      timestamp: new Date().toISOString(),
      timeout: this.timeout,
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/webhooks/emit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: WebhookResponse<T> = await response.json();

      if (result.status === "failed") {
        throw new Error(
          `Event failed: ${result.error?.message || "Unknown error"}`
        );
      }

      return (result.data as T) || ({} as T);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to emit event (${type}): ${message}`);
    }
  }

  private generateUUID(): string {
    return crypto.randomUUID();
  }
}

export function createClient(baseUrl: string, timeout?: number): VideoOverviewSDK {
  return new VideoOverviewSDK({ baseUrl, timeout });
}
