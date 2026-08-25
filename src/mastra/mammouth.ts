import process from "node:process";

export const MAMMOUTH_URL = "https://api.mammouth.ai/v1";

// Mammouth is OpenAI-compatible: same endpoint for text and image models.
export const mammouth = (modelId: string) => ({
  providerId: "mammouth",
  modelId,
  url: MAMMOUTH_URL,
  apiKey: process.env.MAMMOUTH_API_KEY,
});

export const TEXT_MODEL = process.env.MAMMOUTH_TEXT_MODEL ?? "gemini-3.1-pro-preview";
export const IMAGE_MODEL =
  process.env.MAMMOUTH_IMAGE_MODEL ?? "gemini-3.1-flash-image-preview";

/** Returns base64 image data from a chat completion with an image model. */
export async function mammouthImage(prompt: string): Promise<string> {
  const res = await fetch(`${MAMMOUTH_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MAMMOUTH_API_KEY}`,
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Mammouth image failed: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  const url: string | undefined =
    json?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

  if (!url) throw new Error("No image generated");

  return url.replace(/^data:image\/\w+;base64,/, "");
}
