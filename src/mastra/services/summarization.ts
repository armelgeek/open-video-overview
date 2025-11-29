import type { Agent } from "@mastra/core/agent";
import {
  contextSummarySchema,
  type ContextSummary,
  type GenerationContext,
  type ClipWithImage,
} from "../types";

// Context size limit (characters) - increased to delay summarization and preserve full context longer
const CONTEXT_SIZE_LIMIT = 400_000;
// Target reduction: summarize oldest 30% of clips
const COMPACTION_RATIO = 0.3;

function estimateClipContextSize(clip: ClipWithImage): number {
  return (
    clip.title.length +
    clip.narration.length +
    clip.imagePrompt.length +
    clip.visualDescription.length +
    clip.keyElements.join(", ").length +
    100 // overhead
  );
}

function estimateContextSize(ctx: GenerationContext): number {
  const baseSize =
    ctx.sourceContent.length +
    ctx.storyboardTitle.length +
    ctx.narrativeFlow.length +
    ctx.clipOutlines.reduce(
      (sum, o) => sum + o.title.length + o.summary.length + 50,
      0
    );

  const clipsSize = ctx.generatedClips.reduce(
    (sum, clip) => sum + estimateClipContextSize(clip),
    0
  );

  const summarySize = ctx.priorClipsSummary
    ? ctx.priorClipsSummary.visualProgression.length +
      ctx.priorClipsSummary.narrativeSummary.length +
      ctx.priorClipsSummary.keyElementsUsed.join(", ").length +
      ctx.priorClipsSummary.styleNotes.length
    : 0;

  return baseSize + clipsSize + summarySize;
}

export function shouldCompactContext(ctx: GenerationContext): boolean {
  if (ctx.generatedClips.length < 2) return false;
  return estimateContextSize(ctx) > CONTEXT_SIZE_LIMIT;
}

export function getClipsToSummarize(ctx: GenerationContext): ClipWithImage[] {
  const alreadySummarized = ctx.priorClipsSummary?.summarizedClipIndices ?? [];
  const unsummarizedClips = ctx.generatedClips.filter(
    (c) => !alreadySummarized.includes(c.index)
  );

  // Summarize oldest 30% of unsummarized clips
  const countToSummarize = Math.max(
    1,
    Math.ceil(unsummarizedClips.length * COMPACTION_RATIO)
  );
  return unsummarizedClips.slice(0, countToSummarize);
}

export async function compactContext(
  agent: Agent,
  ctx: GenerationContext
): Promise<ContextSummary> {
  const clipsToSummarize = getClipsToSummarize(ctx);
  const existingSummary = ctx.priorClipsSummary;

  const criticalRules = `
## CRITICAL RULES TO PRESERVE (must be included in styleNotes)
- Images must directly illustrate what is being said in the narration
- FORBIDDEN: "Clip X of Y", clip numbers, "Part 1", "Section", "Chapter", "INTRO", "OUTRO"
- FORBIDDEN: Any text referencing video structure or sequence
- Images should look like standalone art, NOT presentation slides`;

  const prompt = existingSummary
    ? `Extend this existing summary with new clips.

## Existing Summary (clips ${existingSummary.summarizedClipIndices.join(", ")})
Visual Progression: ${existingSummary.visualProgression}
Narrative: ${existingSummary.narrativeSummary}
Key Elements: ${existingSummary.keyElementsUsed.join(", ")}
Style Notes: ${existingSummary.styleNotes}

## New Clips to Add to Summary
${clipsToSummarize
  .map(
    (c) => `### Clip ${c.index}: ${c.title}
Narration: ${c.narration}
Visual: ${c.visualDescription}
Key Elements: ${c.keyElements.join(", ")}`
  )
  .join("\n\n")}
${criticalRules}

Merge into a unified summary. Keep it concise but preserve continuity details.
IMPORTANT: In styleNotes, ALWAYS include the critical rules about forbidden meta-text and image-narration alignment.`
    : `Summarize these clips into a compact context for continuity.

## Storyboard
Title: ${ctx.storyboardTitle}
Style: ${ctx.style}

## Clips to Summarize
${clipsToSummarize
  .map(
    (c) => `### Clip ${c.index}: ${c.title}
Narration: ${c.narration}
Visual: ${c.visualDescription}
Key Elements: ${c.keyElements.join(", ")}`
  )
  .join("\n\n")}
${criticalRules}

Create a compact summary preserving essential continuity information.
IMPORTANT: In styleNotes, ALWAYS include the critical rules about forbidden meta-text and image-narration alignment.`;

  const response = await agent.generate(prompt, {
    structuredOutput: {
      schema: contextSummarySchema,
    },
  });

  // Merge indices
  const allSummarizedIndices = [
    ...(existingSummary?.summarizedClipIndices ?? []),
    ...clipsToSummarize.map((c) => c.index),
  ];

  return {
    ...response.object,
    summarizedClipIndices: allSummarizedIndices,
  };
}
