/**
 * Student Intelligence API
 * 
 * Unified endpoint that frontend calls to get ML + ADK intelligence.
 * Route: /api/intelligence/student
 */

import { NextRequest, NextResponse } from "next/server";
import { batchPredictMastery } from "@/ml/inference/ml-bridge";
import type { MasteryPredictionInput, MasteryPredictionOutput } from "@/ml/inference/types";
import { extractMasteryFeatures, calculatePerformanceTrend, type StudentHistory } from "@/ml/features/student_features";
import { makeRevisionDecision, makeInterventionDecision } from "@/ai/adk/decision-engine";
import { DecisionAction, type MLSignals } from "@/ai/adk/types";
import type { StudentIntelligence, MasterySignal, ADKMode } from "@/types/intelligence";
import { getStudent, getQuizResults, getCachedPrediction, cachePrediction, saveADKDecision } from "@/lib/db-helpers";
import { calculateTrend } from "@/lib/trend-utils";

/**
 * GET /api/intelligence/student?studentId=xxx
 * 
 * Returns comprehensive intelligence about a student's learning state
 */
export async function GET(request: NextRequest) {
    try {
        // Extract student ID from query params
        const searchParams = request.nextUrl.searchParams;
        const studentId = searchParams.get("studentId");

        if (!studentId) {
            return NextResponse.json(
                { error: "studentId is required" },
                { status: 400 }
            );
        }

        // Fetch student from database
        const student = await getStudent(studentId);

        if (!student) {
            return NextResponse.json(
                { error: "Student not found" },
                { status: 404 }
            );
        }

        // Fetch quiz results from database
        const quizResults = await getQuizResults(studentId, 100);

        // If no quiz results, return empty state
        if (quizResults.length === 0) {
            return NextResponse.json({
                mastery: {},
                attentionRisk: "LOW",
                revisionUrgency: "NONE",
                adkDecision: "PROGRESS_MODE",
                confidence: "LOW",
                generatedAt: new Date().toISOString(),
                studentId,
                reasoning: ["No quiz history available yet"],
                flags: [],
            });
        }

        // Build student history object
        const studentHistory: StudentHistory = {
            studentId,
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

        // Get unique topics
        const topics = [...new Set(studentHistory.quizResults.map((r) => r.topic))];

        // Process each topic through ML → ADK pipeline
        const mastery: Record<string, MasterySignal> = {};
        const allAdkFlags: string[] = [];
        let highestUrgency: "NONE" | "SCHEDULED" | "URGENT" = "NONE";
        let overallAttentionRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";

        // Prepare for batch processing
        type TopicData = {
            topic: string;
            features: ReturnType<typeof extractMasteryFeatures>;
            mlPrediction: Partial<MasteryPredictionOutput> | null;
        };
        const topicData: TopicData[] = [];
        const topicsToPredict: Array<{ topic: string; features: MasteryPredictionInput }> = [];

        // Pass 1: Extract features and check cache
        // We use Promise.all to check cache in parallel
        const cacheChecks = await Promise.all(
            topics.map(async (topic) => {
                const features = extractMasteryFeatures(topic, studentHistory);
                const cached = await getCachedPrediction(studentId, topic);
                return { topic, features, cached };
            })
        );

        for (const { topic, features, cached } of cacheChecks) {
            if (cached) {
                topicData.push({
                    topic,
                    features,
                    mlPrediction: {
                        mastery_probability: cached.masteryProbability,
                        confidence: cached.confidence,
                    },
                });
            } else {
                const inputFeatures: MasteryPredictionInput = {
                    avg_quiz_score: features.avg_quiz_score,
                    attempts_per_topic: features.attempts_per_topic,
                    days_since_last_revision: features.days_since_last_revision,
                    quiz_score_variance: features.quiz_score_variance,
                    time_spent_per_question: features.time_spent_per_question,
                };
                topicsToPredict.push({ topic, features: inputFeatures });
                topicData.push({ topic, features, mlPrediction: null });
            }
        }

        // Batch Prediction
        let newPredictionsMap = new Map<string, MasteryPredictionOutput>();
        if (topicsToPredict.length > 0) {
            const batchResults = await batchPredictMastery(topicsToPredict);
            newPredictionsMap = new Map(batchResults.map((r) => [r.topic, r.prediction]));
        }

        // Pass 2: Process all topics with predictions
        for (const data of topicData) {
            const { topic, features } = data;
            let mlPrediction = data.mlPrediction;

            if (!mlPrediction) {
                // Retrieve from batch results
                mlPrediction = newPredictionsMap.get(topic);

                if (!mlPrediction || mlPrediction.predicted_class === "error") {
                    console.error(`Prediction failed for topic ${topic}:`, mlPrediction?.error || "Unknown error");
                    // Skip this topic to avoid breaking the whole response
                    continue;
                }

                // Cache the new prediction
                await cachePrediction({
                    studentId,
                    topic,
                    masteryProbability: mlPrediction.mastery_probability!,
                    confidence: mlPrediction.confidence!,
                    daysSinceRevision: features.days_since_last_revision,
                    createdAt: new Date(),
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                });
            }

            // Step 3: Build ML signals
            const mlSignals: MLSignals = {
                mastery_probability: mlPrediction.mastery_probability,
                confidence: mlPrediction.confidence,
                days_since_last_revision: features.days_since_last_revision,
                attempts_count: features.attempts_per_topic,
                attention_risk: mlPrediction.mastery_probability < 0.4 ? "HIGH" : "LOW",
            };

            // Step 4: ADK decision
            const adkDecision = makeRevisionDecision({
                studentId,
                topic,
                currentDate: new Date(),
                mlSignals,
            });

            // Log ADK decision to database (async, don't wait)
            saveADKDecision({
                studentId,
                topic,
                action: adkDecision.action,
                priority: adkDecision.priority,
                reasoning: adkDecision.reasoning,
                flags: adkDecision.adkFlags,
                timestamp: new Date(),
            }).catch((err) => console.error("Failed to log ADK decision:", err));

            // Update aggregate state
            if (adkDecision.action === DecisionAction.URGENT_REVISION) {
                highestUrgency = "URGENT";
            } else if (highestUrgency !== "URGENT" && adkDecision.action === DecisionAction.SCHEDULED_REVISION) {
                highestUrgency = "SCHEDULED";
            }

            if (mlSignals.attention_risk === "HIGH") {
                overallAttentionRisk = "HIGH";
            }

            allAdkFlags.push(...adkDecision.adkFlags);

            // Calculate trend for this topic
            const topicQuizzes = studentHistory.quizResults.filter(q => q.topic === topic);
            const trend = calculateTrend(topicQuizzes);

            // Store mastery signal
            mastery[topic] = {
                score: mlPrediction.mastery_probability,
                confidence: mlPrediction.confidence,
                daysSinceRevision: features.days_since_last_revision,
                attempts: features.attempts_per_topic,
              feature/student-trend-calc-8872142549955436469
                trend: trend,
                trend: calculatePerformanceTrend(studentHistory.quizResults.filter(q => q.topic === topic)), main
                needsRevision: adkDecision.priority !== "LOW",
                priority: adkDecision.priority,
            };
        }

        // Determine ADK mode
        const adkMode: ADKMode =
            highestUrgency === "URGENT" ? "SHORT_REVISION_MODE" :
                overallAttentionRisk === "HIGH" ? "ASSESSMENT_MODE" :
                    "PROGRESS_MODE";

        // Generate reasoning
        const reasoning: string[] = [];
        if (highestUrgency === "URGENT") {
            reasoning.push("Multiple topics require urgent revision");
        }
        if (overallAttentionRisk === "HIGH") {
            reasoning.push("Showing signs of attention fatigue");
        }
        if (allAdkFlags.includes("SPACED_REPETITION")) {
            reasoning.push("Spaced repetition recommended for retention");
        }

        // Build response
        const intelligence: StudentIntelligence = {
            mastery,
            attentionRisk: overallAttentionRisk,
            revisionUrgency: highestUrgency,
            adkDecision: adkMode,
            confidence: "MEDIUM",
            generatedAt: new Date().toISOString(),
            studentId,
            reasoning: reasoning.length > 0 ? reasoning : ["Learning on track"],
            flags: allAdkFlags,
        };

        return NextResponse.json(intelligence);
    } catch (error) {
        console.error("Error generating student intelligence:", error);
        return NextResponse.json(
            { error: "Failed to generate student intelligence" },
            { status: 500 }
        );
    }
}
