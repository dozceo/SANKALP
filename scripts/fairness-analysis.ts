
import { predictMastery } from "../src/ml/inference/ml-bridge";
import { makeRevisionDecision, makeInterventionDecision, selectContentStrategy } from "../src/ai/adk/decision-engine";
import { MasteryPredictionInput } from "../src/ml/inference/types";
import { DecisionContext, MLSignals, DecisionAction, ContentStrategy } from "../src/ai/adk/types";
import fs from "fs";
import path from "path";

// --- Configuration ---
const REPORT_PATH = "FAIRNESS_BIAS_CASCADE_REPORT.md";
const STUDENT_PROFILES = [
    {
        name: "Baseline Student",
        desc: "Average behavior, average scores",
        features: {
            avg_quiz_score: 0.55,
            attempts_per_topic: 3,
            days_since_last_revision: 7,
            quiz_score_variance: 0.1,
            time_spent_per_question: 45
        }
    },
    {
        name: "The Fast Guesser",
        desc: "Fast responses, high variance, same score",
        features: {
            avg_quiz_score: 0.55,
            attempts_per_topic: 2,
            days_since_last_revision: 7,
            quiz_score_variance: 0.25, // High variance
            time_spent_per_question: 15 // Fast
        }
    },
    {
        name: "The Deep Thinker",
        desc: "Slow responses, low variance, same score",
        features: {
            avg_quiz_score: 0.55,
            attempts_per_topic: 2,
            days_since_last_revision: 7,
            quiz_score_variance: 0.05, // Low variance
            time_spent_per_question: 90 // Slow
        }
    },
    {
        name: "The Grinder",
        desc: "Many attempts, average time, same score",
        features: {
            avg_quiz_score: 0.55,
            attempts_per_topic: 8, // High attempts
            days_since_last_revision: 3,
            quiz_score_variance: 0.1,
            time_spent_per_question: 45
        }
    },
    {
        name: "The Anxious Reviser",
        desc: "Constant revision, average score",
        features: {
            avg_quiz_score: 0.55,
            attempts_per_topic: 4,
            days_since_last_revision: 0, // Just revised
            quiz_score_variance: 0.15,
            time_spent_per_question: 50
        }
    },
    {
        name: "The Returning Student",
        desc: "Long break, average score",
        features: {
            avg_quiz_score: 0.55,
            attempts_per_topic: 2,
            days_since_last_revision: 25, // Long break
            quiz_score_variance: 0.1,
            time_spent_per_question: 45
        }
    }
];

// --- Types ---
interface AnalysisResult {
    profileName: string;
    features: MasteryPredictionInput;
    mlPrediction: {
        probability: number;
        confidence: number;
        class: string;
    };
    adkDecision: {
        action: string;
        priority: string;
        strategy: string;
        tone: string;
        difficulty: string;
    };
    intervention: {
        triggered: boolean;
        severity?: string;
        reason?: string;
    };
}

// --- Main Analysis Logic ---

async function runAnalysis() {
    console.log("Starting Fairness & Bias Cascade Analysis...");
    const results: AnalysisResult[] = [];

    // 1. Outcome Disparity Analysis
    for (const profile of STUDENT_PROFILES) {
        console.log(`Processing profile: ${profile.name}...`);

        try {
            // ML Prediction
            const prediction = await predictMastery(profile.features);

            // Construct Signals
            const mlSignals: MLSignals = {
                mastery_probability: prediction.mastery_probability,
                confidence: prediction.confidence,
                days_since_last_revision: profile.features.days_since_last_revision,
                attempts_count: profile.features.attempts_per_topic,
                // Mocking future signals with reasonable defaults for fairness baseline
                days_until_forget: 999,
                attention_risk: "LOW",
                performance_trend: "STABLE"
            };

            // ADK Revision Decision
            const context: DecisionContext = {
                studentId: "synthetic-user",
                topic: "Test Topic",
                currentDate: new Date(),
                daysUntilExam: 30, // Default not exam mode
                mlSignals
            };

            const decision = makeRevisionDecision(context);

            // ADK Intervention Decision
            const intervention = makeInterventionDecision(context);

            results.push({
                profileName: profile.name,
                features: profile.features,
                mlPrediction: {
                    probability: prediction.mastery_probability,
                    confidence: prediction.confidence,
                    class: prediction.predicted_class
                },
                adkDecision: {
                    action: decision.action,
                    priority: decision.priority,
                    strategy: decision.contentStrategy,
                    tone: decision.llmContext.tone,
                    difficulty: decision.llmContext.difficulty
                },
                intervention: {
                    triggered: !!intervention,
                    severity: intervention?.severity,
                    reason: intervention?.reason
                }
            });

        } catch (error) {
            console.error(`Error processing ${profile.name}:`, error);
        }
    }

    // 2. ADK Logic Audit (Edge Cases)
    const adkAuditResults = runAdkAudit();

    // 3. Generate Report
    generateReport(results, adkAuditResults);

    // Explicitly exit to close Python bridge
    process.exit(0);
}

function runAdkAudit() {
    console.log("Running ADK Logic Audit...");
    const auditResults = [];

    // Case A: High Mastery + Slow Timing (Should NOT be penalized)
    // We simulate the signals directly, bypassing ML model for this pure logic test
    const slowMaster = {
        mastery_probability: 0.9,
        confidence: 0.9,
        days_since_last_revision: 2,
        attempts_count: 2,
        days_until_forget: 20,
        attention_risk: "LOW" as const
    };

    const slowMasterDecision = makeRevisionDecision({
        studentId: "audit-1",
        topic: "Audit",
        currentDate: new Date(),
        daysUntilExam: 30,
        mlSignals: slowMaster
    });

    auditResults.push({
        case: "High Mastery (0.9) (Simulating Slow Timing via outcome)",
        expectedAction: "PROGRESS_ALLOWED",
        actualAction: slowMasterDecision.action,
        passed: slowMasterDecision.action === "PROGRESS_ALLOWED"
    });

    // Case B: Attention Risk Amplification
    // Same mastery (0.35), but different Attention Risk
    const lowMastery = {
        mastery_probability: 0.35,
        confidence: 0.8,
        days_since_last_revision: 5,
        attempts_count: 5,
        days_until_forget: 10,
        attention_risk: "LOW" as const
    };

    const riskLow = makeRevisionDecision({
        studentId: "audit-2a",
        topic: "Audit",
        currentDate: new Date(),
        daysUntilExam: 30,
        mlSignals: { ...lowMastery, attention_risk: "LOW" }
    });

    const riskHigh = makeRevisionDecision({
        studentId: "audit-2b",
        topic: "Audit",
        currentDate: new Date(),
        daysUntilExam: 30,
        mlSignals: { ...lowMastery, attention_risk: "HIGH" }
    });

    auditResults.push({
        case: "Attention Risk Amplification (Low vs High)",
        observation: `Low Risk -> ${riskLow.action} (${riskLow.contentStrategy}), High Risk -> ${riskHigh.action} (${riskHigh.contentStrategy})`,
        biasDetected: riskHigh.contentStrategy !== riskLow.contentStrategy
    });

    return auditResults;
}

function generateReport(results: AnalysisResult[], auditResults: any[]) {
    let report = `# Fairness & Bias Cascade Report

## 1. Outcome Disparity Matrix
Analysis of how different behavioral profiles with identical quiz scores (0.55) are treated.

| Profile | Time/Q | Variance | Attempts | ML Prediction | ADK Action | Strategy | Tone |
|---------|--------|----------|----------|---------------|------------|----------|------|
`;

    results.forEach(r => {
        report += `| ${r.profileName} | ${r.features.time_spent_per_question}s | ${r.features.quiz_score_variance} | ${r.features.attempts_per_topic} | ${r.mlPrediction.probability.toFixed(3)} | ${r.adkDecision.action} | ${r.adkDecision.strategy} | ${r.adkDecision.tone} |\n`;
    });

    report += `
## 2. Explanation Quality Parity
Inferred from Content Strategy and Tone assignment.

`;

    // Calculate variations
    const tones = new Set(results.map(r => r.adkDecision.tone));
    const strategies = new Set(results.map(r => r.adkDecision.strategy));

    if (tones.size > 1 || strategies.size > 1) {
        report += `**Warning: Disparity Detected.** The system assigns different content strategies/tones to students with the same score based on behavioral features.\n\n`;
        report += `- **Tones observed:** ${Array.from(tones).join(", ")}\n`;
        report += `- **Strategies observed:** ${Array.from(strategies).join(", ")}\n`;
    } else {
        report += `**Success:** All profiles received consistent explanation quality parameters.\n`;
    }

    report += `
## 3. Intervention Suggestion Disparity
Did any profile trigger an intervention falsely?

| Profile | Intervention Triggered | Reason |
|---------|------------------------|--------|
`;
    results.forEach(r => {
        report += `| ${r.profileName} | ${r.intervention.triggered ? "**YES**" : "No"} | ${r.intervention.reason || "-"} |\n`;
    });

    report += `
## 4. ADK Decision Logic Audit
Direct unit tests of decision rules.

| Case | Result | Details |
|------|--------|---------|
`;

    auditResults.forEach(r => {
        report += `| ${r.case} | ${r.passed !== undefined ? (r.passed ? "PASS" : "FAIL") : (r.biasDetected ? "BIAS DETECTED" : "NEUTRAL")} | ${r.observation || r.actualAction || "-"} |\n`;
    });

    report += `
## 5. Privacy-Preserving Fairness Strategy
This report was generated using **counterfactual testing** with synthetic profiles. No real student data or demographics were used.
`;

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`Report generated at ${REPORT_PATH}`);
}

// Run the script
runAnalysis();
