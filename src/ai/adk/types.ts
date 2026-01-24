/**
 * ADK (Agent Decision Kit) Type Definitions
 * 
 * Defines the interfaces for the policy-driven decision layer.
 * ADK consumes ML predictions and makes orchestration decisions.
 */

/**
 * ML Signals - Aggregated predictions from ML models
 */
export interface MLSignals {
    // From Topic Mastery Model
    mastery_probability: number; // 0.0 to 1.0
    confidence: number; // 0.0 to 1.0

    // From Forgetting Curve Model (future)
    days_until_forget?: number;
    retention_confidence?: number;

    // From Attention Risk Model (future)
    attention_risk?: "LOW" | "MEDIUM" | "HIGH";
    dropout_probability?: number;

    // Contextual data
    days_since_last_revision: number;
    attempts_count: number;
    performance_trend?: "IMPROVING" | "STABLE" | "DECLINING";
}

/**
 * Decision Context - Current student state and constraints
 */
export interface DecisionContext {
    studentId: string;
    topic: string;
    currentDate: Date;
    examDate?: Date;
    daysUntilExam?: number;
    mlSignals: MLSignals;
}

/**
 * ADK Decision Actions
 */
export enum DecisionAction {
    // Revision decisions
    URGENT_REVISION = "URGENT_REVISION",
    SCHEDULED_REVISION = "SCHEDULED_REVISION",
    PROGRESS_ALLOWED = "PROGRESS_ALLOWED",

    // Intervention decisions
    TEACHER_ALERT = "TEACHER_ALERT",
    ADAPTIVE_TEACHING = "ADAPTIVE_TEACHING",
    MOTIVATIONAL_SUPPORT = "MOTIVATIONAL_SUPPORT",

    // Content decisions
    SKIP_TOPIC = "SKIP_TOPIC",
    CHALLENGE_MODE = "CHALLENGE_MODE",
}

/**
 * Content Strategy - How LLM should generate content
 */
export enum ContentStrategy {
    // Based on attention/mastery
    SHORT_FORM = "SHORT_FORM", // Low attention, quick wins
    DEEP_DIVE = "DEEP_DIVE", // High mastery, detailed exploration
    INTERACTIVE = "INTERACTIVE", // Low mastery, needs engagement
    MOTIVATIONAL = "MOTIVATIONAL", // Low attention + risk
    CHALLENGE = "CHALLENGE", // High mastery, push boundaries
    REMEDIAL = "REMEDIAL", // Very low mastery, back to basics
}

/**
 * ADK Decision Output
 */
export interface ADKDecision {
    action: DecisionAction;
    priority: "HIGH" | "MEDIUM" | "LOW";
    contentStrategy: ContentStrategy;
    reasoning: string; // Why this decision was made
    adkFlags: string[]; // System flags for logging/analytics
    llmContext: LLMContext; // What to tell the LLM
}

/**
 * LLM Context - Instructions for content generation
 */
export interface LLMContext {
    strategy: ContentStrategy;
    targetDuration: "2-MIN" | "5-MIN" | "10-MIN" | "15-MIN";
    tone: "MOTIVATING" | "CHALLENGING" | "SUPPORTIVE" | "NEUTRAL";
    includeExamples: boolean;
    includeVisuals: boolean;
    difficulty: "BASIC" | "INTERMEDIATE" | "ADVANCED";
}

/**
 * Teacher Intervention Signal
 */
export interface TeacherInterventionSignal {
    studentId: string;
    studentName: string;
    topic: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    reason: string;
    suggestedAction: string;
    mlSignals: MLSignals;
    timestamp: Date;
}

/**
 * Class-Level Analytics
 */
export interface ClassAnalytics {
    totalStudents: number;
    atRiskCount: number;
    averageMastery: number;
    topicPerformance: Map<string, number>; // topic -> avg mastery
    attentionTrends: {
        high: number;
        medium: number;
        low: number;
    };
    weakTopics: string[]; // Topics where >50% students struggle
}
