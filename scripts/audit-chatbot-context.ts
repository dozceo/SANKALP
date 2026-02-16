
import { explainConcept } from "../src/ai/flows/multilingual-cognitive-chatbot";

async function main() {
  console.log("Starting Chatbot Context Audit...");

  // Start with a reasonable context size
  let context = "This is a concept about the history of mathematics. It involves algebra, geometry, and calculus. ";

  // We will simulate a growing conversation history by appending to the context.
  // In a real chat, history grows linearly, but here we double to find limits faster.

  const MAX_ITERATIONS = 15; // Should reach > 1MB if not stopped

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    try {
      console.log(`\nIteration ${i+1}: Testing with context length: ${context.length} chars...`);
      const start = Date.now();

      // We are simulating "history" being passed via brainMapContext,
      // as that's the only context field available in the current flow.
      const result = await explainConcept({
        concept: "Summarize the context provided.",
        brainMapContext: context,
        language: "English"
      });

      const end = Date.now();
      console.log(`Success! Time: ${end - start}ms. Output length: ${result.explanation.length}`);

      // Expand context significantly for next iteration
      context += context;

      // If context gets too huge, we might hit string limits before token limits,
      // but usually API limits hit first (e.g. 1M tokens for Gemini 1.5, less for others).
      // Gemini 2.0 Flash context window is quite large, so we might not hit it easily.
      // But let's see.

    } catch (error: any) {
      console.error(`\nFAILED at context length ${context.length} chars.`);
      console.error(`Error:`, error.message || error);
      break;
    }
  }
}

main().catch(console.error);
