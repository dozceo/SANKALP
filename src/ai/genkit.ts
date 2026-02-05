import { genkit } from 'genkit';
import { googleAI, gemini20Flash } from '@genkit-ai/googleai';

/**
 * Genkit Configuration
 *
 * Optimized for production-grade EdTech features using Gemini 2.0 Flash.
 * Robustly handles API key aliasing for seamless deployment.
 */

const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

if (typeof window === 'undefined') {
  console.log('[Genkit Init] AI API Key present:', !!apiKey);
  if (!apiKey) {
    console.warn('[Genkit Init] WARNING: No AI API key found. Genkit flows will likely fail.');
  }
}

export const ai = genkit({
  plugins: [
    googleAI({ apiKey }), // Explicitly pass key to ensure it's loaded before plugin init
  ],
  model: gemini20Flash, // Gemini 2.0 Flash: Best-in-class balance of speed and reasoning for interactive learning
});
