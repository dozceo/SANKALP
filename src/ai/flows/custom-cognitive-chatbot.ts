'use server';
/**
 * @fileOverview A customizable cognitive chatbot that can adapt its personality and instructions.
 *
 * - explainConceptWithCustomization - A function that handles the customized concept explanation process.
 * - ExplainConceptCustomizedInput - The input type for the function.
 * - ExplainConceptCustomizedOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExplainConceptCustomizedInputSchema = z.object({
  concept: z.string().max(500).describe('The concept to explain.'),
  brainMapContext: z.string().max(5000).describe('The relevant Brain Map context for the concept.'),
  language: z.string().max(50).describe('The target language for the explanation.'),
  personality: z.string().max(200).describe('The desired personality and tone for the chatbot.'),
  customInstructions: z.string().max(1000).describe('Specific instructions for how the chatbot should respond.'),
});
export type ExplainConceptCustomizedInput = z.infer<typeof ExplainConceptCustomizedInputSchema>;

const ExplainConceptCustomizedOutputSchema = z.object({
  explanation: z.string().describe('The customized explanation of the concept.'),
});
export type ExplainConceptCustomizedOutput = z.infer<typeof ExplainConceptCustomizedOutputSchema>;

export async function explainConceptWithCustomization(input: ExplainConceptCustomizedInput): Promise<ExplainConceptCustomizedOutput> {
  return customizedConceptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainConceptCustomizedPrompt',
  input: { schema: ExplainConceptCustomizedInputSchema },
  output: { schema: ExplainConceptCustomizedOutputSchema },
  prompt: `You are a cognitive chatbot designed to help a student learn. Your behavior is customized by their teacher.

  Your assigned personality and tone is: {{{personality}}}.

  You must follow these specific instructions from the teacher: {{{customInstructions}}}.

  Now, please provide a clear and concise explanation of the concept below, adhering to your assigned personality and instructions.

  Concept: {{{concept}}}
  Brain Map Context: {{{brainMapContext}}}
  Target Language: {{{language}}}
  `,
});

const customizedConceptFlow = ai.defineFlow(
  {
    name: 'customizedConceptFlow',
    inputSchema: ExplainConceptCustomizedInputSchema,
    outputSchema: ExplainConceptCustomizedOutputSchema,
  },
  async input => {
    console.log(`[FLOW:customizedConceptFlow] Invoked for concept="${input.concept}", lang="${input.language}"`);
    try {
      const { output } = await prompt(input);
      console.log(`[FLOW:customizedConceptFlow] Success`);
      return output!;
    } catch (error) {
      console.error(`[FLOW:customizedConceptFlow] Error:`, error);
      throw error;
    }
  }
);
