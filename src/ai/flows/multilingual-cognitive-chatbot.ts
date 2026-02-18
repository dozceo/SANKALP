'use server';
/**
 * @fileOverview A multilingual cognitive chatbot anchored to the Brain Map that can explain concepts in different languages.
 *
 * - explainConcept - A function that handles the concept explanation process.
 * - ExplainConceptInput - The input type for the explainConcept function.
 * - ExplainConceptOutput - The return type for the explainConcept function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainConceptInputSchema = z.object({
  concept: z.string().describe('The concept to explain.'),
  brainMapContext: z.string().describe('The relevant Brain Map context for the concept.'),
  language: z.string().describe('The target language for the explanation.'),
});
export type ExplainConceptInput = z.infer<typeof ExplainConceptInputSchema>;

const ExplainConceptOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the concept in the target language.'),
});
export type ExplainConceptOutput = z.infer<typeof ExplainConceptOutputSchema>;

export async function explainConcept(input: ExplainConceptInput): Promise<ExplainConceptOutput> {
  return explainConceptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainConceptPrompt',
  input: {schema: ExplainConceptInputSchema},
  output: {schema: ExplainConceptOutputSchema},
  prompt: `You are a multilingual cognitive chatbot anchored to the Brain Map.

  Your purpose is to explain concepts to students in their target language.

  Concept: {{{concept}}}
  Brain Map Context: {{{brainMapContext}}}
  Target Language: {{{language}}}

  Please provide a clear and concise explanation of the concept in the target language, using the Brain Map context to guide your explanation.
  `,
});

const explainConceptFlow = ai.defineFlow(
  {
    name: 'explainConceptFlow',
    inputSchema: ExplainConceptInputSchema,
    outputSchema: ExplainConceptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
