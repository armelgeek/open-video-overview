import { Buffer } from "node:buffer";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { Language } from "../types";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Default voice for narration
const DEFAULT_VOICE_ID = "NYC9WEgkq1u4jiqBseQ9";

export async function generateNarrationAudio(
  narration: string,
  _language: Language, // Not used - v3 model auto-detects language from text
  voiceId?: string
): Promise<Buffer> {
  // Use user-provided voiceId or default
  const selectedVoiceId = voiceId || DEFAULT_VOICE_ID;

  // Use Text to Dialogue API which supports v3 audio tags like [excited], [whispers], etc.
  // The v3 model auto-detects language from the text content
  const audioStream = await client.textToDialogue.convert({
    inputs: [
      {
        text: narration,
        voiceId: selectedVoiceId,
      },
    ],
  });

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}
