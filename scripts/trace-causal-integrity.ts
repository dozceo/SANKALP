
import fs from 'fs';
import path from 'path';
import { extractMasteryFeatures, type StudentHistory, type RawQuizResult } from '../src/ml/features/student_features';
import { makeRevisionDecision } from '../src/ai/adk/decision-engine';
import { DecisionAction, type ADKDecision } from '../src/ai/adk/types';
import { generateStudentIntelligence } from '../src/lib/generateStudentIntelligence';
import { type StudentNode } from '../src/data/docsData';

// Mock ML Bridge
interface Prediction {
    mastery_probability: number;
    confidence: number;
    predicted_class: "mastered" | "not_mastered" | "error";
    error?: string;
}

interface TraceStep<T> {
    name: string;
    input: any;
    output: T | null;
    error?: string;
    warnings: string[];
    semanticValid: boolean;
}

interface CausalTrace {
    id: string;
    steps: {
        featureExtraction: TraceStep<any>;
        mlPrediction: TraceStep<any>;
        adkDecision: TraceStep<ADKDecision>;
        uiRendering: TraceStep<any>;
        fallbackCheck?: TraceStep<any>;
    };
    semanticViolations: string[];
}

async function runTrace(scenarioName: string, history: StudentHistory, faultInjection?: (step: string, data: any) => any): Promise<CausalTrace> {
    const trace: CausalTrace = {
        id: scenarioName,
        steps: {
            featureExtraction: { name: "Feature Extraction", input: history, output: null, warnings: [], semanticValid: true },
            mlPrediction: { name: "ML Prediction", input: null, output: null, warnings: [], semanticValid: true },
            adkDecision: { name: "ADK Decision", input: null, output: null, warnings: [], semanticValid: true },
            uiRendering: { name: "UI Rendering", input: null, output: null, warnings: [], semanticValid: true },
            fallbackCheck: { name: "Fallback Logic Check", input: null, output: null, warnings: [], semanticValid: true }
        },
        semanticViolations: []
    };

    try {
        // 1. Feature Extraction
        const topic = history.quizResults[0]?.topic || "Math";
        let features = extractMasteryFeatures(topic, history);

        if (faultInjection) features = faultInjection("featureExtraction", features);

        trace.steps.featureExtraction.output = features;

        // Validate Features
        if (features.avg_quiz_score < 0 || features.avg_quiz_score > 1) {
            trace.steps.featureExtraction.warnings.push(`Invalid avg_quiz_score: ${features.avg_quiz_score}`);
            trace.steps.featureExtraction.semanticValid = false;
        }
        if (features.days_since_last_revision < 0) {
             trace.steps.featureExtraction.warnings.push(`Negative days_since_last_revision: ${features.days_since_last_revision}`);
             trace.semanticViolations.push("Feature Extraction: Negative days since last revision");
             trace.steps.featureExtraction.semanticValid = false;
        }

        // 2. ML Prediction
        trace.steps.mlPrediction.input = features;
        // Mocking predictMastery
        let prediction: Prediction = {
            mastery_probability: features.avg_quiz_score * 0.9 + 0.05,
            confidence: 0.8,
            predicted_class: features.avg_quiz_score > 0.6 ? "mastered" : "not_mastered",
            error: undefined
        };

        if (faultInjection) prediction = faultInjection("mlPrediction", prediction);

        trace.steps.mlPrediction.output = prediction;

        // Validate ML Semantic Consistency
        if (features.avg_quiz_score >= 0.9 && prediction.mastery_probability < 0.2) {
             trace.semanticViolations.push(`ML Integrity: High quiz score (${features.avg_quiz_score}) led to low mastery prediction (${prediction.mastery_probability})`);
             trace.steps.mlPrediction.semanticValid = false;
        }


        // 3. ADK Decision
        const mlSignals = {
            mastery_probability: prediction.mastery_probability,
            confidence: prediction.confidence,
            days_since_last_revision: features.days_since_last_revision,
            attempts_count: features.attempts_per_topic,
            attention_risk: (prediction.mastery_probability < 0.4 ? "HIGH" : "LOW") as "HIGH" | "LOW"
        };

        if (faultInjection) {
             const injected = faultInjection("adkInput", mlSignals);
             Object.assign(mlSignals, injected);
        }

        trace.steps.adkDecision.input = { topic, mlSignals };
        const decision = makeRevisionDecision({
            studentId: history.studentId || "unknown",
            topic: topic,
            currentDate: new Date(),
            mlSignals
        });

        trace.steps.adkDecision.output = decision;

        // Validate ADK Semantic Consistency
        if (prediction.mastery_probability < 0.4 && decision.action === DecisionAction.PROGRESS_ALLOWED) {
            trace.semanticViolations.push(`ADK Integrity: Low mastery (${prediction.mastery_probability}) allowed progress.`);
            trace.steps.adkDecision.semanticValid = false;
        }
        if (prediction.mastery_probability > 0.8 && decision.action === DecisionAction.URGENT_REVISION) {
            if (!decision.reasoning.toLowerCase().includes("forgetting") && !decision.reasoning.toLowerCase().includes("exam")) {
                 trace.semanticViolations.push(`ADK Integrity: High mastery (${prediction.mastery_probability}) flagged for urgent revision without justification.`);
                 trace.steps.adkDecision.semanticValid = false;
            }
        }


        // 4. UI Rendering (Simulation)
        const uiIntelligence = {
            mastery: {
                [topic]: {
                    score: prediction.mastery_probability,
                    priority: decision.priority,
                    needsRevision: decision.priority !== "LOW"
                }
            },
            adkDecision: decision.action === DecisionAction.URGENT_REVISION ? "SHORT_REVISION_MODE" : "PROGRESS_MODE",
            reasoning: [decision.reasoning]
        };

        trace.steps.uiRendering.input = uiIntelligence;
        trace.steps.uiRendering.output = `Tooltip: ${uiIntelligence.reasoning[0]} | Mode: ${uiIntelligence.adkDecision}`;

        // Validate UI Semantic Consistency
        if (decision.priority === "HIGH" && uiIntelligence.adkDecision === "PROGRESS_MODE") {
             trace.semanticViolations.push("UI Integrity: High priority decision mapped to PROGRESS_MODE");
             trace.steps.uiRendering.semanticValid = false;
        }

        // 5. Fallback Logic Check
        const mockStudentNode: StudentNode = {
            id: history.studentId || "unknown",
            name: "Test Student",
            type: "student",
            masteryScores: {
                [topic]: features.avg_quiz_score
            }
        };

        const fallbackIntel = generateStudentIntelligence(mockStudentNode);
        trace.steps.fallbackCheck!.output = fallbackIntel;

        const fallbackScore = fallbackIntel.mastery[topic]?.score;
        if (Math.abs(fallbackScore - prediction.mastery_probability) > 0.2) {
             trace.semanticViolations.push(`Silent Failure: Fallback logic divergence. ML predicted ${prediction.mastery_probability.toFixed(2)} but fallback generated ${fallbackScore?.toFixed(2)}`);
             trace.steps.fallbackCheck!.semanticValid = false;
        }
        const fallbackDays = fallbackIntel.mastery[topic]?.daysSinceRevision;
        if (Math.abs(fallbackDays - features.days_since_last_revision) > 5) {
             trace.semanticViolations.push(`Silent Failure: Fallback logic uses random revision dates (${fallbackDays} vs actual ${features.days_since_last_revision})`);
             trace.steps.fallbackCheck!.semanticValid = false;
        }


    } catch (e: any) {
        trace.steps.featureExtraction.error = e.message;
    }

    return trace;
}

async function main() {
    const traces: CausalTrace[] = [];

    const baseHistory: StudentHistory = {
        studentId: "student-1",
        lastLoginDate: new Date(),
        registrationDate: new Date(),
        quizResults: [
            {
                topic: "Calculus",
                score: 0.9,
                timestamp: new Date(),
                timeSpent: 60,
                questionsAttempted: 10
            }
        ]
    };

    // 1. Baseline Success
    traces.push(await runTrace("Baseline: Good Student", baseHistory));

    // 2. ML Failure Injection
    traces.push(await runTrace("Fault: ML Under-prediction", baseHistory, (step, data) => {
        if (step === "mlPrediction") {
            return { ...data, mastery_probability: 0.1 };
        }
        return data;
    }));

    // 3. Future Quiz Date
    const futureHistory: StudentHistory = {
        ...baseHistory,
        quizResults: [
            {
                topic: "Calculus",
                score: 0.9,
                timestamp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
                timeSpent: 60,
                questionsAttempted: 10
            }
        ]
    };
    traces.push(await runTrace("Edge: Future Quiz Date", futureHistory));

    // Generate Markdown Report
    let report = "# Causal Integrity Report\n\n";

    report += "## 1. Visual Causal Flow (DAG)\n";
    report += "```mermaid\n";
    report += "graph TD\n";
    report += "    A[User Quiz] -->|Raw Data| B(Feature Extraction)\n";
    report += "    B -->|Features| C{ML Model}\n";
    report += "    C -->|Mastery Prob| D{ADK Decision Engine}\n";
    report += "    D -->|Decision| E[LLM Prompt]\n";
    report += "    D -->|Mode| F[UI Rendering]\n";
    report += "    E -->|Explanation| F\n";
    report += "    G[Fallback Logic] -.->|Random Data| F\n";
    report += "    style G stroke:#f00,stroke-width:2px,stroke-dasharray: 5 5\n";
    report += "```\n\n";

    report += "## 2. Semantic Coherence Violation Matrix\n";
    report += "| Scenario | Violations Found |\n";
    report += "|---|---|\n";
    traces.forEach(t => {
        const violations = t.semanticViolations.length > 0 ? "🔴 " + t.semanticViolations.length : "🟢 None";
        report += `| ${t.id} | ${violations} |\n`;
    });

    report += "\n## 3. Silent Failure Cascade Scenarios\n";
    report += "- **Scenario 1: API Failure -> Fallback Divergence**. If the ML API is unreachable, the frontend silently falls back to `generateStudentIntelligence`, which uses random numbers for revision dates. This causes the UI to recommend revision for topics recently mastered, or ignore stale topics.\n";
    report += "- **Scenario 2: Future Date Corruption**. If a client sends a future timestamp (e.g., misconfigured clock), Feature Extraction produces negative `days_since_revision`. This propagates to ML and ADK without error, potentially causing erratic retention predictions.\n";
    report += "- **Scenario 3: High Score / Low Mastery**. If the ML model drifts or is poisoned (e.g. predicts 0.1 mastery for 0.9 quiz score), the ADK triggers 'ADAPTIVE_TEACHING' for a mastered topic. The UI reflects this with 'High Priority', confusing the user.\n";

    report += "\n## 4. Blast Radius Analysis\n";
    report += "| Failure Point | Impact Scope | User Perception | Severity |\n";
    report += "|---|---|---|---|\n";
    report += "| **Feature Extraction (Negative Time)** | ML, ADK, UI | Confusing retention stats | Medium |\n";
    report += "| **ML Prediction (Model Drift)** | ADK, UI, LLM | Wrong study recommendations | High |\n";
    report += "| **Fallback Logic (Random)** | UI | 'It works but it's wrong' | Critical |\n";

    report += "\n## 5. Recommended Circuit Breakers\n";
    report += "To prevent these silent failures, the following semantic guards should be implemented:\n\n";
    report += "### A. Feature Extraction Guard\n";
    report += "```typescript\n";
    report += "if (days_since_last_revision < 0) {\n";
    report += "    console.warn('Future date detected, clamping to 0');\n";
    report += "    days_since_last_revision = 0;\n";
    report += "}\n";
    report += "```\n\n";
    report += "### B. ML Sanity Check\n";
    report += "```typescript\n";
    report += "// In ml-bridge.ts\n";
    report += "if (features.avg_quiz_score > 0.8 && prediction.mastery_probability < 0.2) {\n";
    report += "    // Flag for review, potentially fallback to rule-based heuristic\n";
    report += "    return { ...prediction, predicted_class: 'error', error: 'Semantic mismatch' };\n";
    report += "}\n";
    report += "```\n\n";
    report += "### C. Fallback Synchronization\n";
    report += "Replace `generateStudentIntelligence` random logic with a deterministic heuristic that mirrors the ML model (e.g. `score * 0.9`).\n";

    report += "\n## 6. Detailed Trace Logs\n";
    traces.forEach(t => {
        if (t.semanticViolations.length > 0) {
            report += `### ${t.id}\n`;
            report += "**Violations:**\n";
            t.semanticViolations.forEach(v => report += `- ${v}\n`);
            report += "\n**Trace Output:**\n```json\n";
            report += JSON.stringify(t.steps, null, 2);
            report += "\n```\n\n";
        }
    });

    fs.writeFileSync('CAUSAL_INTEGRITY_REPORT.md', report);
    console.log("Report generated: CAUSAL_INTEGRITY_REPORT.md");
}

main();
