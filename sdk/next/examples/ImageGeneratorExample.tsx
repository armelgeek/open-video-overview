"use client";

import { useState } from "react";
import { useGenerateImage } from "@videooverview/sdk";

/**
 * Example: Image generator component using the SDK
 */
export function ImageGeneratorExample() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("watercolor");
  const { generate, loading, error, data } = useGenerateImage({
    onSuccess: (result) => {
      console.log("Image generated successfully");
    },
    onError: (error) => {
      console.error("Image generation failed:", error.message);
    },
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    try {
      await generate({
        prompt,
        style,
        aspectRatio: "16:9",
      });
    } catch (err) {
      // Error is already handled by onError callback
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Image Generator</h1>

      <form onSubmit={handleGenerate} className="space-y-4 mb-8">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-100"
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="style" className="block text-sm font-medium mb-2">
            Style
          </label>
          <select
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-100"
          >
            <option value="watercolor">Watercolor</option>
            <option value="anime">Anime</option>
            <option value="oil-painting">Oil Painting</option>
            <option value="3d-render">3D Render</option>
            <option value="photo">Photo</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:bg-gray-400 hover:bg-blue-700"
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6">
          <p className="font-medium">Error</p>
          <p>{error.message}</p>
        </div>
      )}

      {data?.imageData && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Generated Image</h2>
          <img
            src={`data:image/png;base64,${data.imageData.slice(0, 100)}...`}
            alt="Generated"
            className="w-full rounded-lg"
          />
          <p className="text-sm text-gray-500">
            Image size: {Math.round(data.imageData.length / 1024)} KB
          </p>
        </div>
      )}
    </div>
  );
}
