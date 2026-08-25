import { WebhookRegistry } from "./registry";
import { generateImage } from "../services/image";
import { generateNarrationAudio } from "../services/audio";
import {
  combineImageAndAudio,
  concatenateClips,
} from "../services/video";
import {
  generateOverallStoryboard,
  generateTranscriptAndImagePrompt,
  reviseImagePrompt,
} from "../services/storyboard";
import { enhanceScriptWithAudioTags } from "../services/script";
import { compactContext } from "../services/summarization";

export function initializeWebhookHandlers(registry: WebhookRegistry): void {
  // Image handler
  registry.registerHandler("image.generate", async (data: any) => {
    const imageData = await generateImage(
      data.prompt,
      data.aspectRatio,
      data.style
    );
    return { imageData };
  });

  // Audio handler
  registry.registerHandler("audio.generate", async (data: any) => {
    const audioBuffer = await generateNarrationAudio(
      data.narration,
      data.language,
      data.voiceId
    );
    const audioData = Buffer.isBuffer(audioBuffer)
      ? audioBuffer.toString("base64")
      : audioBuffer;
    return { audioData };
  });

  // Video combine handler
  registry.registerHandler("video.combine", async (data: any) => {
    const videoPath = await combineImageAndAudio(
      data.imagePath,
      data.audioPath,
      data.outputDir || "./output",
      0,
      data.aspectRatio
    );
    return { videoPath };
  });

  // Video concatenate handler
  registry.registerHandler("video.concatenate", async (data: any) => {
    const finalVideoPath = await concatenateClips(
      data.videoPaths,
      data.outputDir || "./output",
      data.title || "final-video"
    );
    return { finalVideoPath };
  });

  // Storyboard handler
  registry.registerHandler("storyboard.generate", async (data: any) => {
    const storyboard = await generateOverallStoryboard(
      null,
      data.content,
      data.style,
      data.format,
      data.language,
      data.customInstructions,
      data.narrativeStyle
    );
    return storyboard;
  });

  // Script enhancement handler
  registry.registerHandler("script.enhance", async (data: any) => {
    const enhancedNarration = await enhanceScriptWithAudioTags(
      null,
      data.narration,
      data.narrativeStyle || "natural and engaging"
    );
    return { enhancedNarration };
  });

  // Summarization handler
  registry.registerHandler("summarization.compact", async (data: any) => {
    const summary = await compactContext(null, data.content);
    return { summary };
  });

  console.log("[WebhookInitializer] All handlers registered");
}
