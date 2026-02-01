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
import { extractMasteryFeatures, calculatePerformanceTrend, type StudentHistory } from '@/ml/features/student_features';
import { predictMastery } from '@/ml/inference/ml-bridge';
import { getStudent, getQuizResults } from '@/lib/db-helpers';
import {
  makeRevisionDecision,
  makeInterventionDecision,
  selectContentStrategy,
  logDecision,
} from '@/ai/adk/decision-engine';
import { DecisionAction, type MLSignals } from '@/ai/adk/types';

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
 * ADK-DRIVEN DECISION LOGIC
 * Uses the ADK decision engine to make policy-based decisions
 */
async function makeRevisionDecisions(brainMapData: any, studentHistory: StudentHistory) {
  const decisions = [];

  for (const topic of brainMapData.topics || []) {
    try {
      // Step 1: Extract ML features
      const features = extractMasteryFeatures(topic.name, studentHistory);

      // Step 2: Get ML prediction
      const mlPrediction = await predictMastery({
        avg_quiz_score: features.avg_quiz_score,
        attempts_per_topic: features.attempts_per_topic,
        days_since_last_revision: features.days_since_last_revision,
        quiz_score_variance: features.quiz_score_variance,
        time_spent_per_question: features.time_spent_per_question,
      });

      // Step 3: Build ML Signals for ADK
      const mlSignals: MLSignals = {
        mastery_probability: mlPrediction.mastery_probability,
        confidence: mlPrediction.confidence,
        days_since_last_revision: features.days_since_last_revision,
        attempts_count: features.attempts_per_topic,
       feat-performance-trend-1812230759835433384
        performance_trend: calculatePerformanceTrend(topic.name, studentHistory),
        performance_trend: calculatePerformanceTrend(
          studentHistory.quizResults.filter((q) => q.topic === topic.name)
        ),main
      };

      // Step 4: ADK makes the decision
      const adkDecision = makeRevisionDecision({
        studentId: studentHistory.studentId || "unknown",
        topic: topic.name,
        currentDate: new Date(),
        examDate: brainMapData.examDate ? new Date(brainMapData.examDate) : undefined,
        daysUntilExam: brainMapData.daysUntilExam,
        mlSignals,
      });

      // Step 5: Log decision for analytics
      logDecision(
        {
          studentId: studentHistory.studentId || "unknown",
          topic: topic.name,
          currentDate: new Date(),
          mlSignals,
        },
        adkDecision
      );

      // Step 6: Check if ADK says to revise
      const shouldRevise = [
        DecisionAction.URGENT_REVISION,
        DecisionAction.SCHEDULED_REVISION,
        DecisionAction.ADAPTIVE_TEACHING,
      ].includes(adkDecision.action);

      if (shouldRevise) {
        decisions.push({
          topic: topic.name,
          masteryProbability: mlPrediction.mastery_probability,
          priority: adkDecision.priority,
          daysSinceRevision: features.days_since_last_revision,
          adkDecision, // Pass full ADK context for LLM
        });
      }

      // Step 7: Check for teacher intervention
      const intervention = makeInterventionDecision({
        studentId: studentHistory.studentId || "unknown",
        topic: topic.name,
        currentDate: new Date(),
        mlSignals,
      });

      if (intervention) {
        console.log("[Teacher Intervention Required]", intervention);
        // In production, save to DB for Teacher Mode dashboard
      }
    } catch (error) {
      console.error(`Failed to make decision for topic ${topic.name}:`, error);
      // Fallback: include topic if it hasn't been revised recently
      if (topic.daysSinceLastRevision && topic.daysSinceLastRevision > 10) {
        decisions.push({
          topic: topic.name,
          masteryProbability: 0.5,
          priority: "MEDIUM" as const,
          daysSinceRevision: topic.daysSinceLastRevision,
          adkDecision: null, // Mark as fallback
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

    // Fetch student history from database
    let studentHistory: StudentHistory;

    try {
      const student = await getStudent(input.studentId);
      if (student) {
        const quizResults = await getQuizResults(input.studentId, 100);
        studentHistory = {
          studentId: input.studentId,
          quizResults: quizResults.map((qr) => ({
            topic: qr.topic,
            score: qr.score,
            timestamp: qr.timestamp,
            timeSpent: qr.timeSpent,
            questionsAttempted: qr.questionsAttempted,
          })),
          lastLoginDate: student.lastLoginDate,
          registrationDate: student.registrationDate,
        };
      } else {
        console.warn(`Student not found: ${input.studentId}. Using brainMap data.`);
        // Fallback to data in brainMap if available
        studentHistory = {
          studentId: input.studentId,
          quizResults: brainMapData.quizResults || [],
          lastLoginDate: new Date(),
          registrationDate: new Date(),
        };
      }
    } catch (error) {
      console.error('Error fetching student history:', error);
      // Fallback
      studentHistory = {
        studentId: input.studentId,
        quizResults: brainMapData.quizResults || [],
        lastLoginDate: new Date(),
        registrationDate: new Date(),
      };
    }

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

/**
 * Calculates the performance trend for a specific topic based on quiz history.
 * Compares the average score of the most recent quizzes against the previous set.
 */
function calculatePerformanceTrend(
  topic: string,
  history: StudentHistory
): "IMPROVING" | "STABLE" | "DECLINING" {
  const topicQuizzes = history.quizResults
    .filter((r) => r.topic === topic)
    // Sort by timestamp descending (newest first)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (topicQuizzes.length < 2) {
    return "STABLE";
  }

  let recent: number[] = [];
  let previous: number[] = [];

  // Determine window size based on available history
  if (topicQuizzes.length >= 6) {
    // Compare last 3 vs previous 3
    recent = topicQuizzes.slice(0, 3).map((q) => q.score);
    previous = topicQuizzes.slice(3, 6).map((q) => q.score);
  } else if (topicQuizzes.length >= 4) {
    // Compare last 2 vs previous 2
    recent = topicQuizzes.slice(0, 2).map((q) => q.score);
    previous = topicQuizzes.slice(2, 4).map((q) => q.score);
  } else {
    // Split remaining in half (e.g. 3 -> 1 vs 1, 2 -> 1 vs 1)
    const midpoint = Math.floor(topicQuizzes.length / 2);
    recent = topicQuizzes.slice(0, midpoint).map((q) => q.score);
    previous = topicQuizzes.slice(midpoint, midpoint * 2).map((q) => q.score);
  }

  const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
  const previousAvg = previous.reduce((s, v) => s + v, 0) / previous.length;

  const threshold = 0.1; // 10% change required to indicate a trend

  if (recentAvg > previousAvg + threshold) {
    return "IMPROVING";
  } else if (recentAvg < previousAvg - threshold) {
    return "DECLINING";
  }

  return "STABLE";
}
