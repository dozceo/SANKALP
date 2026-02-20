
// ─── Production Guard ────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: Genkit dev server must not run in production.');
    process.exit(1);
}

import { config } from 'dotenv';
// Load environment variables from .env.local to match Next.js development environment
config({ path: '.env.local' });

import '@/ai/flows/multilingual-cognitive-chatbot.ts';
import '@/ai/flows/smart-revision-planner.ts';
import '@/ai/flows/adaptive-quiz-engine.ts';
import '@/ai/flows/custom-cognitive-chatbot.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/speech-to-speech.ts';
import '@/ai/flows/mindful-mentor.ts';
import '@/ai/flows/syllabus-generator.ts';
