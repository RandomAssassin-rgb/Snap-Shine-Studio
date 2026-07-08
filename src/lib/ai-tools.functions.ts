import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  dataUrl: z.string().min(32),
  prompt: z.string().min(1).max(500),
});

/**
 * Edit an image via Lovable AI Gateway (Nano Banana / Gemini image edit).
 * Returns a PNG data URL.
 */
export const editImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: data.prompt },
              { type: "image_url", image_url: { url: data.dataUrl } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Rate limited — please try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
      throw new Error(`AI request failed (${res.status}): ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{
        message?: {
          images?: Array<{ image_url?: { url?: string } }>;
          content?: string;
        };
      }>;
    };

    const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url || !url.startsWith("data:")) {
      throw new Error("AI did not return an image. Try a different photo or prompt.");
    }
    return { dataUrl: url };
  });