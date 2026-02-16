import { genkit } from 'genkit';
import { googleAI, gemini20Flash } from '@genkit-ai/googleai';
import { chaos } from '@/lib/chaos-config';

/**
 * Genkit Configuration
 *
 * Optimized for production-grade EdTech features using Gemini 2.0 Flash.
 * Robustly handles API key aliasing for seamless deployment.
 */

const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

if (typeof window === 'undefined') {
  console.log('[Genkit Init] Initializing Genkit with Gemini 2.0 Flash...');
  console.log('[Genkit Init] GOOGLE_GENAI_API_KEY present:', !!process.env.GOOGLE_GENAI_API_KEY);
  console.log('[Genkit Init] GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);

  if (!apiKey) {
    console.error('[Genkit Init] CRITICAL ERROR: No AI API key found in environment variables. All AI features will fail.');
  }
}

const realAi = genkit({
  plugins: [
    googleAI({ apiKey }), // Explicitly pass key to ensure it's loaded before plugin init
  ],
  model: gemini20Flash, // Gemini 2.0 Flash: Best-in-class balance of speed and reasoning for interactive learning
});

export const ai = new Proxy(realAi, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);

    if (prop === 'generate') {
      return async (...args: any[]) => {
        await chaos.checkChaos('genkit');
        return (value as Function).apply(target, args);
      };
    }

    if (prop === 'definePrompt') {
      return (...args: any[]) => {
        const promptFn = (value as Function).apply(target, args);
        // Return a wrapped function that checks chaos before executing
        const wrappedPrompt = async (...pArgs: any[]) => {
          await chaos.checkChaos('genkit');
          return promptFn(...pArgs);
        };
        // Copy static properties (like .asTool, metadata) from the original prompt function
        Object.assign(wrappedPrompt, promptFn);
        return wrappedPrompt;
      };
    }

    if (prop === 'defineFlow') {
      return (...args: any[]) => {
        // args[0] is config, args[1] is implementation
        const flowFn = (value as Function).apply(target, args);
        const wrappedFlow = async (...fArgs: any[]) => {
           await chaos.checkChaos('genkit');
           return flowFn(...fArgs);
        }
        Object.assign(wrappedFlow, flowFn);
        return wrappedFlow;
      };
    }

    return value;
  }
});
