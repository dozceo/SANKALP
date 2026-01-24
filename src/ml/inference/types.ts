/**
 * ML Prediction Types
 * 
 * TypeScript interfaces for ML model inputs and outputs
 */

export interface MasteryPredictionInput {
    avg_quiz_score: number;
    attempts_per_topic: number;
    days_since_last_revision: number;
    quiz_score_variance: number;
    time_spent_per_question: number;
}

export interface MasteryPredictionOutput {
    mastery_probability: number;
    confidence: number;
    predicted_class: "mastered" | "not_mastered" | "error";
    error?: string;
}

export interface ForgettingPredictionOutput {
    days_until_forget: number;
    retention_confidence: number;
}

export interface AttentionRiskOutput {
    attention_risk: "LOW" | "MEDIUM" | "HIGH";
    dropout_probability: number;
    recommended_intervention?: string;
}
