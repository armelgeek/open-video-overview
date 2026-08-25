import { describe, it, expect, beforeEach } from "vitest";
import { WebhookRegistry } from "../../src/mastra/webhooks/registry";

describe("WebhookRegistry", () => {
  let registry: WebhookRegistry;

  beforeEach(() => {
    registry = new WebhookRegistry();
    registry.loadRegistry();
  });

  it("should load registry from config", () => {
    expect(registry.getServiceUrl("image.generate")).toBe(
      "http://localhost:3001"
    );
    expect(registry.getServiceUrl("audio.generate")).toBe(
      "http://localhost:3002"
    );
  });

  it("should get service config", () => {
    const config = registry.getServiceConfig("image.generate");
    expect(config?.webhookPath).toBe("/webhooks/image");
    expect(config?.timeout).toBe(300000);
  });

  it("should register new service", () => {
    registry.registerService("custom.service", {
      url: "http://localhost:9000",
      webhookPath: "/webhooks/custom",
      timeout: 120000,
      maxRetries: 2,
    });

    expect(registry.getServiceUrl("custom.service")).toBe(
      "http://localhost:9000"
    );
  });

  it("should throw for unknown service", () => {
    expect(() => registry.getServiceUrl("nonexistent.service")).toThrow(
      "Service not found: nonexistent.service"
    );
  });
});
