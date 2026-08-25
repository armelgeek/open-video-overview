export interface WebhookEvent {
  eventId: string;
  type: string;
  callbackUrl: string;
  data: Record<string, unknown>;
  timestamp: string; // ISO8601
  timeout?: number; // ms
  retryConfig?: {
    maxAttempts: number;
    backoffMs: number;
  };
}

export interface WebhookResponse {
  eventId: string;
  status: "completed" | "failed";
  data?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string; // ISO8601
}

export interface EventRecord {
  eventId: string;
  type: string;
  status: "pending" | "completed" | "failed" | "timeout";
  attempts: number;
  createdAt: string; // ISO8601
  completedAt?: string;
  lastError?: string;
  result?: WebhookResponse;
}

export interface ServiceConfig {
  url: string;
  webhookPath: string;
  timeout?: number;
  maxRetries?: number;
}
