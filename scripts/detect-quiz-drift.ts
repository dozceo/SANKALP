
import { generateQuiz } from "../src/ai/flows/adaptive-quiz-engine";
import { ai } from "../src/ai/genkit";
import { z } from "genkit";

const DifficultyEvaluationSchema = z.object({
  annotatedDifficulty: z.enum(["Easy", "Medium", "Hard"]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

const difficultyJudgePrompt = ai.definePrompt({
  name: 'difficultyJudgePrompt',
  inputSchema: z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.string(),
      intendedDifficulty: z.string()
  }),
  outputSchema: DifficultyEvaluationSchema,
  prompt: `You are an expert educational content evaluator.

  Analyze the following quiz question:
  Question: {{question}}
  Options: {{options}}
  Correct Answer: {{correctAnswer}}

  The intended difficulty level is "{{intendedDifficulty}}".

  Based on the complexity of the concept and the distractors, classify the actual difficulty as "Easy", "Medium", or "Hard".
  Provide your reasoning.
  `
});

async function main() {
  console.log("Starting Quiz Difficulty Drift Detection...");

  const difficulties = ["Easy", "Medium", "Hard"] as const;
  const topic = "Linear Algebra";

  for (const difficulty of difficulties) {
    try {
      console.log(`\nTesting Difficulty Level: ${difficulty}...`);

      // 1. Generate Quiz
      console.log("Generating quiz...");
      const quizResult = await generateQuiz({
        topic,
        numQuestions: 3,
        educationLevel: "High School",
        difficulty
      });

      console.log(`Generated ${quizResult.quiz.length} questions.`);

      // 2. Evaluate Each Question
      for (const q of quizResult.quiz) {
        console.log(`Evaluating question: "${q.question.substring(0, 50)}..."`);

        const { output: result } = await difficultyJudgePrompt({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          intendedDifficulty: difficulty
        });

        if (result) {
            console.log(`  Intended: ${difficulty}`);
            console.log(`  Annotated: ${result.annotatedDifficulty}`);
            console.log(`  Match: ${difficulty === result.annotatedDifficulty ? "YES" : "NO"}`);
            console.log(`  Reasoning: ${result.reasoning}`);
        } else {
            console.log("  Failed to evaluate (no output).");
        }
      }

    } catch (error: any) {
      console.error(`Failed for difficulty ${difficulty}:`, error.message || error);
    }
  }
}

main().catch(console.error);
