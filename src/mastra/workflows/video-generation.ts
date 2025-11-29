import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import {
  styleSchema,
  formatSchema,
  aspectRatioSchema,
  languageSchema,
  clipTypeSchema,
  clipWithImageSchema,
  type GenerationContext,
  type ClipWithImage,
} from "../types";
import {
  generateOverallStoryboard,
  generateTranscriptAndImagePrompt,
  reviseImagePrompt,
} from "../services/storyboard";
import { generateImage } from "../services/image";
import {
  shouldCompactContext,
  compactContext,
} from "../services/summarization";
import {
  createOutputDirs,
  saveClipImage,
  saveClipAudio,
} from "../services/output";
import { generateNarrationAudio } from "../services/audio";
import { enhanceScriptWithAudioTags } from "../services/script";
import { combineImageAndAudio, concatenateClips } from "../services/video";

const MAX_IMAGE_RETRIES = 3;

// Step 1: Generate overall storyboard
const createStoryboardStep = createStep({
  id: "create-storyboard",
  inputSchema: z.object({
    content: z.string(),
    style: styleSchema,
    format: formatSchema,
    aspectRatio: aspectRatioSchema,
    language: languageSchema.default("en"),
    customInstructions: z.string().optional(),
    narrativeVoiceId: z.string().optional(),
    narrativeStyle: z.string().optional(),
  }),
  outputSchema: z.object({
    title: z.string(),
    narrativeFlow: z.string(),
    narrativeStyle: z.string(), // Always present after storyboard generation
    clipOutlines: z.array(
      z.object({
        index: z.number(),
        clipType: clipTypeSchema,
        title: z.string(),
        summary: z.string(),
      })
    ),
    content: z.string(),
    style: styleSchema,
    format: formatSchema,
    aspectRatio: aspectRatioSchema,
    language: languageSchema.default("en"),
    customInstructions: z.string().optional(),
    narrativeVoiceId: z.string().optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent("storyboardAgent");
    const storyboard = await generateOverallStoryboard(
      agent,
      inputData.content,
      inputData.style,
      inputData.format,
      inputData.language,
      inputData.customInstructions,
      inputData.narrativeStyle
    );

    return {
      ...storyboard,
      content: inputData.content,
      style: inputData.style,
      format: inputData.format,
      aspectRatio: inputData.aspectRatio,
      language: inputData.language,
      customInstructions: inputData.customInstructions,
      narrativeVoiceId: inputData.narrativeVoiceId,
      // Use the narrativeStyle from storyboard (already handles user-provided vs generated)
      narrativeStyle: storyboard.narrativeStyle,
    };
  },
});

// Step 2: Generate clips with images using shared context
const generateClipsStep = createStep({
  id: "generate-clips",
  inputSchema: z.object({
    title: z.string(),
    narrativeFlow: z.string(),
    narrativeStyle: z.string(), // Always present from storyboard step
    clipOutlines: z.array(
      z.object({
        index: z.number(),
        clipType: clipTypeSchema,
        title: z.string(),
        summary: z.string(),
      })
    ),
    content: z.string(),
    style: styleSchema,
    format: formatSchema,
    aspectRatio: aspectRatioSchema,
    language: languageSchema.default("en"),
    customInstructions: z.string().optional(),
    narrativeVoiceId: z.string().optional(),
  }),
  outputSchema: z.object({
    title: z.string(),
    clips: z.array(clipWithImageSchema),
    outputDir: z.string(),
    finalVideoPath: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const storyboardAgent = mastra.getAgent("storyboardAgent");
    const scriptEnhancerAgent = mastra.getAgent("scriptEnhancerAgent");

    const totalClips = inputData.clipOutlines.length;
    console.log(`\n🎬 Starting clip generation for "${inputData.title}"`);
    console.log(`📋 Total clips to generate: ${totalClips}`);
    console.log(
      `🎨 Style: ${inputData.style} | 📐 Aspect: ${inputData.aspectRatio} | 🌐 Language: ${inputData.language}`
    );
    console.log(`🗣️ Narrative style: ${inputData.narrativeStyle}\n`);

    // Create output directories
    const outputPaths = await createOutputDirs(inputData.title);
    console.log(`📁 Output directory: ${outputPaths.baseDir}\n`);

    // Initialize shared generation context
    const ctx: GenerationContext = {
      sourceContent: inputData.content,
      style: inputData.style,
      format: inputData.format,
      aspectRatio: inputData.aspectRatio,
      language: inputData.language,
      storyboardTitle: inputData.title,
      narrativeFlow: inputData.narrativeFlow,
      clipOutlines: inputData.clipOutlines,
      generatedClips: [],
      currentClipIndex: 0,
      customInstructions: inputData.customInstructions,
      narrativeVoiceId: inputData.narrativeVoiceId,
      narrativeStyle: inputData.narrativeStyle,
    };

    for (let i = 0; i < ctx.clipOutlines.length; i++) {
      ctx.currentClipIndex = i;
      const outline = ctx.clipOutlines[i];
      const clipNum = i + 1;

      console.log(`\n${"=".repeat(60)}`);
      console.log(
        `📍 CLIP ${clipNum}/${totalClips}: "${outline.title}" [${outline.clipType}]`
      );
      console.log(`${"=".repeat(60)}`);

      // Compact context if approaching size limit (incremental, ~30% reduction each time)
      if (shouldCompactContext(ctx)) {
        console.log(`🗜️ Compacting context...`);
        const summarizationAgent = mastra.getAgent("summarizationAgent");
        ctx.priorClipsSummary = await compactContext(summarizationAgent, ctx);
        console.log(`✅ Context compacted`);
      }

      // Generate transcript and image prompt with full context
      console.log(`📝 Generating transcript and image prompt...`);
      const startTranscript = Date.now();
      const clip = await generateTranscriptAndImagePrompt(storyboardAgent, ctx);
      console.log(
        `✅ Transcript generated (${((Date.now() - startTranscript) / 1000).toFixed(1)}s)`
      );
      console.log(`   Narration: "${clip.narration.slice(0, 80)}..."`);

      // Generate image with retry loop
      let imageData = "";
      let retries = 0;
      let currentImagePrompt = clip.imagePrompt;

      while (!imageData && retries < MAX_IMAGE_RETRIES) {
        const attempt = retries + 1;
        console.log(
          `🖼️ Generating image (attempt ${attempt}/${MAX_IMAGE_RETRIES})...`
        );
        const startImage = Date.now();

        try {
          imageData = await generateImage(ctx, currentImagePrompt);
          console.log(
            `   ✅ Image generated (${((Date.now() - startImage) / 1000).toFixed(1)}s)`
          );
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : "Unknown error";
          console.log(`   ❌ Image generation failed: ${errorMsg}`);

          // Revise prompt and retry
          if (retries < MAX_IMAGE_RETRIES - 1) {
            console.log(`   🔄 Revising prompt...`);
            currentImagePrompt = await reviseImagePrompt(
              storyboardAgent,
              currentImagePrompt,
              errorMsg,
              ctx
            );
            console.log(
              `   📝 New prompt: "${currentImagePrompt.slice(0, 80)}..."`
            );
          }
          retries++;
        }
      }

      // Save image to filesystem
      const clipWithImage: ClipWithImage = { ...clip, imageData };
      const imagePath = await saveClipImage(
        clipWithImage,
        outputPaths.imagesDir
      );
      console.log(`💾 Image saved: ${imagePath}`);

      // Enhance narration with audio tags for expressive TTS
      console.log(`🎭 Enhancing script with audio tags...`);
      const startEnhance = Date.now();
      const enhancedNarration = await enhanceScriptWithAudioTags(
        scriptEnhancerAgent,
        clip.narration,
        ctx.narrativeStyle || "natural and engaging"
      );
      console.log(
        `✅ Script enhanced (${((Date.now() - startEnhance) / 1000).toFixed(1)}s)`
      );
      console.log(`   Enhanced: "${enhancedNarration.slice(0, 80)}..."`);

      // Generate and save narration audio with enhanced script
      console.log(`🔊 Generating audio narration...`);
      const startAudio = Date.now();
      const audioBuffer = await generateNarrationAudio(
        enhancedNarration,
        ctx.language,
        ctx.narrativeVoiceId
      );
      const audioPath = await saveClipAudio(
        clip.index,
        audioBuffer,
        outputPaths.audioDir
      );
      console.log(
        `✅ Audio generated (${((Date.now() - startAudio) / 1000).toFixed(1)}s)`
      );
      console.log(`💾 Audio saved: ${audioPath}`);

      // Combine image + audio into video clip
      console.log(`🎥 Creating video clip...`);
      const startVideo = Date.now();
      const videoPath = await combineImageAndAudio(
        imagePath,
        audioPath,
        outputPaths.videosDir,
        clip.index,
        ctx.aspectRatio
      );
      console.log(
        `✅ Video created (${((Date.now() - startVideo) / 1000).toFixed(1)}s)`
      );
      console.log(`💾 Video saved: ${videoPath}`);

      ctx.generatedClips.push({
        ...clipWithImage,
        imagePath,
        audioPath,
        videoPath,
      });
      console.log(`\n✨ Clip ${clipNum}/${totalClips} complete!`);
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`🎉 ALL ${totalClips} CLIPS GENERATED SUCCESSFULLY!`);
    console.log(`${"=".repeat(60)}`);

    // Concatenate all clips into final video
    console.log(`\n🎬 Concatenating all clips into final video...`);
    const startConcat = Date.now();
    const clipVideoPaths = ctx.generatedClips
      .map((c) => c.videoPath)
      .filter((p): p is string => !!p);
    const finalVideoPath = await concatenateClips(
      clipVideoPaths,
      outputPaths.baseDir,
      ctx.storyboardTitle
    );
    console.log(
      `✅ Final video created (${((Date.now() - startConcat) / 1000).toFixed(1)}s)`
    );
    console.log(`💾 Final video: ${finalVideoPath}`);
    console.log(`📁 Output: ${outputPaths.baseDir}\n`);

    return {
      title: ctx.storyboardTitle,
      clips: ctx.generatedClips,
      outputDir: outputPaths.baseDir,
      finalVideoPath,
    };
  },
});

export const videoGenerationWorkflow = createWorkflow({
  id: "video-generation",
  inputSchema: z.object({
    content: z.string(),
    style: styleSchema,
    format: formatSchema,
    aspectRatio: aspectRatioSchema,
    language: languageSchema.default("en"),
    customInstructions: z.string().optional(),
    narrativeVoiceId: z.string().optional(),
    narrativeStyle: z.string().optional(),
  }),
  outputSchema: z.object({
    title: z.string(),
    clips: z.array(clipWithImageSchema),
    outputDir: z.string(),
    finalVideoPath: z.string(),
  }),
})
  .then(createStoryboardStep)
  .then(generateClipsStep)
  .commit();
