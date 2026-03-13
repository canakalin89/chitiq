import { EvaluationResultData } from "../types";

export const evaluateSpeech = async (
  audioBase64: string,
  mimeType: string,
  topic: string,
  allTopics: string[],
  language: 'en' | 'tr',
  isStudentMode: boolean = false
): Promise<EvaluationResultData> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audioBase64,
        mimeType,
        topic,
        allTopics,
        language,
        isStudentMode,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorMessage = `Evaluation request failed (${response.status}).`;
      try {
        const body = await response.json();
        if (body.error) errorMessage = body.error;
      } catch {
        // non-JSON response, use status message
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<EvaluationResultData>;
  } finally {
    clearTimeout(timeout);
  }
};
