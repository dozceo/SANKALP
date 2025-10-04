"use server";

import { generateQuiz, type AdaptiveQuizInput } from "@/ai/flows/adaptive-quiz-engine";

export async function createQuiz(values: AdaptiveQuizInput) {
  return await generateQuiz(values);
}
