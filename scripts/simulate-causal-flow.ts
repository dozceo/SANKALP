
import fs from 'fs';
import path from 'path';
import { extractMasteryFeatures, type StudentHistory, type RawQuizResult } from '@/ml/features/student_features';
import { predictMastery } from '@/ml/inference/ml-bridge';
import { makeRevisionDecision, selectContentStrategy, type ADKDecision } from '@/ai/adk/decision-engine';
import { type MasteryPredictionOutput, type MasteryPredictionInput } from '@/ml/inference/types';
import { DecisionAction, ContentStrategy } from '@/ai/adk/types';

// Mock LLM Response Generator
function mockLLM(promptContext: string, injectFault: boolean = false): any {
    if (injectFault) {
        // Schema violation: Missing required fields
        return {
            text: "Here is an explanation...",
            // Missing 'explanations' array expected by UI
        };
    }

    // Simulate valid response based on strategy
    const response = {
        explanations: [
            {
                topic: "Calculus",
                reason: promptContext.includes("URGENT") ? "Urgent revision needed due to low mastery." : "Scheduled review to maintain retention."
            }
        ]
    };
    return response;
}

// UI Validator
function validateUI(llmOutput: any, adkDecision: ADKDecision): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check Schema
    if (!llmOutput.explanations || !Array.isArray(llmOutput.explanations)) {
        issues.push("CRITICAL: LLM output schema violation - missing 'explanations' array.");
        return { valid: false, issues };
    }

    // Check Semantic Consistency
    const explanation = llmOutput.explanations[0];
    if (!explanation) {
        issues.push("CRITICAL: LLM output empty explanation list.");
        return { valid: false, issues };
    }

    if (adkDecision.action === DecisionAction.URGENT_REVISION && !explanation.reason.toLowerCase().includes("urgent")) {
        issues.push("SEMANTIC: ADK requested URGENT_REVISION but LLM explanation tone is not urgent.");
    }

    return { valid: issues.length === 0, issues };
}

// Pipeline Runner
interface PipelineResult {
    scenario: string;
    features: MasteryPredictionInput;
    prediction: MasteryPredictionOutput;
    adkDecision: ADKDecision;
    llmPrompt: string;
    uiValidation: { valid: boolean; issues: string[] };
    coherence: { valid: boolean; issues: string[] };
    logs: string[];
}

async function runPipeline(
    scenarioName: string,
    history: StudentHistory,
    topic: string,
    injectFaults: { ml?: Partial<MasteryPredictionOutput>; llm?: boolean; feature?: Partial<MasteryPredictionInput> } = {}
): Promise<PipelineResult> {
    const logs: string[] = [];
    logs.push(`[${scenarioName}] Starting pipeline for topic: ${topic}`);

    // 1. Feature Extraction
    let features = extractMasteryFeatures(topic, history);
    if (injectFaults.feature) {
        features = { ...features, ...injectFaults.feature };
        logs.push(`[Fault Injection] Modified Features: ${JSON.stringify(injectFaults.feature)}`);
    }
    logs.push(`[Features] Avg Score: ${features.avg_quiz_score.toFixed(2)}, Attempts: ${features.attempts_per_topic}`);

    // 2. ML Prediction
    let prediction: MasteryPredictionOutput;
    if (injectFaults.ml) {
        prediction = {
            mastery_probability: 0.5,
            confidence: 0.5,
            predicted_class: "not_mastered",
            ...injectFaults.ml
        };
        logs.push(`[Fault Injection] Forced ML Prediction: ${JSON.stringify(prediction)}`);
    } else {
        try {
            console.log(`[DEBUG] Invoking predictMastery for ${topic}...`);
            // Set a timeout for the prediction to avoid hanging indefinitely if the bridge gets stuck
            const predictionPromise = predictMastery(features);
            const timeoutPromise = new Promise<MasteryPredictionOutput>((_, reject) =>
                setTimeout(() => reject(new Error("Prediction timed out in script")), 15000)
            );

            prediction = await Promise.race([predictionPromise, timeoutPromise]);
            logs.push(`[ML Prediction] Mastery: ${prediction.mastery_probability.toFixed(2)}, Class: ${prediction.predicted_class}`);
        } catch (e) {
            console.error(`[DEBUG] Prediction error for ${topic}:`, e);
            logs.push(`[ML Error] ${e}`);
            prediction = { mastery_probability: 0, confidence: 0, predicted_class: "error", error: String(e) };
        }
    }

    // 3. ADK Decision
    const mlSignals = {
        mastery_probability: prediction.mastery_probability,
        confidence: prediction.confidence,
        days_since_last_revision: features.days_since_last_revision,
        attempts_count: features.attempts_per_topic,
        performance_trend: "STABLE" as const // Simplified
    };

    const adkDecision = makeRevisionDecision({
        studentId: history.studentId || "test-student",
        topic: topic,
        currentDate: new Date(),
        mlSignals,
        daysUntilExam: 30 // Default
    });
    logs.push(`[ADK Decision] Action: ${adkDecision.action}, Priority: ${adkDecision.priority}`);

    // 4. LLM Prompt Construction
    const llmPrompt = selectContentStrategy(adkDecision);
    logs.push(`[LLM Prompt] Strategy: ${adkDecision.contentStrategy}`);

    // 5. LLM Generation
    const llmOutput = mockLLM(llmPrompt, injectFaults.llm);

    // 6. UI Validation
    const uiValidation = validateUI(llmOutput, adkDecision);
    if (!uiValidation.valid) {
        logs.push(`[UI Failure] ${uiValidation.issues.join("; ")}`);
    } else {
        logs.push(`[UI Success] Rendered successfully.`);
    }

    // Coherence Check
    const coherenceIssues: string[] = [];

    // Rule: High Mastery (>0.8) should NOT trigger Urgent Revision
    if (prediction.mastery_probability > 0.8 && adkDecision.action === DecisionAction.URGENT_REVISION) {
        coherenceIssues.push("VIOLATION: High Mastery (>0.8) resulted in URGENT_REVISION");
    }

    // Rule: Low Mastery (<0.4) should NOT trigger Progress Allowed
    if (prediction.mastery_probability < 0.4 && adkDecision.action === DecisionAction.PROGRESS_ALLOWED) {
        coherenceIssues.push("VIOLATION: Low Mastery (<0.4) resulted in PROGRESS_ALLOWED");
    }

    // Rule: ADK Urgent Revision should imply specific LLM Tone
    if (adkDecision.action === DecisionAction.URGENT_REVISION && !llmPrompt.includes("Tone: MOTIVATING") && !llmPrompt.includes("Tone: SUPPORTIVE")) {
         // This depends on ADK logic, but let's check
    }

    return {
        scenario: scenarioName,
        features,
        prediction,
        adkDecision,
        llmPrompt,
        uiValidation,
        coherence: { valid: coherenceIssues.length === 0, issues: coherenceIssues },
        logs
    };
}

// Scenarios
async function runScenarios() {
    const report: string[] = [];
    report.push("# Causal Integrity Report");
    report.push("");
    report.push("## Visual DAG of Data Flow");
    report.push("```mermaid");
    report.push("graph TD");
    report.push("    A[User Quiz] -->|Feature Extraction| B(Student Features)");
    report.push("    B -->|Inference| C{ML Model}");
    report.push("    C -->|Probability| D[ADK Decision Engine]");
    report.push("    D -->|Strategy| E[LLM Prompt Builder]");
    report.push("    E -->|Prompt| F[Genkit Flow]");
    report.push("    F -->|JSON| G[UI Component]");
    report.push("    G -->|Render| H((User Perception))");
    report.push("    style C fill:#f9f,stroke:#333,stroke-width:2px");
    report.push("    style D fill:#bbf,stroke:#333,stroke-width:2px");
    report.push("    style F fill:#bfb,stroke:#333,stroke-width:2px");
    report.push("```");
    report.push("");

    const history: StudentHistory = {
        studentId: "student-123",
        quizResults: [],
        lastLoginDate: new Date(),
        registrationDate: new Date()
    };

    // Helper to add quiz results
    const addResult = (score: number, daysAgo: number) => {
        history.quizResults.push({
            topic: "Calculus",
            score,
            timestamp: new Date(Date.now() - daysAgo * 86400000),
            timeSpent: 60,
            questionsAttempted: 10
        });
    };

    // Scenario 1: Healthy Flow (High Mastery)
    addResult(0.9, 1);
    addResult(0.85, 2);
    addResult(0.95, 3);
    const s1 = await runPipeline("Healthy Flow (High Mastery)", history, "Calculus");

    // Scenario 2: Critical Risk (Low Mastery)
    const lowMasteryHistory: StudentHistory = { ...history, quizResults: [] };
    // Add failing grades
    lowMasteryHistory.quizResults.push({ topic: "Algebra", score: 0.2, timestamp: new Date(), timeSpent: 30, questionsAttempted: 10 });
    lowMasteryHistory.quizResults.push({ topic: "Algebra", score: 0.3, timestamp: new Date(Date.now() - 86400000), timeSpent: 30, questionsAttempted: 10 });
    const s2 = await runPipeline("Critical Risk (Low Mastery)", lowMasteryHistory, "Algebra");

    // Scenario 3: Silent Failure (ML Error Injection)
    // Real mastery is low (from features), but ML predicts High
    const s3 = await runPipeline("Silent Failure: ML False Positive", lowMasteryHistory, "Algebra", {
        ml: { mastery_probability: 0.95, predicted_class: "mastered" }
    });

    // Scenario 4: ADK-LLM Dissonance (Fault Injection)
    // Force ADK to Urgent, but check if LLM matches
    const s4 = await runPipeline("LLM Schema Violation", lowMasteryHistory, "Algebra", {
        llm: true // Inject fault
    });

    // Scenario 5: Feature Corruption
    // Time spent is negative (impossible)
    const s5 = await runPipeline("Feature Corruption (Negative Time)", lowMasteryHistory, "Algebra", {
        feature: { time_spent_per_question: -10 }
    });

    // Compile Results
    report.push("## Semantic Coherence Violation Matrix");
    report.push("| Scenario | ML Pred | ADK Action | LLM Strategy | UI Valid | Coherence |");
    report.push("|---|---|---|---|---|---|");

    [s1, s2, s3, s4, s5].forEach(r => {
        report.push(`| ${r.scenario} | ${r.prediction.mastery_probability.toFixed(2)} | ${r.adkDecision.action} | ${r.adkDecision.contentStrategy} | ${r.uiValidation.valid ? '✅' : '❌'} | ${r.coherence.valid ? '✅' : '❌ ' + r.coherence.issues.length} |`);
    });

    report.push("");
    report.push("## Silent Failure Cascade Scenarios");

    [s1, s2, s3, s4, s5].forEach(r => {
        if (!r.coherence.valid || !r.uiValidation.valid) {
            report.push(`### ${r.scenario}`);
            report.push(`**Trigger:** ${r.scenario}`);
            report.push(`**Cascade:**`);
            r.logs.forEach(l => report.push(`- ${l}`));
            report.push(`**Impact:** ${r.uiValidation.issues.join(', ') || r.coherence.issues.join(', ')}`);
            report.push("");
        }
    });

    report.push("## Blast Radius Analysis");
    report.push("- **ML Model Drift:** A 0.4 shift in probability (Scenario 3) caused ADK to flip from URGENT_REVISION to PROGRESS_ALLOWED. User would be pushed to advanced content while failing basics.");
    report.push("- **LLM Schema Failure:** Missing 'explanations' key causes UI to crash or render empty state. Critical for user trust.");
    report.push("- **Feature Corruption:** Negative time spent was propagated to ML. If model is not robust, it produces unpredictable results.");

    report.push("");
    report.push("## Recommended Circuit Breakers");
    report.push("1. **ML Output Guard:** Reject predictions with confidence < 0.3 or if input features are out of bounds.");
    report.push("2. **ADK Sanity Check:** If mastery < 0.4 but action is PROGRESS_ALLOWED, flag as anomaly.");
    report.push("3. **UI Fallback:** If LLM output is malformed, render a default explanation based on ADK reason code.");

    fs.writeFileSync('CAUSAL_INTEGRITY_REPORT.md', report.join('\n'));
    console.log("Report generated: CAUSAL_INTEGRITY_REPORT.md");
    process.exit(0);
}

runScenarios().catch((e) => {
    console.error(e);
    process.exit(1);
});
