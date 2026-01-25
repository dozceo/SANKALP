/**
 * Student Intelligence API
 * 
 * Unified endpoint that frontend calls to get ML + ADK intelligence.
 * Route: /api/intelligence/student
 */

import { NextRequest, NextResponse } from "next/server";
import { extractMasteryFeatures, type StudentHistory } from "@/ml/features/student_features";
import { predictMastery } from "@/ml/inference/ml-bridge";
import { makeRevisionDecision, makeInterventionDecision } from "@/ai/adk/decision-engine";
import { DecisionAction, type MLSignals } from "@/ai/adk/types";
import type { StudentIntelligence, MasterySignal, ADKMode } from "@/types/intelligence";

/**
 * GET /api/intelligence/student?studentId=xxx
 * 
 * Returns comprehensive intelligence about a student's learning state
 */
export async function GET(request: NextRequest) {
    try {
        // Extract student ID from query params
        const searchParams = request.nextUrl.searchParams;
        const studentId = searchParams.get("studentId") || "demo_student";

        // TODO: In production, fetch from database
        // For now, use mock data to demonstrate the system
        const studentHistory: StudentHistory = {
            studentId,
            quizResults: [
                {
                    topic: "Algebra",
                    score: 0.35,
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                    timeSpent: 180,
                    questionsAttempted: 10,
                },
                {
                    topic: "Algebra",
                    score: 0.40,
                    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
                    timeSpent: 200,
                    questionsAttempted: 10,
                },
                {
                    topic: "Geometry",
                    score: 0.75,
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    timeSpent: 150,
                    questionsAttempted: 10,
                },
                {
                    topic: "Calculus",
                    score: 0.55,
                    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                    timeSpent: 240,
                    questionsAttempted: 10,
                },
            ],
            lastLoginDate: new Date(),
            registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        };

        // Get unique topics
        const topics = [...new Set(studentHistory.quizResults.map((r) => r.topic))];

        // Process each topic through ML → ADK pipeline
        const mastery: Record<string, MasterySignal> = {};
        const allAdkFlags: string[] = [];
        let highestUrgency: "NONE" | "SCHEDULED" | "URGENT" = "NONE";
        let overallAttentionRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";

        for (const topic of topics) {
            // Step 1: Extract features
            const features = extractMasteryFeatures(topic, studentHistory);

            // Step 2: ML prediction
            const mlPrediction = await predictMastery({
                avg_quiz_score: features.avg_quiz_score,
                attempts_per_topic: features.attempts_per_topic,
                days_since_last_revision: features.days_since_last_revision,
                quiz_score_variance: features.quiz_score_variance,
                time_spent_per_question: features.time_spent_per_question,
            });

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

            // Store mastery signal
            mastery[topic] = {
                score: mlPrediction.mastery_probability,
                confidence: mlPrediction.confidence,
                daysSinceRevision: features.days_since_last_revision,
                attempts: features.attempts_per_topic,
                trend: "STABLE", // TODO: Calculate from history
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
