
'use server';
/**
 * @fileOverview An AI counselor to provide motivation and emotional support to students.
 *
 * - getMotivationalCounseling - A function that provides advice based on a student's concerns.
 * - MotivationalCounselingInput - The input type for the function.
 * - MotivationalCounselingOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MotivationalCounselingInputSchema = z.object({
  studentConcern: z.string().describe("The student's current emotional or academic concern."),
  studentHistory: z.string().describe("Brief, relevant background about the student's recent challenges or academic situation."),
});
export type MotivationalCounselingInput = z.infer<typeof MotivationalCounselingInputSchema>;

const MotivationalCounselingOutputSchema = z.object({
  advice: z.string().describe('Empathetic and actionable advice for the student.'),
});
export type MotivationalCounselingOutput = z.infer<typeof MotivationalCounselingOutputSchema>;

export async function getMotivationalCounseling(input: MotivationalCounselingInput): Promise<MotivationalCounselingOutput> {
  console.log('[MindfulMentor] Providing counseling for concern:', input.studentConcern.substring(0, 50) + '...');
  try {
    const result = await mindfulMentorFlow(input);
    console.log('[MindfulMentor] Successfully generated advice');
    return result;
  } catch (error) {
    console.error('[MindfulMentor] Error in flow execution:', error);
    throw error;
  }
}

const prompt = ai.definePrompt({
  name: 'mindfulMentorPrompt',
  input: {schema: MotivationalCounselingInputSchema},
  output: {schema: MotivationalCounselingOutputSchema},
  prompt: `You are an expert AI counselor named the "Mindful Mentor." Your primary role is to provide empathetic, supportive, and actionable advice to students facing academic and emotional challenges. You are an expert in sentiment analysis and mental fitness monitoring for students.

  A student needs your help. Here is their situation:
  - Student's main concern: "{{{studentConcern}}}"
  - Relevant background: "{{{studentHistory}}}"

  Your task is to:
  1.  **Analyze Sentiment First**: Before responding, perform a quick sentiment analysis of the student's concern. Identify key emotions (e.g., stress, anxiety, burnout, frustration, sadness, lack of motivation).
  2.  **Acknowledge and Validate**: Begin your response by acknowledging and validating the specific feelings you identified. For example, "It sounds like you're feeling really overwhelmed and stressed right now, and that's completely understandable."
  3.  **Offer Compassionate Perspective**: Provide a compassionate and non-judgmental perspective on their situation.
  4.  **Provide Actionable, Nudging Advice**: Based on the sentiment, provide concrete, actionable steps.
      - If stress/burnout is high, suggest a short break, a mindfulness exercise, or using a focus timer (like the Pomodoro technique).
      - If motivation is low, break down tasks into smaller, manageable steps and suggest a small reward.
      - If they feel stuck, guide them with gentle questions to help them see a path forward.
  5.  **End with Encouragement**: Conclude with a hopeful and encouraging message that reinforces their ability to overcome the challenge.

  Your response must be conversational, warm, and supportive, not a clinical list.
  `,
});

const mindfulMentorFlow = ai.defineFlow(
  {
    name: 'mindfulMentorFlow',
    inputSchema: MotivationalCounselingInputSchema,
    outputSchema: MotivationalCounselingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
