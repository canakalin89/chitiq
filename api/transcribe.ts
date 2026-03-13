import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Server configuration error." });

  const { audioBase64, mimeType } = req.body;
  if (!audioBase64 || !mimeType) return res.status(400).json({ error: "Missing required fields." });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: audioBase64 } },
          {
            text: "Transcribe this audio exactly as spoken, word for word in English. Output only the transcribed text with no additional commentary or formatting. If there is silence or no speech, output an empty string.",
          },
        ],
      },
      config: { temperature: 0 },
    });

    const transcript = response.text?.trim() ?? "";
    return res.status(200).json({ transcript });
  } catch (error: any) {
    console.error("Transcription error:", error);
    return res.status(502).json({ error: "Transcription failed.", transcript: "" });
  }
}
