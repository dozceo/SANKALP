'use server';

/**
 * @fileOverview Implements the Adaptive Quiz Engine flow.
 *
 * This file exports:
 * - `generateQuiz`: An async function that generates a quiz based on a topic and number of questions.
 * - `AdaptiveQuizInput`: The input type for the generateQuiz function.
 * - `AdaptiveQuizOutput`: The output type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveQuizInputSchema = z.object({
  topic: z.string().describe('The topic of the quiz.'),
  numQuestions: z.number().describe('The number of questions in the quiz.'),
  educationLevel: z.string().describe('The educational level for the quiz (e.g., High School, University).'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the quiz questions.'),
});

export type AdaptiveQuizInput = z.infer<typeof AdaptiveQuizInputSchema>;

const AdaptiveQuizOutputSchema = z.object({
  quiz: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The possible answers to the question.'),
      correctAnswer: z.string().describe('The correct answer to the question.'),
    })
  ).describe('The generated quiz questions and answers.'),
});

export type AdaptiveQuizOutput = z.infer<typeof AdaptiveQuizOutputSchema>;

export async function generateQuiz(input: AdaptiveQuizInput): Promise<AdaptiveQuizOutput> {
  return adaptiveQuizFlow(input);
}

const adaptiveQuizPrompt = ai.definePrompt({
  name: 'adaptiveQuizPrompt',
  input: {schema: AdaptiveQuizInputSchema},
  output: {schema: AdaptiveQuizOutputSchema},
  prompt: `You are an expert quiz generator.

  Generate a quiz with {{numQuestions}} questions on the topic of "{{topic}}".

  The quiz should be suitable for a "{{educationLevel}}" level.
  The questions should have a difficulty of "{{difficulty}}".

  Each question should have 4 possible answers. One and only one answer is correct. 

  The output must be a valid JSON object with a 'quiz' field, containing an array of question objects.
  Each object must have "question", "options" (an array of 4 strings), and "correctAnswer" fields.
  `,
});

const adaptiveQuizFlow = ai.defineFlow(
  {
    name: 'adaptiveQuizFlow',
    inputSchema: AdaptiveQuizInputSchema,
    outputSchema: AdaptiveQuizOutputSchema,
  },
  async input => {
    const {output} = await adaptiveQuizPrompt(input);
    return output!;
  }
);
