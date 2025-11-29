import { z } from "zod";
import type { Agent } from "@mastra/core/agent";

const enhancedScriptSchema = z.object({
  enhancedNarration: z.string(),
});

export async function enhanceScriptWithAudioTags(
  agent: Agent,
  narration: string,
  narrativeStyle: string
): Promise<string> {
  const response = await agent.generate(
    `Enhance this narration script with ElevenLabs audio tags.

## Narrative Style
${narrativeStyle}

## Original Narration
${narration}

## Instructions
Add audio tags like [excited], [whispers], [sighs], [laughs], [pauses], etc. to make the narration more expressive and match the narrative style.

- Place tags before phrases they modify: "[excited] This is amazing!"
- Use tags for reactions after phrases: "I can't believe it. [sighs]"
- Add emphasis with CAPITALS for key words
- Add ellipses (...) for dramatic pauses
- Match the emotional tone to the narrative style

Return ONLY the enhanced narration text with audio tags. Do not include any explanation.`,
    {
      structuredOutput: {
        schema: enhancedScriptSchema,
      },
    }
  );

  return response.object.enhancedNarration;
}
