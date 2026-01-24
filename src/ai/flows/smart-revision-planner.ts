'use server';

/**
 * @fileOverview Implements the Smart Revision Planner flow with ML-driven decision making.
 *
 * ARCHITECTURE CHANGE:
 * Before: LLM decides which topics to revise based on JSON string input.
 * After: ML model predicts mastery → Decision rules select topics → LLM explains why.
 *
 * This file exports:
 * - smartRevisionPlanner - A function that generates a personalized revision plan for a student.
 * - SmartRevisionPlannerInput - The input type for the smartRevisionPlanner function.
 * - SmartRevisionPlannerOutput - The return type for the smartRevisionPlanner function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { extractMasteryFeatures, type StudentHistory } from '@/ml/features/student_features';
import { predictMastery } from '@/ml/inference/ml-bridge';

const SmartRevisionPlannerInputSchema = z.object({
  brainMap: z.string().describe('The student\'s Brain Map data represented as a JSON string, including topics, progress, and last revision dates.'),
  studentId: z.string().describe('Unique identifier for the student.'),
});
export type SmartRevisionPlannerInput = z.infer<typeof SmartRevisionPlannerInputSchema>;

const SmartRevisionPlannerOutputSchema = z.object({
  revisionList: z.array(
    z.object({
      topic: z.string().describe('The topic to revise.'),
      reason: z.string().describe('The reason for revising this topic (e.g., spaced repetition, low mastery).'),
      priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).describe('Priority level based on ML predictions.'),
      masteryScore: z.number().optional().describe('Predicted mastery probability (0-1).'),
    })
  ).describe('A list of topics to revise today, with reasons and priorities.'),
});
export type SmartRevisionPlannerOutput = z.infer<typeof SmartRevisionPlannerOutputSchema>;

export async function smartRevisionPlanner(input: SmartRevisionPlannerInput): Promise<SmartRevisionPlannerOutput> {
  return smartRevisionPlannerFlow(input);
}

/**
 * ML-DRIVEN DECISION LOGIC
 * This replaces the pure LLM approach with data-driven predictions
 */
async function makeRevisionDecisions(brainMapData: any, studentHistory: StudentHistory) {
  const decisions = [];

  for (const topic of brainMapData.topics || []) {
    try {
      // Step 1: Extract ML features
      const features = extractMasteryFeatures(topic.name, studentHistory);

      // Step 2: Get ML prediction
      const prediction = await predictMastery({
        avg_quiz_score: features.avg_quiz_score,
        attempts_per_topic: features.attempts_per_topic,
        days_since_last_revision: features.days_since_last_revision,
        quiz_score_variance: features.quiz_score_variance,
        time_spent_per_question: features.time_spent_per_question,
      });

      // Step 3: Apply decision rules (this is the ADK layer)
      let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      let shouldRevise = false;

      if (prediction.mastery_probability < 0.4) {
        priority = 'HIGH';
        shouldRevise = true;
      } else if (prediction.mastery_probability < 0.6) {
        priority = 'MEDIUM';
        shouldRevise = features.days_since_last_revision > 7; // Only if stale
      } else if (features.days_since_last_revision > 14) {
        priority = 'MEDIUM';
        shouldRevise = true; // Spaced repetition
      }

      if (shouldRevise) {
        decisions.push({
          topic: topic.name,
          masteryProbability: prediction.mastery_probability,
          priority,
          daysSinceRevision: features.days_since_last_revision,
        });
      }
    } catch (error) {
      console.error(`Failed to make decision for topic ${topic.name}:`, error);
      // Fallback: include topic if it hasn't been revised recently
      if (topic.daysSinceLastRevision && topic.daysSinceLastRevision > 10) {
        decisions.push({
          topic: topic.name,
          masteryProbability: 0.5,
          priority: 'MEDIUM' as const,
          daysSinceRevision: topic.daysSinceLastRevision,
        });
      }
    }
  }

  // Sort by priority (HIGH first) and mastery (lowest first)
  return decisions.sort((a, b) => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.masteryProbability - b.masteryProbability;
  });
}

/**
 * LLM PROMPT (now only generates explanations for pre-selected topics)
 */
const explanationPrompt = ai.definePrompt({
  name: 'revisionExplanationPrompt',
  input: {
    schema: z.object({
      topicsToExplain: z.string(),
    }),
  },
  output: {
    schema: z.object({
      explanations: z.array(
        z.object({
          topic: z.string(),
          reason: z.string(),
        })
      ),
    }),
  },
  prompt: `You are an AI study coach. The system has already determined which topics the student should revise today based on ML analysis.

Your job is to explain WHY each topic needs revision in a motivating, student-friendly way.

Topics to explain: {{{topicsToExplain}}}

For each topic, provide a clear, encouraging reason (1-2 sentences). Focus on:
- Spaced repetition benefits
- Building confidence through practice
- Addressing weak areas early

Output a JSON object with an "explanations" array.`,
});

const smartRevisionPlannerFlow = ai.defineFlow(
  {
    name: 'smartRevisionPlannerFlow',
    inputSchema: SmartRevisionPlannerInputSchema,
    outputSchema: SmartRevisionPlannerOutputSchema,
  },
  async (input) => {
    // Parse the brain map
    let brainMapData;
    try {
      brainMapData = JSON.parse(input.brainMap);
    } catch {
      brainMapData = { topics: [] };
    }

    // Mock student history (in production, fetch from database)
    const studentHistory: StudentHistory = {
      quizResults: brainMapData.quizResults || [],
      lastLoginDate: new Date(),
      registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    };

    // ML-DRIVEN DECISIONS
    const mlDecisions = await makeRevisionDecisions(brainMapData, studentHistory);

    // If no topics selected, return empty list
    if (mlDecisions.length === 0) {
      return { revisionList: [] };
    }

    // Prepare input for LLM (only ask it to explain, not decide)
    const topicsToExplain = mlDecisions
      .slice(0, 5) // Limit to top 5
      .map(
        (d) =>
          `${d.topic} (mastery: ${(d.masteryProbability * 100).toFixed(0)}%, priority: ${d.priority})`
      )
      .join(', ');

    // LLM GENERATES EXPLANATIONS
    const { output } = await explanationPrompt({ topicsToExplain });

    // Combine ML decisions with LLM explanations
    const revisionList = mlDecisions.slice(0, 5).map((decision, idx) => {
      const explanation = output?.explanations?.find((e) => e.topic === decision.topic);
      return {
        topic: decision.topic,
        reason: explanation?.reason || 'Recommended for revision based on learning analytics.',
        priority: decision.priority,
        masteryScore: decision.masteryProbability,
      };
    });

    return { revisionList };
  }
);
