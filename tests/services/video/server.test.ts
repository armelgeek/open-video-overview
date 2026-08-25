import { describe, it, expect, beforeEach, vi } from "vitest";
import { createVideoServiceEndpoint } from "../../../src/mastra/services/video/server";

describe("Video Service Server", () => {
  let mockApp: any;
  let postHandler: any;

  beforeEach(() => {
    mockApp = {
      post: vi.fn((path: string, handler: any) => {
        if (path === "/webhooks/combine") {
          postHandler = handler;
        }
      }),
    };

    createVideoServiceEndpoint(mockApp);
  });

  it("should accept webhook request with 202", async () => {
    const req = {
      body: {
        eventId: crypto.randomUUID(),
        callbackUrl: "http://localhost:3000/callback",
        data: { imagePath: "/path/to/image.jpg", audioPath: "/path/to/audio.mp3" },
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

  it("should register webhook endpoint", () => {
    expect(mockApp.post).toHaveBeenCalledWith(
      "/webhooks/combine",
      expect.any(Function)
    );
  });
});
