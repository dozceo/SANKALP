/**
 * Student Intelligence Data Interfaces
 * 
 * These interfaces define the contract between backend (ML + ADK) and frontend.
 * Keeping these stable allows us to swap implementation (mock → real DB) without breaking UI.
 */

/**
 * Student Intelligence Response
 * Returned by /api/intelligence/student
 */
export interface StudentIntelligence {
    // Topic-level mastery predictions
    mastery: Record<string, MasterySignal>;

    // Overall student state
    attentionRisk: "LOW" | "MEDIUM" | "HIGH";
    revisionUrgency: "NONE" | "SCHEDULED" | "URGENT";
    adkDecision: ADKMode;

    // Meta information
    confidence: "LOW" | "MEDIUM" | "HIGH";
    generatedAt: string; // ISO timestamp
    studentId: string;

    // Explainability
    reasoning: string[]; // Human-readable reasons for decisions
    flags: string[]; // ADK flags for debugging
}

/**
 * Per-topic mastery signal
 */
export interface MasterySignal {
    score: number; // 0.0 to 1.0
    confidence: number; // 0.0 to 1.0
    daysSinceRevision: number;
    attempts: number;
    trend: "IMPROVING" | "STABLE" | "DECLINING";
    needsRevision: boolean;
    priority: "HIGH" | "MEDIUM" | "LOW";
}

/**
 * ADK Mode - Controls UI behavior
 */
export type ADKMode =
    | "SHORT_REVISION_MODE"    // Show brief, focused content
    | "DEEP_TEACHING"          // Show detailed explanations
    | "ASSESSMENT_MODE"        // Quiz-first UI
    | "PROGRESS_MODE"          // Standard learning flow
    | "INTERVENTION_REQUIRED"; // Teacher alert needed

/**
 * Post-Quiz Intelligence
 * Shown immediately after quiz completion
 */
export interface PostQuizIntelligence {
    quizScore: number;
    topicMastery: MasterySignal;
    recommendation: {
        action: "REVISE_NOW" | "PRACTICE_MORE" | "MOVE_FORWARD";
        reasoning: string;
        nextSteps: string[];
    };
    attentionAlert?: {
        severity: "LOW" | "MEDIUM" | "HIGH";
        message: string;
    };
}

/**
 * Teacher Analytics - Student Risk Profile
 */
export interface StudentRiskProfile {
    studentId: string;
    studentName: string;
    overallMastery: number;
    attentionRisk: "LOW" | "MEDIUM" | "HIGH";
    interventionRequired: boolean;
    adkFlags: string[];
    weakTopics: string[];
    lastActivity: string; // ISO timestamp
    trend: "IMPROVING" | "STABLE" | "DECLINING";
}

/**
 * Teacher Analytics - Class Overview
 */
export interface ClassAnalytics {
    totalStudents: number;
    atRiskCount: number;
    averageMastery: number;
    topicPerformance: Array<{
        topic: string;
        averageMastery: number;
        strugglingCount: number;
    }>;
    attentionDistribution: {
        low: number;
        medium: number;
        high: number;
    };
    recentAlerts: Array<{
        studentId: string;
        severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        message: string;
        timestamp: string;
    }>;
}

/**
 * Intervention Suggestion (LLM-generated)
 */
export interface InterventionSuggestion {
    studentId: string;
    topic: string;
    strategy: string; // Teaching strategy, not content
    reasoning: string;
    expectedOutcome: string;
    difficulty: "EASY" | "MODERATE" | "CHALLENGING";
}
