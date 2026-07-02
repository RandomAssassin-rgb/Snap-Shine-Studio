import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  dataUrl: z.string().min(32),
  prompt: z.string().min(1).max(500),
});

/**
 * Edit an image via OpenRouter API (google/gemini-2.0-flash-exp:free).
 * Returns a PNG data URL.
 */
export const editImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error("Missing OPENROUTER_API_KEY");

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": "https://snap-shine-studio.app",
        "X-Title": "Snap & Shine Studio",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: data.prompt },
              { type: "image_url", image_url: { url: data.dataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Rate limited — please try again in a moment.");
      if (res.status === 402) throw new Error("OpenRouter credits exhausted. Add credits at openrouter.ai.");
      throw new Error(`AI request failed (${res.status}): ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    // OpenRouter returns the edited image as a base64 data URL in the content field
    const content = json.choices?.[0]?.message?.content ?? "";

    // Try to extract a data URL from the content
    const dataUrlMatch = content.match(/data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+/);
    if (dataUrlMatch) {
      return { dataUrl: dataUrlMatch[0] };
    }

    // If the model returned text instead of an image, throw a helpful error
    throw new Error("AI did not return an image. Try a different photo or prompt.");
  });