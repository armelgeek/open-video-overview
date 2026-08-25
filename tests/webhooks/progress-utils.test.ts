import { describe, it, expect } from "vitest";
import {
  calculateProgress,
  getImageProgressMessage,
  getClipProgressMessage,
  calculateMultiStageProgress,
  getClipDetailedMessage,
} from "../../src/mastra/webhooks/progress-utils";

describe("Progress Utils", () => {
  describe("calculateProgress", () => {
    it("should calculate progress from steps", () => {
      expect(
        calculateProgress({
          current: 1,
          total: 4,
          status: "processing",
          message: "test",
        })
      ).toBe(25);

      expect(
        calculateProgress({
          current: 2,
          total: 4,
          status: "processing",
          message: "test",
        })
      ).toBe(50);

      expect(
        calculateProgress({
          current: 3,
          total: 4,
          status: "processing",
          message: "test",
        })
      ).toBe(75);

      expect(
        calculateProgress({
          current: 4,
          total: 4,
          status: "completed",
          message: "test",
        })
      ).toBe(100);
    });

    it("should cap progress at 100", () => {
      expect(
        calculateProgress({
          current: 5,
          total: 4,
          status: "completed",
          message: "test",
        })
      ).toBe(100);
    });
  });

  describe("getImageProgressMessage", () => {
    it("should generate starting message", () => {
      const msg = getImageProgressMessage({
        current: 1,
        total: 5,
        status: "starting",
        message: "test",
      });
      expect(msg).toBe("Preparing to generate image 1/5...");
    });

    it("should generate processing message", () => {
      const msg = getImageProgressMessage({
        current: 2,
        total: 5,
        status: "processing",
        message: "rendering",
      });
      expect(msg).toBe("Generating image 2/5: rendering");
    });

    it("should generate completion message", () => {
      const msg = getImageProgressMessage({
        current: 5,
        total: 5,
        status: "completed",
        message: "test",
      });
      expect(msg).toBe("Image 5/5 complete");
    });
  });

  describe("getClipProgressMessage", () => {
    it("should generate clip message without substep", () => {
      const msg = getClipProgressMessage({
        current: 1,
        total: 3,
        status: "starting",
        message: "test",
      });
      expect(msg).toContain("Clip 1/3");
    });

    it("should include substep in message", () => {
      const msg = getClipProgressMessage(
        {
          current: 2,
          total: 3,
          status: "processing",
          message: "test",
        },
        "image"
      );
      expect(msg).toContain("Clip 2/3");
      expect(msg).toContain("generating image");
    });
  });

  describe("calculateMultiStageProgress", () => {
    it("should calculate image stage progress", () => {
      // Clip 1/3 at image stage (20% of 33%)
      const progress = calculateMultiStageProgress(0, 3, "image");
      expect(progress).toBe(Math.round((1 / 3) * 100 * 0.2));
    });

    it("should calculate audio stage progress", () => {
      // Clip 2/3 at audio stage (50% of 33%)
      const progress = calculateMultiStageProgress(1, 3, "audio");
      expect(progress).toBeGreaterThan(
        calculateMultiStageProgress(1, 3, "image")
      );
      expect(progress).toBeLessThan(calculateMultiStageProgress(1, 3, "combine"));
    });

    it("should calculate combine stage progress", () => {
      // Clip 3/3 at combine stage (80% of 33%)
      const progress = calculateMultiStageProgress(2, 3, "combine");
      expect(progress).toBeGreaterThan(
        calculateMultiStageProgress(2, 3, "audio")
      );
    });

    it("should progress through clips", () => {
      const p1 = calculateMultiStageProgress(0, 5, "combine");
      const p2 = calculateMultiStageProgress(1, 5, "combine");
      const p3 = calculateMultiStageProgress(4, 5, "combine");

      expect(p2).toBeGreaterThan(p1);
      expect(p3).toBeGreaterThan(p2);
      expect(p3).toBeLessThanOrEqual(100);
    });
  });

  describe("getClipDetailedMessage", () => {
    it("should generate image stage message", () => {
      const msg = getClipDetailedMessage(
        1,
        5,
        "Introduction",
        "image"
      );
      expect(msg).toContain("Clip 1/5");
      expect(msg).toContain("Introduction");
      expect(msg).toContain("Generating image");
    });

    it("should generate audio stage message", () => {
      const msg = getClipDetailedMessage(2, 5, "Main Content", "audio");
      expect(msg).toContain("Clip 2/5");
      expect(msg).toContain("Main Content");
      expect(msg).toContain("Generating audio");
    });

    it("should generate combine stage message", () => {
      const msg = getClipDetailedMessage(
        3,
        5,
        "Conclusion",
        "combine"
      );
      expect(msg).toContain("Clip 3/5");
      expect(msg).toContain("Conclusion");
      expect(msg).toContain("Combining image + audio");
    });
  });
});
