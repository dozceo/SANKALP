
'use server';

/**
 * @fileOverview Implements an AI-powered flow to generate a structured academic syllabus.
 *
 * This file exports:
 * - `syllabusGenerator`: An async function that fetches syllabus details for a given query.
 * - `SyllabusInput`: The input type for the syllabusGenerator function.
 * - `SyllabusOutput`: The return type for the syllabusGenerator function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SyllabusInputSchema = z.object({
  query: z.string().describe('The name of the exam or subject for which the syllabus is requested (e.g., "AP Calculus BC", "NEET Biology").'),
});
export type SyllabusInput = z.infer<typeof SyllabusInputSchema>;

const SyllabusOutputSchema = z.object({
  title: z.string().describe('The official title of the syllabus or subject.'),
  structure: z.string().describe('A detailed, well-formatted breakdown of the syllabus topics and sub-topics.'),
  strategy: z.string().describe('A recommended study strategy and timeline for covering the syllabus.'),
  references: z.array(z.string().url()).describe('A list of at least 5 official or high-quality reference links (URLs) for study materials, official websites, or recommended books.'),
});
export type SyllabusOutput = z.infer<typeof SyllabusOutputSchema>;

export async function syllabusGenerator(input: SyllabusInput): Promise<SyllabusOutput> {
  return syllabusGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'syllabusGeneratorPrompt',
  input: { schema: SyllabusInputSchema },
  output: { schema: SyllabusOutputSchema },
  prompt: `You are an expert academic advisor. A student has requested the syllabus for "{{{query}}}".

  Your task is to:
  1.  Identify the official name and structure for the requested syllabus.
  2.  Provide a clear, well-organized breakdown of all the main topics and key sub-topics. Use formatting like headings and bullet points.
  3.  Create a concise, actionable study strategy and a suggested timeline (e.g., "Week 1-2: Focus on Algebra basics...") to help the student prepare.
  4.  Search for and provide a list of AT LEAST FIVE (5) high-quality, relevant, and official reference links. These can be official exam board websites, university course pages, trusted educational resources (like Khan Academy), or links to recommended textbooks online.

  Ensure the output is accurate, up-to-date, and directly helpful for a student planning their studies.
  `,
});

const syllabusGeneratorFlow = ai.defineFlow(
  {
    name: 'syllabusGeneratorFlow',
    inputSchema: SyllabusInputSchema,
    outputSchema: SyllabusOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
