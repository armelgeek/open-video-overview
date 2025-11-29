import { z } from "zod";

// Visual styles
export const styleSchema = z.enum([
  // Original styles
  "watercolor",
  "anime",
  "retro",
  "whiteboard",
  "classic",
  // High-impact styles
  "cinematic",
  "isometric",
  "flat",
  "comic",
  "neon",
  // Artistic styles
  "oil",
  "sketch",
  "papercut",
  "popart",
  // Audience-specific styles
  "storybook",
  "pixel",
  "minimalist",
  "infographic",
  // Mood-based styles
  "documentary",
  "gothic",
  "pastel",
  // Educational/mathematical styles
  "3b1b",
  // Professional/corporate styles
  "corporate",
  "presentation",
  "tech",
]);
export type Style = z.infer<typeof styleSchema>;

// Format options
export const formatSchema = z.enum(["explainer", "brief"]);
export type Format = z.infer<typeof formatSchema>;

// Aspect ratios
export const aspectRatioSchema = z.enum(["16:9", "9:16"]);
export type AspectRatio = z.infer<typeof aspectRatioSchema>;

// Supported languages
export const languageSchema = z.enum([
  "en", // English
  "es", // Spanish
  "fr", // French
  "de", // German
  "it", // Italian
  "pt", // Portuguese
  "pl", // Polish
  "tr", // Turkish
  "ru", // Russian
  "nl", // Dutch
  "cs", // Czech
  "ar", // Arabic
  "zh", // Chinese
  "ja", // Japanese
  "ko", // Korean
  "hi", // Hindi
]);
export type Language = z.infer<typeof languageSchema>;

// Clip types
export const clipTypeSchema = z.enum(["intro", "content", "outro"]);
export type ClipType = z.infer<typeof clipTypeSchema>;

// Clip from storyboard agent
export const clipSchema = z.object({
  index: z.number(),
  clipType: clipTypeSchema,
  title: z.string(),
  narration: z.string(),
  imagePrompt: z.string(),
  visualDescription: z.string(),
  keyElements: z.array(z.string()),
});
export type Clip = z.infer<typeof clipSchema>;

// Storyboard structure
export const storyboardSchema = z.object({
  title: z.string(),
  narrativeFlow: z.string(),
  clips: z.array(clipSchema),
});
export type Storyboard = z.infer<typeof storyboardSchema>;

// Clip with generated image, audio, and video
export const clipWithImageSchema = clipSchema.extend({
  imageData: z.string(),
  imagePath: z.string().optional(),
  audioPath: z.string().optional(),
  videoPath: z.string().optional(),
});
export type ClipWithImage = z.infer<typeof clipWithImageSchema>;

// Validation result
export const validationResultSchema = z.object({
  approved: z.boolean(),
  reason: z.string().optional(),
});
export type ValidationResult = z.infer<typeof validationResultSchema>;

// Workflow input
export const videoGenerationInputSchema = z.object({
  content: z.string(),
  style: styleSchema,
  format: formatSchema,
  aspectRatio: aspectRatioSchema,
  language: languageSchema.default("en"),
  customInstructions: z.string().optional(),
  narrativeVoiceId: z.string().optional(),
  narrativeStyle: z.string().optional(),
});
export type VideoGenerationInput = z.infer<typeof videoGenerationInputSchema>;

// Workflow output
export const videoOutputSchema = z.object({
  videoPath: z.string(),
  totalDuration: z.number(),
  clipCount: z.number(),
});
export type VideoOutput = z.infer<typeof videoOutputSchema>;

// Clip outline (before full generation)
export const clipOutlineSchema = z.object({
  index: z.number(),
  clipType: clipTypeSchema,
  title: z.string(),
  summary: z.string(),
});
export type ClipOutline = z.infer<typeof clipOutlineSchema>;

// Compacted summary of prior clips
export const contextSummarySchema = z.object({
  summarizedClipIndices: z.array(z.number()),
  visualProgression: z.string(),
  narrativeSummary: z.string(),
  keyElementsUsed: z.array(z.string()),
  styleNotes: z.string(),
});
export type ContextSummary = z.infer<typeof contextSummarySchema>;

// Full generation context - shared across all services
export interface GenerationContext {
  sourceContent: string;
  style: Style;
  format: Format;
  aspectRatio: AspectRatio;
  language: Language;
  storyboardTitle: string;
  narrativeFlow: string;
  clipOutlines: ClipOutline[];
  generatedClips: ClipWithImage[];
  currentClipIndex: number;
  // Partial summary of older clips (incremental compaction)
  priorClipsSummary?: ContextSummary;
  // User-provided custom instructions (optional but high priority if provided)
  customInstructions?: string;
  // Voice ID for narration (ElevenLabs)
  narrativeVoiceId?: string;
  // Narrative style for transcript generation (e.g., "casual", "professional", "storytelling")
  narrativeStyle?: string;
}
