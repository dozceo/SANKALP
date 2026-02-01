"use server";

import { generateQuiz, type AdaptiveQuizInput } from "@/ai/flows/adaptive-quiz-engine";
import { unstable_cache } from "next/cache";

// Cache generated quizzes to reduce AI costs and latency
// Input arguments (topic, difficulty, etc.) are automatically part of the cache key
const getCachedQuiz = unstable_cache(
  async (values: AdaptiveQuizInput) => {
    return await generateQuiz(values);
  },
  ['adaptive-quiz-generator'],
  {
    revalidate: 3600, // 1 hour
    tags: ['quiz']
  }
);

export async function createQuiz(values: AdaptiveQuizInput) {
  return await getCachedQuiz(values);
}
