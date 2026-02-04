import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Check for API key and log status (Server-side only)
if (typeof window === 'undefined') {
  // Alias GEMINI_API_KEY to GOOGLE_GENAI_API_KEY if needed, as Genkit plugin expects the latter
  if (!process.env.GOOGLE_GENAI_API_KEY && process.env.GEMINI_API_KEY) {
    process.env.GOOGLE_GENAI_API_KEY = process.env.GEMINI_API_KEY;
  }

  const hasKey = !!process.env.GOOGLE_GENAI_API_KEY;
  console.log('[Genkit Init] AI API Key present:', hasKey);
  if (!hasKey) {
    console.warn('[Genkit Init] WARNING: No AI API key found. Genkit flows will likely fail.');
  }
}

export const ai = genkit({
  plugins: [googleAI()], // googleAI plugin typically looks for GOOGLE_GENAI_API_KEY
  model: 'googleai/gemini-1.5-flash', // Most reliable model for standard Genkit usage
});
