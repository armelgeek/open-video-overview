import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSummarizationServiceEndpoint } from "../../../src/mastra/services/summarization/server";

describe("Summarization Service Server", () => {
  let mockApp: any;
  let postHandler: any;

  beforeEach(() => {
    mockApp = {
      post: vi.fn((path: string, handler: any) => {
        if (path === "/webhooks/summarize") {
          postHandler = handler;
        }
      }),
    };

    createSummarizationServiceEndpoint(mockApp);
  });

  it("should accept webhook request with 202", async () => {
    const req = {
      body: {
        eventId: crypto.randomUUID(),
        callbackUrl: "http://localhost:3000/callback",
        data: { content: "test content" },
        timestamp: new Date().toISOString(),
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await postHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(202);
  });

  it("should reject invalid payload", async () => {
    const req = {
      body: {
        data: {},
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await postHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
