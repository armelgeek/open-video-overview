import { z } from "zod";
import type { Agent } from "@mastra/core/agent";
import {
  clipSchema,
  clipTypeSchema,
  type Clip,
  type Style,
  type Format,
  type Language,
  type GenerationContext,
  type ClipOutline,
} from "../types";
import { getStyleGuide, getClipTypeGuide } from "./style";

// Language code to full name mapping
const languageNames: Record<Language, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  pl: "Polish",
  tr: "Turkish",
  ru: "Russian",
  nl: "Dutch",
  cs: "Czech",
  ar: "Arabic",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  hi: "Hindi",
};

// Clip count requirements per format
const CLIP_COUNTS = {
  brief: { min: 6, max: 15 },
  explainer: { min: 10, max: 15 },
};

const clipOutlineSchema = z.object({
  index: z.number(),
  clipType: clipTypeSchema,
  title: z.string(),
  summary: z.string(),
});

const overallStoryboardSchema = z.object({
  title: z.string(),
  narrativeFlow: z.string(),
  narrativeStyle: z.string(),
  clipOutlines: z.array(clipOutlineSchema),
});

function formatPriorClips(ctx: GenerationContext): string {
  if (ctx.generatedClips.length === 0) {
    return "None (this is the first clip)";
  }

  const summarizedIndices = ctx.priorClipsSummary?.summarizedClipIndices ?? [];
  const parts: string[] = [];

  // Add summary section if exists
  if (ctx.priorClipsSummary && summarizedIndices.length > 0) {
    const s = ctx.priorClipsSummary;
    parts.push(`### Summarized (clips ${summarizedIndices.join(", ")})
Visual Progression: ${s.visualProgression}
Narrative: ${s.narrativeSummary}
Key Elements: ${s.keyElementsUsed.join(", ")}
Style Notes: ${s.styleNotes}`);
  }

  // Add full details for unsummarized clips
  const fullClips = ctx.generatedClips.filter(
    (c) => !summarizedIndices.includes(c.index)
  );

  if (fullClips.length > 0) {
    parts.push(
      `### Recent Clips (full details)\n` +
        fullClips
          .map(
            (c) =>
              `- Clip ${c.index} [${c.clipType}]: ${c.title}\n  Narration: ${c.narration}\n  Visual: ${c.visualDescription}`
          )
          .join("\n\n")
    );
  }

  return parts.join("\n\n");
}

export async function generateOverallStoryboard(
  agent: Agent,
  content: string,
  style: Style,
  format: Format,
  language: Language,
  customInstructions?: string,
  narrativeStyle?: string
): Promise<{
  title: string;
  narrativeFlow: string;
  narrativeStyle: string;
  clipOutlines: ClipOutline[];
}> {
  const styleGuide = getStyleGuide(style);
  const languageName = languageNames[language];

  const customSection = customInstructions
    ? `\n## Custom Instructions (MUST FOLLOW)\n${customInstructions}\n`
    : "";

  const narrativeSection = narrativeStyle
    ? `\n## Narrative Style (MUST FOLLOW)\nUse this exact narrative style: ${narrativeStyle}\n`
    : `\n## Narrative Style\nDecide the best narrative style for this content. Consider the topic, audience, and format. Examples: "casual and conversational", "professional and authoritative", "storytelling with suspense", "educational and friendly", "energetic and enthusiastic".\n`;

  const response = await agent.generate(
    `Create an overall storyboard for this content.

## Language (MUST FOLLOW)
All narration text MUST be written in ${languageName}. The title can be in ${languageName} as well.

## Style Guide
${styleGuide}
${customSection}${narrativeSection}
## Format
${format} (minimum ${CLIP_COUNTS[format].min} clips, maximum ${CLIP_COUNTS[format].max} clips)

## Clip Types
Each clip must have a clipType. Use these types:
- "intro": Opening clip - hook viewers, establish topic (first clip)
- "content": Main content clips - explain concepts, show details
- "outro": Closing clip - summarize, conclude (last clip)

Structure: intro → content clips → outro

## Content
${content}

IMPORTANT: Include a narrativeStyle field describing how the narration should sound (tone, pacing, personality). Write ALL narration in ${languageName}.`,
    {
      structuredOutput: {
        schema: overallStoryboardSchema,
      },
    }
  );

  // If user provided a narrativeStyle, use it; otherwise use the generated one
  return {
    ...response.object,
    narrativeStyle: narrativeStyle || response.object.narrativeStyle,
  };
}

export async function generateTranscriptAndImagePrompt(
  agent: Agent,
  ctx: GenerationContext
): Promise<Clip> {
  const currentOutline = ctx.clipOutlines[ctx.currentClipIndex];
  const styleGuide = getStyleGuide(ctx.style);
  const clipTypeGuide = getClipTypeGuide(currentOutline.clipType);
  const languageName = languageNames[ctx.language];

  const customSection = ctx.customInstructions
    ? `\n## Custom Instructions (MUST FOLLOW)\n${ctx.customInstructions}\n`
    : "";

  const narrativeSection = ctx.narrativeStyle
    ? `\n## Narrative Style (MUST FOLLOW)\nWrite the narration in this style: ${ctx.narrativeStyle}\n`
    : "";

  const response = await agent.generate(
    `Generate detailed transcript and image prompt for this clip.

## Language (MUST FOLLOW)
All narration text MUST be written in ${languageName}.

## Style Guide
${styleGuide}
${customSection}${narrativeSection}
## Clip Type Guide (${currentOutline.clipType})
${clipTypeGuide}

## Generation Context
Storyboard Title: ${ctx.storyboardTitle}
Narrative Flow: ${ctx.narrativeFlow}
Format: ${ctx.format}
Aspect Ratio: ${ctx.aspectRatio}
Language: ${languageName}

## Current Clip (${ctx.currentClipIndex + 1}/${ctx.clipOutlines.length})
- Index: ${currentOutline.index}
- Type: ${currentOutline.clipType}
- Title: ${currentOutline.title}
- Summary: ${currentOutline.summary}

## All Clip Outlines
${ctx.clipOutlines.map((o, i) => `${i === ctx.currentClipIndex ? "→" : " "} ${o.index}. [${o.clipType}] ${o.title}: ${o.summary}`).join("\n")}

## Previously Generated Clips
${formatPriorClips(ctx)}

## Source Content
${ctx.sourceContent}

CRITICAL REQUIREMENTS:
1. IMAGE-TRANSCRIPT ALIGNMENT (MOST IMPORTANT):
   - The image MUST directly illustrate what is being said in the narration
   - If the narration talks about a concept, the image must SHOW that concept visually
   - If the narration mentions objects, people, or scenarios, they must appear in the image
   - The viewer should be able to understand the narration just by looking at the image
   - Think: "What would perfectly visualize this exact narration?"

2. FORBIDDEN IN IMAGE PROMPTS (NEVER INCLUDE THESE):
   - "Clip X of Y", "Clip 1", "Clip 2", etc. - NO CLIP NUMBERS
   - "Part 1", "Part 2", "Section 1", "Chapter 1", etc.
   - "Intro", "Outro", "Introduction", "Conclusion"
   - Any text that references the video structure or clip sequence
   - The image should look like standalone art, NOT like a slide in a presentation

3. Style and Format:
   - Follow BOTH the style guide AND clip type guide
   - Your imagePrompt must reflect the ${currentOutline.clipType} clip type expectations
   - Write ALL narration in ${languageName}

4. Visual Storytelling:
   - The image is not decoration - it's the visual representation of the narration
   - Every element in the image should support what's being said
   - Create a clear visual narrative that matches the spoken content`,
    {
      structuredOutput: {
        schema: clipSchema,
      },
    }
  );

  return response.object;
}

const revisedPromptSchema = z.object({
  revisedImagePrompt: z.string(),
});

export async function reviseImagePrompt(
  agent: Agent,
  originalPrompt: string,
  failureReason: string,
  ctx: GenerationContext
): Promise<string> {
  const currentOutline = ctx.clipOutlines[ctx.currentClipIndex];

  const response = await agent.generate(
    `The image generation failed for this prompt. Revise it to be simpler and more likely to succeed.

## Failed Prompt
${originalPrompt}

## Failure Reason
${failureReason}

## Context
- Clip: ${currentOutline.title} (${currentOutline.clipType})
- Style: ${ctx.style}
- Aspect: ${ctx.aspectRatio}

## Revision Guidelines
- Simplify complex scenes into clearer compositions
- Remove potentially problematic elements (violence, controversial content)
- Focus on the core visual message
- Keep the same style and theme
- Make descriptions more concrete and less abstract
- Avoid overly specific or unusual requests

Return a revised, simpler image prompt that conveys the same message.`,
    {
      structuredOutput: {
        schema: revisedPromptSchema,
      },
    }
  );

  return response.object.revisedImagePrompt;
}
