/**
 * ADK Decision Engine
 * 
 * Policy-driven orchestration layer that decides WHEN and HOW to use ML and LLM.
 * This replaces ad-hoc decision logic with explicit, auditable policies.
 */

import {
    MLSignals,
    DecisionContext,
    ADKDecision,
    DecisionAction,
    ContentStrategy,
    LLMContext,
    TeacherInterventionSignal,
} from "./types";

/**
 * Core Decision Engine: Revision Planning
 * 
 * Decides if a topic needs revision and with what urgency.
 */
export function makeRevisionDecision(context: DecisionContext): ADKDecision {
    const { mlSignals, daysUntilExam } = context;
    const { mastery_probability, days_since_last_revision, attention_risk } = mlSignals;

    // POLICY RULE 0: Exam Cramming Mode (< 3 days to exam) - HIGHEST PRIORITY
    if (typeof daysUntilExam === "number" && daysUntilExam <= 3 && mastery_probability < 0.6) {
        return {
            action: DecisionAction.URGENT_REVISION,
            priority: "HIGH",
            contentStrategy: ContentStrategy.SHORT_FORM,
            reasoning: "Exam imminent - high-yield cramming strategy",
            adkFlags: ["CRAMMING_MODE", "EXAM_IMMINENT"],
            llmContext: {
                strategy: ContentStrategy.SHORT_FORM,
                targetDuration: "5-MIN",
                tone: "SUPPORTIVE",
                includeExamples: true,
                includeVisuals: true,
                difficulty: "BASIC",
            },
        };
    }

    // POLICY RULE 1: Critical Mastery + Imminent Forgetting
    if (mastery_probability < 0.4 && (mlSignals.days_until_forget ?? 999) < 3) {
        return {
            action: DecisionAction.URGENT_REVISION,
            priority: "HIGH",
            contentStrategy: ContentStrategy.SHORT_FORM,
            reasoning: "Low mastery with imminent forgetting risk",
            adkFlags: ["URGENT_REVISION", "FORGETTING_RISK"],
            llmContext: {
                strategy: ContentStrategy.SHORT_FORM,
                targetDuration: "5-MIN",
                tone: "MOTIVATING",
                includeExamples: true,
                includeVisuals: false,
                difficulty: "BASIC",
            },
        };
    }

    // POLICY RULE 2: Low Mastery + High Attention Risk
    if (mastery_probability < 0.4 && attention_risk === "HIGH") {
        return {
            action: DecisionAction.ADAPTIVE_TEACHING,
            priority: "HIGH",
            contentStrategy: ContentStrategy.INTERACTIVE,
            reasoning: "Low mastery with attention challenges - needs engaging format",
            adkFlags: ["ADAPTIVE_TEACHING", "ATTENTION_RISK"],
            llmContext: {
                strategy: ContentStrategy.INTERACTIVE,
                targetDuration: "2-MIN",
                tone: "MOTIVATING",
                includeExamples: true,
                includeVisuals: true,
                difficulty: "BASIC",
            },
        };
    }

    // POLICY RULE 3: Moderate Mastery + Stale Knowledge
    if (mastery_probability >= 0.4 && mastery_probability < 0.6 && days_since_last_revision > 7) {
        return {
            action: DecisionAction.SCHEDULED_REVISION,
            priority: "MEDIUM",
            contentStrategy: ContentStrategy.DEEP_DIVE,
            reasoning: "Moderate mastery but needs refreshing (spaced repetition)",
            adkFlags: ["SPACED_REPETITION"],
            llmContext: {
                strategy: ContentStrategy.DEEP_DIVE,
                targetDuration: "10-MIN",
                tone: "NEUTRAL",
                includeExamples: true,
                includeVisuals: false,
                difficulty: "INTERMEDIATE",
            },
        };
    }

    // POLICY RULE 4: High Mastery + Recent Revision
    if (mastery_probability >= 0.7 && days_since_last_revision <= 14) {
        return {
            action: DecisionAction.PROGRESS_ALLOWED,
            priority: "LOW",
            contentStrategy: ContentStrategy.CHALLENGE,
            reasoning: "Strong mastery - ready for advanced content",
            adkFlags: ["MASTERY_ACHIEVED"],
            llmContext: {
                strategy: ContentStrategy.CHALLENGE,
                targetDuration: "15-MIN",
                tone: "CHALLENGING",
                includeExamples: false,
                includeVisuals: false,
                difficulty: "ADVANCED",
            },
        };
    }

    // DEFAULT: Scheduled revision
    return {
        action: DecisionAction.SCHEDULED_REVISION,
        priority: "MEDIUM",
        contentStrategy: ContentStrategy.DEEP_DIVE,
        reasoning: "Routine revision recommended",
        adkFlags: ["ROUTINE_REVISION"],
        llmContext: {
            strategy: ContentStrategy.DEEP_DIVE,
            targetDuration: "10-MIN",
            tone: "NEUTRAL",
            includeExamples: true,
            includeVisuals: false,
            difficulty: "INTERMEDIATE",
        },
    };
}

/**
 * Teacher Intervention Decision
 * 
 * Decides if teacher should be notified about a student.
 */
export function makeInterventionDecision(
    context: DecisionContext
): TeacherInterventionSignal | null {
    const { studentId, topic, mlSignals } = context;
    const { mastery_probability, attention_risk, days_since_last_revision } = mlSignals;

    // INTERVENTION RULE 1: Critical Risk (multiple red flags)
    if (
        mastery_probability < 0.3 &&
        attention_risk === "HIGH" &&
        days_since_last_revision > 10
    ) {
        return {
            studentId,
            studentName: `Student ${studentId}`, // In production, fetch from DB
            topic,
            severity: "CRITICAL",
            reason: "Multiple risk factors: Very low mastery, high attention risk, prolonged inactivity",
            suggestedAction: "Immediate 1-on-1 intervention required. Consider individualized learning plan.",
            mlSignals,
            timestamp: new Date(),
        };
    }

    // INTERVENTION RULE 2: High Attention Risk
    if (attention_risk === "HIGH" && (mlSignals.dropout_probability ?? 0) > 0.6) {
        return {
            studentId,
            studentName: `Student ${studentId}`,
            topic,
            severity: "HIGH",
            reason: "High dropout risk detected",
            suggestedAction: "Engage student with personalized motivation. Consider gamification or peer learning.",
            mlSignals,
            timestamp: new Date(),
        };
    }

    // INTERVENTION RULE 3: Persistent Low Mastery
    if (mastery_probability < 0.4 && mlSignals.attempts_count > 5) {
        return {
            studentId,
            studentName: `Student ${studentId}`,
            topic,
            severity: "MEDIUM",
            reason: "Repeated attempts without improvement",
            suggestedAction: "Topic may require different teaching approach. Consider alternative explanations or remedial support.",
            mlSignals,
            timestamp: new Date(),
        };
    }

    // No intervention needed
    return null;
}

/**
 * Select Content Strategy based on ADK Decision
 * 
 * Maps decision to specific LLM prompt configuration.
 */
export function selectContentStrategy(decision: ADKDecision): string {
    const { contentStrategy, llmContext } = decision;

    const strategyDescriptions: Record<ContentStrategy, string> = {
        [ContentStrategy.SHORT_FORM]:
            "Brief, focused explanation with quick wins. Use simple language and immediate examples.",
        [ContentStrategy.DEEP_DIVE]:
            "Comprehensive explanation with multiple perspectives. Include edge cases and nuances.",
        [ContentStrategy.INTERACTIVE]:
            "Engaging, question-driven format. Use analogies, visuals, and check understanding frequently.",
        [ContentStrategy.MOTIVATIONAL]:
            "Encouraging tone focused on building confidence. Celebrate small wins and provide reassurance.",
        [ContentStrategy.CHALLENGE]:
            "Advanced problems and thought-provoking questions. Push boundaries and explore implications.",
        [ContentStrategy.REMEDIAL]:
            "Back to fundamentals. Break down into smallest components and build from scratch.",
    };

    return `
Content Strategy: ${strategyDescriptions[contentStrategy]}

Constraints:
- Target Duration: ${llmContext.targetDuration}
- Tone: ${llmContext.tone}
- Difficulty Level: ${llmContext.difficulty}
- Include Examples: ${llmContext.includeExamples ? "Yes" : "No"}
- Include Visuals: ${llmContext.includeVisuals ? "Yes (describe diagrams)" : "No"}
  `.trim();
}

/**
 * Log ADK Decision (for analytics and debugging)
 */
export function logDecision(context: DecisionContext, decision: ADKDecision): void {
    console.log("[ADK Decision]", {
        timestamp: new Date().toISOString(),
        studentId: context.studentId,
        topic: context.topic,
        action: decision.action,
        priority: decision.priority,
        strategy: decision.contentStrategy,
        flags: decision.adkFlags,
        mlSignals: {
            mastery: context.mlSignals.mastery_probability,
            attention: context.mlSignals.attention_risk,
        },
    });
}
