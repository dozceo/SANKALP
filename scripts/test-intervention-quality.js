
// scripts/test-intervention-quality.js

// Mock Types
const DecisionContext = {};
const TeacherInterventionSignal = {};

// Extracted Logic from src/ai/adk/decision-engine.ts
function makeInterventionDecision(context) {
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

// Test Runner
function runTest(name, signals) {
    console.log(`Test Case: ${name}`);
    const context = {
        studentId: "123",
        topic: "Algebra",
        mlSignals: signals
    };

    const result = makeInterventionDecision(context);

    if (result) {
        console.log(`  Severity: ${result.severity}`);
        console.log(`  Reason: ${result.reason}`);
        console.log(`  Action: ${result.suggestedAction}`);
    } else {
        console.log("  Result: No Intervention Needed");
    }
    console.log("--------------------------------------------------");
}

console.log("--- Teacher Intervention Quality Assessment ---\n");

// 1. Critical Risk
runTest("Critical Risk (Low Mastery + High Risk + Inactive)", {
    mastery_probability: 0.2,
    attention_risk: "HIGH",
    days_since_last_revision: 15,
    attempts_count: 2,
    dropout_probability: 0.8
});

// 2. High Attention Risk
runTest("High Attention Risk Only", {
    mastery_probability: 0.8, // Good mastery
    attention_risk: "HIGH",
    days_since_last_revision: 2,
    attempts_count: 5,
    dropout_probability: 0.7
});

// 3. Persistent Struggle
runTest("Persistent Struggle (Low Mastery + Many Attempts)", {
    mastery_probability: 0.35,
    attention_risk: "LOW",
    days_since_last_revision: 1,
    attempts_count: 8,
    dropout_probability: 0.1
});

// 4. Edge Case: Just below critical threshold
runTest("Near Critical (Mastery 0.31)", {
    mastery_probability: 0.31, // Just above 0.3 cut-off
    attention_risk: "HIGH",
    days_since_last_revision: 15,
    attempts_count: 2,
    dropout_probability: 0.5 // Below 0.6 cutoff for Rule 2
});

// 5. Normal Student
runTest("Normal Student", {
    mastery_probability: 0.75,
    attention_risk: "LOW",
    days_since_last_revision: 5,
    attempts_count: 3,
    dropout_probability: 0.1
});
