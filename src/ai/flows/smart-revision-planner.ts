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
import { predictMastery, batchPredictMastery } from '@/ml/inference/ml-bridge';
import { getStudent, getQuizResults, getBatchedCachedPredictions, batchCachePredictions } from '@/lib/db-helpers';
import {
  makeRevisionDecision,
  makeInterventionDecision,
  selectContentStrategy,
  logDecision,
} from '@/ai/adk/decision-engine';
import { DecisionAction, type MLSignals } from '@/ai/adk/types';
import { calculateTrend } from '@/lib/trend-utils';
import { MasteryPredictionInput, MasteryPredictionOutput } from '@/ml/inference/types';

const SmartRevisionPlannerInputSchema = z.object({
  brainMap: z.string().max(50000).describe('The student\'s Brain Map data represented as a JSON string, including topics, progress, and last revision dates.'),
  studentId: z.string().max(100).describe('Unique identifier for the student.'),
});
export type SmartRevisionPlannerInput = z.infer<typeof SmartRevisionPlannerInputSchema>;

export const SmartRevisionPlannerOutputSchema = z.object({
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
  const topics = brainMapData.topics || [];

  if (topics.length === 0) return [];

  // ⚡ Bolt: Pre-group quiz results by topic to avoid O(N*M) filtering inside the topics loop
  // 📊 Impact: Changes performance characteristic from O(N*M) to O(N+M), significantly reducing array iterations
  const quizzesByTopic = new Map<string, number[]>();
  if (studentHistory.quizResults) {
    for (let i = 0; i < studentHistory.quizResults.length; i++) {
        const qr = studentHistory.quizResults[i];
        const existing = quizzesByTopic.get(qr.topic);
        if (existing) {
            existing.push(qr.score);
        } else {
            quizzesByTopic.set(qr.topic, [qr.score]);
        }
    }
  }

  // 1. Extract features for all topics
  const topicFeaturesMap = new Map<string, MasteryPredictionInput>();
  const topicObjMap = new Map<string, any>(); // Map topic name to topic object from brainMap

  topics.forEach((topic: any) => {
    topicObjMap.set(topic.name, topic);
    const features = extractMasteryFeatures(topic.name, studentHistory);
    topicFeaturesMap.set(topic.name, {
      avg_quiz_score: features.avg_quiz_score,
      attempts_per_topic: features.attempts_per_topic,
      days_since_last_revision: features.days_since_last_revision,
      quiz_score_variance: features.quiz_score_variance,
      time_spent_per_question: features.time_spent_per_question,
    });
  });

  const topicNames = Array.from(topicFeaturesMap.keys());

  // 2. Check Cache
  let cachedPredictions = new Map<string, any>();
  if (studentHistory.studentId) {
    cachedPredictions = await getBatchedCachedPredictions(studentHistory.studentId, topicNames);
  }

  // 3. Identify missing topics
  const topicsToPredict: Array<{ topic: string; features: MasteryPredictionInput }> = [];

  topicNames.forEach(topic => {
    if (!cachedPredictions.has(topic)) {
      topicsToPredict.push({
        topic,
        features: topicFeaturesMap.get(topic)!
      });
    }
  });

  // 4. Batch Predict
  let newPredictionsMap = new Map<string, MasteryPredictionOutput>();
  if (topicsToPredict.length > 0) {
    const batchResults = await batchPredictMastery(topicsToPredict);
    const predictionsToCache: Parameters<typeof batchCachePredictions>[0] = [];

    batchResults.forEach(r => {
      if (r.prediction && r.prediction.predicted_class !== 'error') {
        newPredictionsMap.set(r.topic, r.prediction);

        // Cache the new prediction
        if (studentHistory.studentId) {
          predictionsToCache.push({
            studentId: studentHistory.studentId,
            topic: r.topic,
            masteryProbability: r.prediction.mastery_probability,
            confidence: r.prediction.confidence,
            daysSinceRevision: topicFeaturesMap.get(r.topic)!.days_since_last_revision,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour cache
          });
        }
      }
    });

    if (predictionsToCache.length > 0) {
      batchCachePredictions(predictionsToCache).catch(console.error);
    }
  }

  for (const topicName of topicNames) {
    try {
      const topic = topicObjMap.get(topicName);
      let prediction = cachedPredictions.get(topicName);

      if (!prediction) {
        prediction = newPredictionsMap.get(topicName);
      }

      if (!prediction) {
        // Fallback: include topic if it hasn't been revised recently
        if (topic.daysSinceLastRevision && topic.daysSinceLastRevision > 10) {
          decisions.push({
            topic: topicName,
            masteryProbability: 0.5,
            priority: "MEDIUM" as const,
            daysSinceRevision: topic.daysSinceLastRevision,
            adkDecision: null, // Mark as fallback
          });
        }
        continue;
      }

      const features = topicFeaturesMap.get(topicName)!;
      const masteryProb = (prediction.masteryProbability !== undefined)
        ? prediction.masteryProbability
        : prediction.mastery_probability;

      // Step 3: Build ML Signals for ADK
      const topicQuizzes = quizzesByTopic.get(topicName) || [];
      const mlSignals: MLSignals = {
        mastery_probability: masteryProb,
        confidence: prediction.confidence,
        days_since_last_revision: features.days_since_last_revision,
        attempts_count: features.attempts_per_topic,
        performance_trend: calculateTrend(
          topicQuizzes,
          true
        ) as "IMPROVING" | "STABLE" | "DECLINING",
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
          masteryProbability: masteryProb,
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
      console.error(`Failed to make decision for topic ${topicName}:`, error);
      // Fallback: include topic if it hasn't been revised recently
      const topic = topicObjMap.get(topicName);
      if (topic.daysSinceLastRevision && topic.daysSinceLastRevision > 10) {
        decisions.push({
          topic: topicName,
          masteryProbability: 0.5,
          priority: "MEDIUM" as const,
          daysSinceRevision: topic.daysSinceLastRevision,
          adkDecision: null, // Mark as fallback
        });
      }
    }
  }

  // ⚡ Bolt: Move priority mapping object outside the sort callback to prevent object allocation on every comparison
  // 📊 Impact: O(1) instead of O(N log N) object allocations during array sorting
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };

  // Sort by priority (HIGH first) and mastery (lowest first)
  return decisions.sort((a, b) => {
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

For each topic, use the provided reason_code (URGENT_REVISION, SCHEDULED_REVISION, FALLBACK) to tailor the explanation (1-2 sentences):
- URGENT_REVISION: Emphasize that mastery is slipping and quick review will fix it.
- SCHEDULED_REVISION: Focus on spaced repetition and memory retention.
- FALLBACK: Mention it's been a while since they practiced.

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
          `${d.topic} (mastery: ${(d.masteryProbability * 100).toFixed(0)}%, priority: ${d.priority}, reason_code: ${d.adkDecision?.action || 'FALLBACK'})`
      )
      .join(', ');

    let llmExplanations: { topic: string; reason: string }[] = [];
    try {
      // LLM GENERATES EXPLANATIONS
      const { output } = await explanationPrompt({ topicsToExplain });
      llmExplanations = output?.explanations || [];
    } catch (error) {
      console.error("LLM Explanation Failed:", error);
      // Fallback logic continues below
    }

    // Combine ML decisions with LLM explanations
    const revisionList = mlDecisions.slice(0, 5).map((decision, idx) => {
      const explanation = llmExplanations.find((e) => e.topic === decision.topic);

      // Robust fallback reason if LLM fails or explanation missing
      let fallbackReason = 'Recommended for revision based on your learning history.';
      if (!decision.adkDecision) {
        fallbackReason = 'It has been a while since you practiced this topic.';
      } else if (decision.adkDecision.action === 'URGENT_REVISION') {
        fallbackReason = 'Urgent: Your mastery is critically low.';
      } else if (decision.adkDecision.action === 'SCHEDULED_REVISION') {
        fallbackReason = 'Spaced repetition: Time to review this to prevent forgetting.';
      }

      return {
        topic: decision.topic,
        reason: explanation?.reason || fallbackReason,
        priority: decision.priority,
        masteryScore: decision.masteryProbability,
      };
    });

    return { revisionList };
  }
);
