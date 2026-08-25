import { mammouthImage } from "../mammouth";
import type { GenerationContext } from "../types";
import {
  getStyleGuide,
  getClipTypeGuide,
  getStylePromptAdditions,
  getStyleAvoidList,
  getClipTypeAvoidList,
} from "./style";

export async function generateImage(
  ctx: GenerationContext,
  imagePrompt: string
): Promise<string> {
  const currentOutline = ctx.clipOutlines[ctx.currentClipIndex];
  const styleGuide = getStyleGuide(ctx.style);
  const clipTypeGuide = getClipTypeGuide(currentOutline.clipType);
  const styleAdditions = getStylePromptAdditions(ctx.style);
  const styleAvoid = getStyleAvoidList(ctx.style);
  const clipTypeAvoid = getClipTypeAvoidList(currentOutline.clipType);

  const allAvoid = [...new Set([...styleAvoid, ...clipTypeAvoid])];

  const customSection = ctx.customInstructions
    ? `\n## Custom Instructions (MUST FOLLOW)\n${ctx.customInstructions}\n`
    : "";

  return mammouthImage(`Create an illustration for "${ctx.storyboardTitle}".

## Technical Requirements
- Aspect ratio: ${ctx.aspectRatio}
- Clip ${ctx.currentClipIndex + 1} of ${ctx.clipOutlines.length} (${currentOutline.clipType} clip)

## Full Style Guide - FOLLOW ALL RULES
${styleGuide}
${customSection}
## Clip Type Guide
${clipTypeGuide}

## Image Prompt
${imagePrompt}

## Required Style Elements
${styleAdditions}

## MUST AVOID - Do not include any of these
${allAvoid.map((item) => `- ${item}`).join("\n")}`);
}