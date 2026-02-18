
import path from "path";
import fs from "fs";
import { predictMastery } from "../src/ml/inference/ml-bridge";
import { extractMasteryFeatures, type StudentHistory } from "../src/ml/features/student_features";
import { makeRevisionDecision, selectContentStrategy } from "../src/ai/adk/decision-engine";
import { type MasteryPredictionInput, type MasteryPredictionOutput } from "../src/ml/inference/types";
import { type ADKDecision, DecisionAction, ContentStrategy } from "../src/ai/adk/types";

// Setup environment for ML Bridge
process.env.ML_PYTHON_SCRIPT = path.join(process.cwd(), "src", "ml", "inference", "predict_mastery.py");
// Mock API URL to force subprocess usage
process.env.ML_API_URL = "http://invalid-url";

interface Scenario {
    name: string;
    description: string;
    studentHistory: StudentHistory;
    daysUntilExam?: number;
    expectedOutcome: {
        masteryLevel: "HIGH" | "LOW" | "ERROR";
        adkAction: DecisionAction;
    };
    injectedFault?: "FEATURE_CORRUPTION" | "ML_GARBAGE";
}

interface TraceResult {
    scenario: string;
    features: MasteryPredictionInput;
    mlOutput: MasteryPredictionOutput;
    adkDecision: ADKDecision;
    llmContext: string;
    uiState: {
        masteryDisplay: string;
        alertLevel: string;
        reasoning: string;
    };
    coherenceViolations: string[];
    cascadeEffects: string[];
}

// Helper to create synthetic quiz history
function createHistory(avgScore: number, count: number, daysAgoStart: number): StudentHistory {
    const history: StudentHistory = {
        quizResults: [],
        lastLoginDate: new Date(),
        registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    };

    for (let i = 0; i < count; i++) {
        // Distribute timestamps
        const daysAgo = Math.floor(Math.random() * daysAgoStart);
        history.quizResults.push({
            topic: "Calculus",
            score: Math.max(0, Math.min(1, avgScore + (Math.random() * 0.2 - 0.1))),
            timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
            timeSpent: 60,
            questionsAttempted: 10
        });
    }
    return history;
}

const scenarios: Scenario[] = [
    {
        name: "Baseline High Mastery",
        description: "Student consistently scores high > 80%",
        studentHistory: createHistory(0.85, 10, 14),
        daysUntilExam: 30,
        expectedOutcome: { masteryLevel: "HIGH", adkAction: DecisionAction.PROGRESS_ALLOWED }
    },
    {
        name: "Baseline Low Mastery",
        description: "Student consistently scores low < 40%",
        studentHistory: createHistory(0.3, 10, 14),
        daysUntilExam: 30,
        expectedOutcome: { masteryLevel: "LOW", adkAction: DecisionAction.URGENT_REVISION } // Or SCHEDULED depending on ADK logic
    },
    {
        name: "Edge Case: Exam Cramming",
        description: "Low mastery but exam is in 2 days",
        studentHistory: createHistory(0.3, 5, 5),
        daysUntilExam: 2,
        expectedOutcome: { masteryLevel: "LOW", adkAction: DecisionAction.URGENT_REVISION }
    },
    {
        name: "Fault Injection: Valid Mastery but Garbage Time",
        description: "Feature extraction produces negative time spent",
        studentHistory: (() => {
            const h = createHistory(0.8, 5, 5);
            h.quizResults.forEach(r => r.timeSpent = -100); // Invalid time
            return h;
        })(),
        expectedOutcome: { masteryLevel: "HIGH", adkAction: DecisionAction.PROGRESS_ALLOWED } // Should handle gracefully
    },
    {
        name: "Silent Corruption: High Mastery Signal but Zero Score",
        description: "Simulating ML model drift/error where probability is high but data contradicts",
        studentHistory: createHistory(0.1, 10, 5), // Very low score
        injectedFault: "ML_GARBAGE", // Will override ML output
        expectedOutcome: { masteryLevel: "HIGH", adkAction: DecisionAction.URGENT_REVISION } // Expect conflict
    }
];

async function runTrace() {
    console.log("Starting Causal Integrity Trace...");
    const results: TraceResult[] = [];

    for (const scenario of scenarios) {
        console.log(`\nAnalyzing Scenario: ${scenario.name}`);

        // 1. Feature Extraction
        let features = extractMasteryFeatures("Calculus", scenario.studentHistory);

        // Fault Injection at Feature Level
        if (scenario.injectedFault === "FEATURE_CORRUPTION") {
             features.avg_quiz_score = NaN;
        }

        console.log("  -> Features Extracted:", JSON.stringify(features));

        // 2. ML Prediction
        let prediction: MasteryPredictionOutput;
        try {
            prediction = await predictMastery(features);
        } catch (e) {
            console.error("  -> ML Prediction Failed:", e);
            prediction = { mastery_probability: 0, confidence: 0, predicted_class: "error", error: String(e) };
        }

        // Fault Injection at ML Level
        if (scenario.injectedFault === "ML_GARBAGE") {
            prediction = {
                mastery_probability: 0.95,
                confidence: 0.99,
                predicted_class: "mastered"
            };
            console.log("  -> [INJECTED FAULT] ML Prediction overridden to High Mastery despite low scores.");
        } else {
            console.log("  -> ML Prediction:", JSON.stringify(prediction));
        }

        // 3. ADK Decision
        const adkDecision = makeRevisionDecision({
            studentId: "test-student",
            topic: "Calculus",
            currentDate: new Date(),
            daysUntilExam: scenario.daysUntilExam,
            mlSignals: {
                mastery_probability: prediction.mastery_probability,
                confidence: prediction.confidence,
                days_since_last_revision: features.days_since_last_revision,
                attempts_count: features.attempts_per_topic,
                attention_risk: prediction.mastery_probability < 0.4 ? "HIGH" : "LOW"
            }
        });
        console.log("  -> ADK Decision:", adkDecision.action, adkDecision.reasoning);

        // 4. LLM Prompt Context
        const llmStrategy = selectContentStrategy(adkDecision);

        // 5. UI State Simulation
        // Based on LearningStateCard logic
        const uiState = {
            masteryDisplay: `${Math.round(prediction.mastery_probability * 100)}%`,
            alertLevel: adkDecision.priority,
            reasoning: adkDecision.reasoning
        };

        // 6. Semantic Validation
        const violations: string[] = [];
        const cascades: string[] = [];

        // Rule 1: High Mastery (ML) -> No Urgent Revision (ADK)
        // Exception: Cramming mode might trigger urgent revision regardless? No, usually high mastery means no revision needed.
        if (prediction.mastery_probability > 0.8 && adkDecision.action === DecisionAction.URGENT_REVISION) {
            violations.push("High Mastery signal resulted in Urgent Revision decision");
            cascades.push("ML High Confidence -> ADK False Alarm -> UI Alert Fatigue");
        }

        // Rule 2: Low Mastery (ML) -> Intervention/Revision (ADK)
        if (prediction.mastery_probability < 0.4 && adkDecision.action === DecisionAction.PROGRESS_ALLOWED) {
            violations.push("Low Mastery signal ignored, allowed progress");
            cascades.push("ML Low Confidence -> ADK Silent Failure -> User False Sense of Security");
        }

        // Rule 3: LLM Context alignment
        if (adkDecision.contentStrategy === ContentStrategy.SHORT_FORM && !llmStrategy.includes("Brief")) {
            violations.push("Content Strategy mismatch in LLM Prompt");
        }

        // Rule 4: Feature-Reality check (specifically for the injection case)
        if (scenario.injectedFault === "ML_GARBAGE") {
            // We know the history has avg score 0.1
            if (prediction.mastery_probability > 0.8) {
                // This is the injection, but check if ADK caught it?
                // ADK relies on ML signals. If ML says 0.95, ADK says Progress Allowed.
                // But reality (history) says 0.1.
                // This detects the "Garbage In, Garbage Out" if ADK doesn't cross-check history.
                // ADK `makeRevisionDecision` uses `mlSignals` which come from ML. It doesn't see raw history.
                // So this IS a silent failure point.
                cascades.push("Feature-Model Divergence: Model hallucinated mastery, ADK trusted it blindly.");
            }
        }

        results.push({
            scenario: scenario.name,
            features,
            mlOutput: prediction,
            adkDecision,
            llmContext: llmStrategy.substring(0, 100) + "...",
            uiState,
            coherenceViolations: violations,
            cascadeEffects: cascades
        });
    }

    generateReport(results);
}

function generateReport(results: TraceResult[]) {
    const reportPath = path.join(process.cwd(), "CAUSAL_INTEGRITY_REPORT.md");

    let md = "# Cross-System Causal Integrity Report\n\n";
    md += "## Visual DAG of Data Flow\n";
    md += "```mermaid\n";
    md += "graph TD\n";
    md += "    A[User Quiz] -->|Raw Scores| B[Feature Extraction]\n";
    md += "    B -->|Feature Vector| C[ML Prediction (Python)]\n";
    md += "    C -->|Mastery Probability| D[ADK Decision Engine]\n";
    md += "    D -->|Strategy & Context| E[LLM Prompt Construction]\n";
    md += "    E -->|Generated Text| F[UI Rendering]\n";
    md += "    C -.->|Silent Failure?| F\n";
    md += "```\n\n";

    md += "## Semantic Coherence Matrix\n\n";
    md += "| Scenario | ML Signal | ADK Decision | UI Alert Level | Coherence Violations |\n";
    md += "|----------|-----------|--------------|----------------|----------------------|\n";

    for (const r of results) {
        const violations = r.coherenceViolations.length > 0 ? `❌ ${r.coherenceViolations.join("<br>")}` : "✅ Consistent";
        md += `| ${r.scenario} | ${(r.mlOutput.mastery_probability * 100).toFixed(0)}% | ${r.adkDecision.action} | ${r.uiState.alertLevel} | ${violations} |\n`;
    }

    md += "\n## Silent Failure Cascades\n\n";
    for (const r of results) {
        if (r.cascadeEffects.length > 0) {
            md += `### ${r.scenario}\n`;
            for (const c of r.cascadeEffects) {
                md += `- ⚠️ **Cascade Detected**: ${c}\n`;
            }
            md += "\n**Blast Radius**: " + estimateBlastRadius(r) + "\n\n";
        }
    }

    md += "## Recommendations\n";
    md += "1. **Cross-Check ML with Heuristics**: ADK should not solely rely on ML probability if raw quiz scores are available (e.g. if avg_score < 0.3 but ML > 0.8, flag error).\n";
    md += "2. **Circuit Breakers**: Implement bounds checking on Feature Extraction (e.g. time_spent cannot be negative).\n";
    md += "3. **Explanation Verification**: Add a post-generation validation step to ensure LLM explanations match the numerical data shown in UI.\n";

    fs.writeFileSync(reportPath, md);
    console.log(`\nReport generated at: ${reportPath}`);
    process.exit(0);
}

function estimateBlastRadius(r: TraceResult): string {
    if (r.adkDecision.action === DecisionAction.PROGRESS_ALLOWED && r.mlOutput.mastery_probability < 0.4) {
        return "CRITICAL: Student advances without mastery, leading to future failure spiral.";
    }
    if (r.adkDecision.action === DecisionAction.URGENT_REVISION && r.mlOutput.mastery_probability > 0.8) {
        return "MEDIUM: User frustration due to unnecessary revision recommendations.";
    }
    return "LOW: Minor UI inconsistency.";
}

runTrace().catch(console.error);
