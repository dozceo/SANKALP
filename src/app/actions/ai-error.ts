'use server';

import { ai } from '@/ai/genkit';

// Simple in-memory cache to prevent redundant AI calls for identical errors
const errorCache = new Map<string, string>();
const CACHE_LIMIT = 100;

export async function generateFriendlyErrorMessage(errorMessage: string, context: string) {
  const cacheKey = `${context}:${errorMessage}`;

  if (errorCache.has(cacheKey)) {
    return errorCache.get(cacheKey)!;
  }

  try {
    const prompt = `
    You are a helpful AI assistant for a student learning platform called Sankalp.
    A user encountered the following error in the context of "${context}":
    Error: "${errorMessage}"

    Please provide a friendly, non-technical explanation of what went wrong and a suggestion for what they can do (e.g., try again, check their connection, or contact support).
    Keep it short (max 2 sentences).
    Do not mention error codes or internal details unless necessary for support.
    `;

    const response = await ai.generate(prompt);

    // Manage cache size (LRU-like eviction)
    if (errorCache.size >= CACHE_LIMIT) {
      const firstKey = errorCache.keys().next().value;
      if (firstKey !== undefined) {
        errorCache.delete(firstKey);
      }
    }

    errorCache.set(cacheKey, response.text);
    return response.text;
  } catch (genError) {
    console.error('Failed to generate AI error message:', genError);
    // Fallback if AI fails
    return "Something went wrong. Please check your connection and try again.";
  }
}
