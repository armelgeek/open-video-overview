import { z } from "zod";

export const WebhookEventSchema = z.object({
  eventId: z.string().uuid(),
  type: z.string().min(1),
  callbackUrl: z.string().url(),
  data: z.record(z.unknown()),
  timestamp: z.string().datetime(),
  timeout: z.number().optional(),
  retryConfig: z
    .object({
      maxAttempts: z.number().int().positive(),
      backoffMs: z.number().int().positive(),
    })
    .optional(),
});

export const WebhookResponseSchema = z.object({
  eventId: z.string().uuid(),
  status: z.enum(["completed", "failed"]),
  data: z.record(z.unknown()).optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      details: z.unknown().optional(),
    })
    .optional(),
  timestamp: z.string().datetime(),
});

export const EventRecordSchema = z.object({
  eventId: z.string().uuid(),
  type: z.string(),
  status: z.enum(["pending", "completed", "failed", "timeout"]),
  attempts: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  lastError: z.string().optional(),
  result: WebhookResponseSchema.optional(),
});
