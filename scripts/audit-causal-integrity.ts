
import * as fs from 'fs';
import * as path from 'path';
import { extractMasteryFeatures, type StudentHistory, type RawQuizResult, type MasteryFeatures } from '../src/ml/features/student_features';
import { makeRevisionDecision } from '../src/ai/adk/decision-engine';
import { type MasteryPredictionInput, type MasteryPredictionOutput } from '../src/ml/inference/types';
import { type MLSignals, type DecisionContext, DecisionAction, type ADKDecision } from '../src/ai/adk/types';

// Define output path
const OUTPUT_FILE = path.join(process.cwd(), 'reports', 'CAUSAL_INTEGRITY_REPORT.md');

// --- Mock Components ---

// Mock ML Model (Simple logic to mimic trained model)
function mockML(features: MasteryPredictionInput, faultInjection?: string): MasteryPredictionOutput {
  if (faultInjection === 'ML_HALLUCINATION') {
    return {
      mastery_probability: 0.95, // High mastery despite input
      confidence: 0.9,
      predicted_class: 'mastered',
    };
  }

  const score = features.avg_quiz_score;
  let prob = score; // Linear mapping for simplicity

  // Adjust based on time spent (heuristic)
  if (features.time_spent_per_question < 5 && prob > 0.5) {
      prob -= 0.1; // Penalize rushing
  }

  return {
    mastery_probability: Math.max(0, Math.min(1, prob)),
    confidence: 0.8,
    predicted_class: prob > 0.7 ? 'mastered' : 'not_mastered',
  };
}

// Mock LLM (Simple logic to mimic prompt response)
function mockLLM(decision: ADKDecision, faultInjection?: string): { text: string, error?: string } {
  if (faultInjection === 'LLM_SCHEMA_DRIFT') {
    return { text: '', error: 'Invalid JSON schema' };
  }

  if (faultInjection === 'LLM_CONTEXT_IGNORE') {
      return { text: "Great job! You've mastered this topic." }; // Ignoring the decision
  }

  const { action, reasoning } = decision;
  if (action === DecisionAction.URGENT_REVISION) {
    return { text: `Urgent: ${reasoning}. Please review immediately.` };
  } else if (action === DecisionAction.SCHEDULED_REVISION) {
    return { text: `Scheduled: ${reasoning}. Good time for spaced repetition.` };
  } else if (action === DecisionAction.PROGRESS_ALLOWED) {
    return { text: `Progress Allowed: ${reasoning}. Ready for next topic.` };
  }

  return { text: `Generic response for ${action}` };
}

// --- Tracing Logic ---

interface TraceStep {
  step: string;
  input: any;
  output: any;
  status: 'SUCCESS' | 'FAILURE' | 'SILENT_FAILURE';
  notes: string;
}

interface ScenarioResult {
  name: string;
  description: string;
  steps: TraceStep[];
  outcome: 'PASS' | 'FAIL' | 'WARNING';
}

const results: ScenarioResult[] = [];

// Helper to run a scenario
function runScenario(
  name: string,
  description: string,
  inputHistory: StudentHistory,
  faults: { ml?: string; adk?: string; llm?: string } = {}
) {
  const trace: TraceStep[] = [];
  let currentStatus: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';

  console.log(`Running Scenario: ${name}`);

  // 1. Feature Extraction
  let features: MasteryFeatures | null = null;
  try {
    features = extractMasteryFeatures('Calculus', inputHistory);
    trace.push({
      step: 'Feature Extraction',
      input: { quizCount: inputHistory.quizResults.length },
      output: features,
      status: 'SUCCESS',
      notes: 'Features extracted successfully',
    });

    // Check for impossible values
    if (features.days_since_last_revision < 0) {
        trace[trace.length-1].status = 'SILENT_FAILURE';
        trace[trace.length-1].notes = 'Negative days since revision detected';
        currentStatus = 'FAIL';
    }
  } catch (e) {
    trace.push({ step: 'Feature Extraction', input: null, output: null, status: 'FAILURE', notes: String(e) });
    results.push({ name, description, steps: trace, outcome: 'FAIL' });
    return;
  }

  // 2. ML Prediction
  let prediction: MasteryPredictionOutput | null = null;
  try {
    prediction = mockML(features!, faults.ml);

    // Check coherence: Low score -> Low mastery
    const coherenceCheck = (features!.avg_quiz_score < 0.4 && prediction.mastery_probability > 0.8);
    const status = coherenceCheck ? 'SILENT_FAILURE' : 'SUCCESS';
    const notes = coherenceCheck ? 'ML predicts High Mastery despite Low Score' : 'Prediction consistent with features';

    if (status === 'SILENT_FAILURE') currentStatus = 'FAIL';

    trace.push({
      step: 'ML Prediction',
      input: features,
      output: prediction,
      status: status,
      notes: notes,
    });
  } catch (e) {
    trace.push({ step: 'ML Prediction', input: features, output: null, status: 'FAILURE', notes: String(e) });
    results.push({ name, description, steps: trace, outcome: 'FAIL' });
    return;
  }

  // 3. ADK Decision
  let decision: ADKDecision | null = null;
  try {
    const mlSignals: MLSignals = {
      mastery_probability: prediction.mastery_probability,
      confidence: prediction.confidence,
      days_since_last_revision: features!.days_since_last_revision,
      attempts_count: features!.attempts_per_topic,
      performance_trend: 'STABLE', // Simplified
      attention_risk: 'LOW',
    };

    // Fault Injection for ADK Input (simulating corrupted signals)
    if (faults.adk === 'ADK_CONTRADICTION') {
        mlSignals.mastery_probability = 0.9;
        mlSignals.attention_risk = 'HIGH'; // Valid state, but maybe we want to force a specific path
    }

    const context: DecisionContext = {
      studentId: 'student-1',
      topic: 'Calculus',
      currentDate: new Date(),
      mlSignals: mlSignals,
      daysUntilExam: 30,
    };

    decision = makeRevisionDecision(context);

    // Check coherence: High Mastery -> Progress Allowed (mostly)
    let status: 'SUCCESS' | 'FAILURE' | 'SILENT_FAILURE' = 'SUCCESS';
    let notes = 'Decision logic executed';

    if (mlSignals.mastery_probability > 0.8 && decision.action === DecisionAction.URGENT_REVISION) {
         // Unless cramming or forgetting...
         status = 'SILENT_FAILURE';
         notes = 'High Mastery triggered Urgent Revision (Unexpected)';
         currentStatus = 'FAIL';
    }

    trace.push({
      step: 'ADK Decision',
      input: mlSignals,
      output: decision,
      status: status,
      notes: notes,
    });

  } catch (e) {
    trace.push({ step: 'ADK Decision', input: prediction, output: null, status: 'FAILURE', notes: String(e) });
    results.push({ name, description, steps: trace, outcome: 'FAIL' });
    return;
  }

  // 4. LLM Generation
  let llmOutput: { text: string, error?: string } | null = null;
  try {
    llmOutput = mockLLM(decision!, faults.llm);

    let status: 'SUCCESS' | 'FAILURE' | 'SILENT_FAILURE' = 'SUCCESS';
    let notes = 'LLM generated text';

    if (llmOutput.error) {
        status = 'FAILURE';
        notes = `LLM Error: ${llmOutput.error}`;
        currentStatus = 'FAIL';
    } else {
        // Semantic check
        const text = llmOutput.text.toLowerCase();
        const action = decision!.action;

        if (action === DecisionAction.URGENT_REVISION && !text.includes('urgent')) {
            status = 'SILENT_FAILURE';
            notes = 'LLM text failed to convey Urgency';
            currentStatus = 'FAIL';
        }

        if (faults.llm === 'LLM_CONTEXT_IGNORE' && text.includes('mastered') && action === DecisionAction.URGENT_REVISION) {
             status = 'SILENT_FAILURE';
             notes = 'LLM hallucinated mastery despite Urgent Revision decision';
             currentStatus = 'FAIL';
        }
    }

    trace.push({
      step: 'LLM Generation',
      input: decision,
      output: llmOutput,
      status: status,
      notes: notes,
    });

  } catch (e) {
    trace.push({ step: 'LLM Generation', input: decision, output: null, status: 'FAILURE', notes: String(e) });
    results.push({ name, description, steps: trace, outcome: 'FAIL' });
    return;
  }

  results.push({ name, description, steps: trace, outcome: currentStatus });
}

// --- Scenarios ---

// 1. Happy Path: High Mastery
const historyHighMastery: StudentHistory = {
    quizResults: [
        { topic: 'Calculus', score: 0.9, timestamp: new Date(), timeSpent: 60, questionsAttempted: 10 },
        { topic: 'Calculus', score: 0.85, timestamp: new Date(Date.now() - 86400000), timeSpent: 60, questionsAttempted: 10 }
    ],
    lastLoginDate: new Date(),
    registrationDate: new Date(Date.now() - 100000000)
};

// 2. Happy Path: Low Mastery
const historyLowMastery: StudentHistory = {
    quizResults: [
        { topic: 'Calculus', score: 0.3, timestamp: new Date(), timeSpent: 60, questionsAttempted: 10 },
        { topic: 'Calculus', score: 0.2, timestamp: new Date(Date.now() - 86400000), timeSpent: 60, questionsAttempted: 10 }
    ],
    lastLoginDate: new Date(),
    registrationDate: new Date(Date.now() - 100000000)
};

// 3. Feature Corruption (Negative Time)
const historyCorruptFeatures: StudentHistory = {
    quizResults: [
        { topic: 'Calculus', score: 0.9, timestamp: new Date(Date.now() + 86400000), timeSpent: -100, questionsAttempted: 10 } // Future date -> negative days
    ],
    lastLoginDate: new Date(),
    registrationDate: new Date(Date.now() - 100000000)
};

// Execute
runScenario('Baseline: High Mastery', 'Valid high mastery input should lead to Progress Allowed', historyHighMastery);
runScenario('Baseline: Low Mastery', 'Valid low mastery input should lead to Urgent/Scheduled Revision', historyLowMastery);
runScenario('Fault: Future Timestamp', 'Quiz with future timestamp causes negative days_since_revision', historyCorruptFeatures);
runScenario('Fault: ML Hallucination', 'Low mastery input but ML returns High Mastery', historyLowMastery, { ml: 'ML_HALLUCINATION' });
runScenario('Fault: LLM Context Ignore', 'LLM ignores ADK decision and hallucinates success', historyLowMastery, { llm: 'LLM_CONTEXT_IGNORE' });


// --- Generate Report ---

function generateReport() {
    let md = `# Causal Integrity Report: Cross-System Failure Analysis\n\n`;
    md += `**Date:** ${new Date().toISOString()}\n\n`;
    md += `## 1. Executive Summary\n`;
    md += `This report analyzes the propagation of failures across the ML -> ADK -> LLM -> UI pipeline. It simulates scenarios including valid data flow and injected faults (ML hallucinations, Schema Drift, Feature Corruption) to detect silent failures.\n\n`;

    md += `## 2. Visual DAG (Data Flow)\n`;
    md += "```mermaid\n";
    md += "graph TD\n";
    md += "    A[User Quiz] -->|Raw Data| B(Feature Extraction)\n";
    md += "    B -->|Features| C{ML Model}\n";
    md += "    C -->|Predictions| D{ADK Engine}\n";
    md += "    D -->|Decision| E[LLM Prompt]\n";
    md += "    E -->|Explanation| F[UI Display]\n";
    md += "    B -.->|Silent Failure| G[Corruption]\n";
    md += "    C -.->|Hallucination| D\n";
    md += "    D -.->|Logic Gap| E\n";
    md += "    E -.->|Schema Drift| F\n";
    md += "```\n\n";

    md += `## 3. Coherence Violation Matrix\n`;
    md += `| Scenario | Step | Status | Notes |\n`;
    md += `|---|---|---|---|\n`;

    let failCount = 0;
    results.forEach(r => {
        r.steps.forEach(s => {
            if (s.status !== 'SUCCESS') {
                md += `| ${r.name} | ${s.step} | **${s.status}** | ${s.notes} |\n`;
                if (s.status === 'SILENT_FAILURE' || s.status === 'FAILURE') failCount++;
            }
        });
    });

    if (failCount === 0) {
        md += `| All Scenarios | All Steps | SUCCESS | No violations detected |\n`;
    }

    md += `\n## 4. Scenario Details\n`;
    results.forEach(r => {
        md += `### ${r.name}\n`;
        md += `*${r.description}*\n`;
        md += `**Outcome:** ${r.outcome}\n\n`;
        md += `| Step | Input Summary | Output Summary | Status |\n`;
        md += `|---|---|---|---|\n`;
        r.steps.forEach(s => {
            const inputStr = JSON.stringify(s.input).slice(0, 50) + (JSON.stringify(s.input).length > 50 ? '...' : '');
            const outputStr = s.output ? JSON.stringify(s.output).slice(0, 50) + (JSON.stringify(s.output).length > 50 ? '...' : '') : 'null';
            md += `| ${s.step} | \`${inputStr}\` | \`${outputStr}\` | ${s.status} |\n`;
        });
        md += `\n`;
    });

    md += `## 5. Blast Radius Analysis\n`;
    md += `- **Feature Extraction Errors**: Propagate downstream. Negative values (e.g. days since revision) can cause ML to output low confidence or nonsensical predictions, which ADK might misinterpret.\n`;
    md += `- **ML Hallucinations**: Critical. If ML says "Mastered" when score is 0.2, ADK (currently) trusts it blindly. This leads to "Progress Allowed" on weak topics.\n`;
    md += `- **LLM Drift**: High User Impact. If LLM ignores the "Urgent" flag, the user sees a "Great job!" message while the system internally flagged it as critical. This causes trust erosion.\n\n`;

    md += `## 6. Recommendations\n`;
    md += `1. **Circuit Breakers**: Add a coherence check between Feature Extraction and ML. If \`avg_quiz_score < 0.4\` but \`mastery_probability > 0.8\`, flag as anomaly.\n`;
    md += `2. **Input Validation**: Sanitize features (e.g., \`days_since_revision >= 0\`).\n`;
    md += `3. **LLM Output Parsing**: Enforce strict schema validation. If LLM output contradicts ADK decision (semantic analysis), fallback to a static template.\n`;

    fs.writeFileSync(OUTPUT_FILE, md);
    console.log(`Report generated at: ${OUTPUT_FILE}`);
}

generateReport();
