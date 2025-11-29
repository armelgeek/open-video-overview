import { Mastra } from "@mastra/core/mastra";
import { storyboardAgent } from "./agents/storyboard-agent";
import { summarizationAgent } from "./agents/summarization-agent";
import { scriptEnhancerAgent } from "./agents/script-enhancer-agent";
import { videoGenerationWorkflow } from "./workflows/video-generation";

export const mastra = new Mastra({
  agents: { storyboardAgent, summarizationAgent, scriptEnhancerAgent },
  workflows: { videoGenerationWorkflow },
});
