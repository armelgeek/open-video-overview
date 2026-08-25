import { describe, it, expect, beforeEach, vi } from "vitest";
import { createImageServiceEndpoint } from "../../../src/mastra/services/image/server";

describe("Image Service Server", () => {
  let mockApp: any;
  let postHandler: any;

  beforeEach(() => {
    mockApp = {
      post: vi.fn((path: string, handler: any) => {
        if (path === "/webhooks/image") {
          postHandler = handler;
        }
      }),
    };

    createImageServiceEndpoint(mockApp);
  });

  it("should accept webhook request with 202", async () => {
    const req = {
      body: {
        eventId: crypto.randomUUID(),
        callbackUrl: "http://localhost:3000/callback",
        data: { prompt: "test image" },
        timestamp: new Date().toISOString(),
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await postHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(202);
    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.status).toBe("accepted");
  });

  it("should reject invalid payload", async () => {
    const req = {
      body: {
        // Missing required fields
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

  it("should register webhook endpoint", () => {
    expect(mockApp.post).toHaveBeenCalledWith(
      "/webhooks/image",
      expect.any(Function)
    );
  });
});
