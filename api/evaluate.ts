import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

interface EvaluationResultData {
  topic: string;
  scores: {
    rapport: number;
    organisation: number;
    delivery: number;
    languageUse: number;
    creativity: number;
  };
  overallScore: number;
  feedback: {
    rapport: string;
    organisation: string;
    delivery: string;
    languageUse: string;
    creativity: string;
    pronunciation: string;
    summary: string;
    transcription: string;
  };
}

interface EvaluateRequestBody {
  audioBase64: string;
  mimeType: string;
  topic: string;
  allTopics: string[];
  language: "en" | "tr";
  isStudentMode: boolean;
}

const evaluationSchema = {
  type: Type.OBJECT,
  properties: {
    topic: {
      type: Type.STRING,
      description: "The specific topic discussed. MUST match the input topic EXACTLY.",
    },
    scores: {
      type: Type.OBJECT,
      properties: {
        rapport: { type: Type.NUMBER, description: "Social presence, confidence, and interactional flow (0-100)." },
        organisation: { type: Type.NUMBER, description: "Structure, coherence, and use of transition words (0-100)." },
        delivery: { type: Type.NUMBER, description: "Fluency, intonation, and clarity of speech (0-100)." },
        languageUse: { type: Type.NUMBER, description: "Grammatical accuracy and lexical variety (0-100)." },
        creativity: { type: Type.NUMBER, description: "Complexity of ideas and unique expression (0-100)." },
      },
      required: ["rapport", "organisation", "delivery", "languageUse", "creativity"],
    },
    overallScore: {
      type: Type.NUMBER,
      description: "Weighted average score (0-100).",
    },
    feedback: {
      type: Type.OBJECT,
      properties: {
        rapport: { type: Type.STRING, description: "Feedback on engagement and social dynamics." },
        organisation: { type: Type.STRING, description: "Feedback on the logical organization of thoughts." },
        delivery: { type: Type.STRING, description: "Feedback on prosody and clarity." },
        languageUse: { type: Type.STRING, description: "Feedback on accuracy and word choice." },
        creativity: { type: Type.STRING, description: "Feedback on original thought." },
        pronunciation: { type: Type.STRING, description: "Detailed IPA analysis for specific mispronounced words." },
        summary: { type: Type.STRING, description: "A high-quality pedagogical summary in the target language." },
        transcription: { type: Type.STRING, description: "Verbatim English transcription." },
      },
      required: [
        "rapport",
        "organisation",
        "delivery",
        "languageUse",
        "creativity",
        "pronunciation",
        "summary",
        "transcription",
      ],
    },
  },
  required: ["topic", "scores", "overallScore", "feedback"],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
    return res.status(500).json({ error: "Server configuration error." });
  }

  const body = req.body as EvaluateRequestBody;
  const { audioBase64, mimeType, topic, language, isStudentMode } = body;

  if (!audioBase64 || !mimeType || !topic || !language) {
    return res.status(400).json({ error: "Missing required fields: audioBase64, mimeType, topic, language." });
  }

  const estimatedBytes = (audioBase64.length * 3) / 4;
  if (estimatedBytes > 5.5 * 1024 * 1024) {
    return res.status(413).json({ error: "Audio too large. Maximum recording is approximately 3 minutes." });
  }

  const targetLanguage = language === "tr" ? "Turkish" : "English";

  let systemInstruction = `You are a World-Class English Language Assessor specializing in CEFR (Common European Framework of Reference for Languages) and the "Century of Türkiye Education Model".
  Evaluate the provided audio recording based on these strict pedagogical criteria:

  1. **Rapport**: Engagement with the listener, volume, confidence, and natural pauses.
  2. **Organisation**: Coherent structure (Intro/Body/Conclusion), appropriate use of connectives and discourse markers.
  3. **Delivery**: Pronunciation, intonation patterns, word/sentence stress, and avoiding monotone delivery.
  4. **Language Use**: Precision in vocabulary choice and grammatical complexity relative to high school levels (A2-B2).
  5. **Creativity**: Ability to move beyond simple 'yes/no' answers, using idioms, metaphors, or unique viewpoints.

  **MANDATORY FEEDBACK RULES**:
  - Summarize the performance professionally but supportively in ${targetLanguage}.
  - In "pronunciation" feedback, provide specific examples of words mispronounced using IPA (International Phonetic Alphabet) e.g., 'Target: /wɔːtər/, Said: /vater/'.
  - Be precise with the "overallScore"; 100 is reserved for native-like excellence.
  - The "transcription" MUST be verbatim in English. If the user said filler words like 'um', 'uh', include them as they are vital for fluency analysis.

  Return results strictly in the specified JSON format.`;

  if (isStudentMode) {
    systemInstruction += `

    **STUDENT EVALUATION MODE (Türkiye Yüzyılı Maarif Modeli) ACTIVE**:
    - The student is in the "Expanding Circle" (English as a foreign language).
    - DO NOT expect native-like perfection.
    - Focus on "effective communication, competence, confidence, and authenticity" rather than just grammatical perfection.
    - Be more lenient with scores, especially if the student is communicating their ideas clearly and naturally.
    - The goal is to empower learners to use English as a tool for communication.
    - Provide highly encouraging and growth-oriented feedback.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: {
        parts: [
          { inlineData: { mimeType, data: audioBase64 } },
          {
            text: `Perform a deep pedagogical evaluation of this speaking task on the topic: "${topic}". Focus heavily on the accuracy of the transcription and the fairness of the scores based on the CEFR level appropriate for a high school student.`,
          },
        ],
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: evaluationSchema,
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) {
      return res.status(502).json({ error: "Gemini API returned no content." });
    }

    const result = JSON.parse(text) as EvaluationResultData;
    result.topic = topic;

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Gemini evaluation error:", error);
    return res.status(502).json({ error: "Evaluation failed. Please try again." });
  }
}
