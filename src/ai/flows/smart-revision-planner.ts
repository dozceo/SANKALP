'use server';

/**
 * @fileOverview Implements the Smart Revision Planner flow, which uses AI to generate a daily list of revision tasks
 * based on spaced repetition principles.
 *
 * This file exports:
 * - smartRevisionPlanner - A function that generates a personalized revision plan for a student.
 * - SmartRevisionPlannerInput - The input type for the smartRevisionPlanner function.
 * - SmartRevisionPlannerOutput - The return type for the smartRevisionPlanner function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartRevisionPlannerInputSchema = z.object({
  brainMap: z.string().describe('The student’s Brain Map data represented as a JSON string, including topics, progress, and last revision dates.'),
  studentId: z.string().describe('Unique identifier for the student.'),
});
export type SmartRevisionPlannerInput = z.infer<typeof SmartRevisionPlannerInputSchema>;

const SmartRevisionPlannerOutputSchema = z.object({
  revisionList: z.array(
    z.object({
      topic: z.string().describe('The topic to revise.'),
      reason: z.string().describe('The reason for revising this topic (e.g., spaced repetition).'),
    })
  ).describe('A list of topics to revise today, with reasons.'),
});
export type SmartRevisionPlannerOutput = z.infer<typeof SmartRevisionPlannerOutputSchema>;

export async function smartRevisionPlanner(input: SmartRevisionPlannerInput): Promise<SmartRevisionPlannerOutput> {
  return smartRevisionPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartRevisionPlannerPrompt',
  input: {
    schema: SmartRevisionPlannerInputSchema,
  },
  output: {
    schema: SmartRevisionPlannerOutputSchema,
  },
  prompt: `You are an AI-powered smart revision planner designed to help students optimize their study schedule based on spaced repetition.

  Analyze the student's Brain Map data and generate a daily list of revision tasks.

  Brain Map data: {{{brainMap}}}
  Student ID: {{{studentId}}}

  Consider the following:
  - Topics the student has not revised recently (spaced repetition).
  - Topics the student is struggling with (low progress).

  Output a JSON object with a "revisionList" containing topics and the reason for the revision.
`,
});

const smartRevisionPlannerFlow = ai.defineFlow(
  {
    name: 'smartRevisionPlannerFlow',
    inputSchema: SmartRevisionPlannerInputSchema,
    outputSchema: SmartRevisionPlannerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
