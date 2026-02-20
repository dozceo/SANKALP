
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

export const MotivationalCounselingOutputSchema = z.object({
  advice: z.string().describe('Empathetic and actionable advice for the student.'),
  severityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).describe('Assessed severity of the student\'s concern.'),
  escalationRequired: z.boolean().describe('Whether the concern requires escalation to a teacher, parent, or crisis service.'),
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

  CRITICAL SAFETY RULE: If the student expresses any thoughts of self-harm, suicide, or severe crisis, you MUST:
  - Set severityLevel to "CRITICAL"
  - Set escalationRequired to true
  - Set advice to exactly: "I'm really concerned about what you've shared. Please reach out to a trusted adult, your school counselor, or a crisis helpline immediately. You are not alone."
  - STOP immediately. Do NOT proceed to any of the numbered steps below.

  For all non-crisis concerns, follow these steps:

  A student needs your help. Here is their situation:
  - Student's main concern: "{{{studentConcern}}}"
  - Relevant background: "{{{studentHistory}}}"

  Your task is to:
  1.  **Assess Severity**: Determine the severity level: HIGH (severe distress), MEDIUM (significant stress), or LOW (mild concern). Set escalationRequired to true only for HIGH severity.
  2.  **Analyze Sentiment**: Identify key emotions (e.g., stress, anxiety, burnout, frustration, sadness, lack of motivation).
  3.  **Acknowledge and Validate**: Begin your response by acknowledging and validating the specific feelings you identified.
  4.  **Offer Compassionate Perspective**: Provide a compassionate and non-judgmental perspective on their situation.
  5.  **Provide Actionable, Nudging Advice**: Based on the sentiment, provide concrete, actionable steps.
      - If stress/burnout is high, suggest a short break, a mindfulness exercise, or using a focus timer (like the Pomodoro technique).
      - If motivation is low, break down tasks into smaller, manageable steps and suggest a small reward.
      - If they feel stuck, guide them with gentle questions to help them see a path forward.
  6.  **End with Encouragement**: Conclude with a hopeful and encouraging message that reinforces their ability to overcome the challenge.

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
    console.log('[MindfulMentor] Starting flow execution...');
    const {output} = await prompt(input);
    if (!output) {
      console.error('[MindfulMentor] Flow completed but returned no output');
      throw new Error('AI failed to generate advice.');
    }
    return output;
  }
);
