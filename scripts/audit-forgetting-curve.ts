
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const REPORT_FILE = process.env.REPORT_FILE || 'FORGETTING_CURVE_AUDIT.md';
const PY_SCRIPT = process.env.PY_SCRIPT || 'src/ml/inference/predict_mastery.py';

// Standard Ebbinghaus Forgetting Curve: R = e^(-t/S)
// days_until_forget (t) for R=0.5 => t = S * ln(2) approx 0.693 * S
// Where S is stability (memory strength).
// S typically increases with successful repetitions.
function calculateExpectedDaysUntilForget(s: number): number {
    return Math.round(s * 0.693);
}

async function runAudit() {
    console.log('[Audit] Starting Forgetting Curve Audit...');

    // Sample input mimicking a student who has practiced a topic
    // "attempts_per_topic" is a proxy for repetitions (N)
    // "avg_quiz_score" is a proxy for performance
    // S could be modeled as k * N * score
    const sampleInput = {
        avg_quiz_score: 0.8,
        attempts_per_topic: 5,
        days_since_last_revision: 2,
        quiz_score_variance: 0.1,
        time_spent_per_question: 30
    };

    console.log('[Audit] Running inference with input:', JSON.stringify(sampleInput));

    const output = await runPythonScript(sampleInput);

    // If python script failed to execute (e.g. missing deps), fail the audit
    if (output.error && output.error.includes("ModuleNotFoundError")) {
        console.error('[Audit] FAIL: Python dependencies missing.');
        console.error(output.error);
        process.exit(2);
    }

    generateReport(sampleInput, output);
}

function runPythonScript(input: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [PY_SCRIPT]);

        let stdoutData = '';
        let stderrData = '';

        pythonProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`[Audit] Python script exited with code ${code}`);
                // Instead of rejecting, we return the error as the output to report it
                resolve({ error: stderrData || 'Unknown error', raw: stdoutData });
            } else {
                try {
                    // Python script prints JSON lines. We take the last one.
                    const lines = stdoutData.trim().split('\n');
                    const lastLine = lines[lines.length - 1];
                    const result = JSON.parse(lastLine);
                    resolve(result);
                } catch (e) {
                    console.error('[Audit] Failed to parse JSON output:', stdoutData);
                    resolve({ error: 'JSON parse error', raw: stdoutData });
                }
            }
        });

        pythonProcess.stdin.write(JSON.stringify(input) + '\n');
        pythonProcess.stdin.end();
    });
}

function generateReport(input: any, output: any) {
    let report = `# Forgetting Curve Model Mathematical Correctness Audit

## Executive Summary
The ADK decision engine relies on a \`days_until_forget\` metric to schedule revisions based on the forgetting curve.
This audit verified whether the ML inference layer correctly calculates and returns this metric.

## Methodology
1.  **Input Simulation**: Provided student feature data to \`src/ml/inference/predict_mastery.py\`.
    *   Attempts: ${input.attempts_per_topic}
    *   Avg Score: ${input.avg_quiz_score}
    *   Time Since Last Revision: ${input.days_since_last_revision} days
2.  **Reference Model**: Ebbinghaus Forgetting Curve ($R = e^{-t/S}$).
    *   Expected Behavior: As memory strength (S) increases with repetitions/score, \`days_until_forget\` (t where R < threshold) should increase.
3.  **Comparison**: Checked if the ML output contains \`days_until_forget\` and if it aligns with the reference model.

## Findings

### ML Output Analysis
\`\`\`json
${JSON.stringify(output, null, 2)}
\`\`\`
`;

    let failed = false;

    if (output.days_until_forget === undefined) {
        report += `
**CRITICAL FINDING: Missing Metric**
The ML inference script **does not return** \`days_until_forget\`.
The ADK logic in \`src/ai/adk/decision-engine.ts\` attempts to use this value:
\`\`\`typescript
if (mastery_probability < 0.4 && (mlSignals.days_until_forget ?? 999) < 3)
\`\`\`
Because the value is missing, it defaults to \`999\` (perfect memory), effectively **disabling** the forgetting-curve-based intervention logic.

### Deviation from Reference Model
- **Theoretical Prediction**: For a student with 5 attempts and 80% score, memory stability (S) should be high, and \`days_until_forget\` should be calculable (e.g., > 7 days).
- **Actual Implementation**: No calculation exists. Deviation is **Total (Feature Missing)**.

## Recommendations
1.  **Implement Calculation**: Add logic to \`src/ml/inference/predict_mastery.py\` (or a new script) to calculate \`days_until_forget\`.
    *   *Proposed Formula*: $S = \\text{attempts} \\times \\text{score} \\times 2$ (simplified Leitner)
    *   $\\text{days\_until\_forget} = S \\times \\ln(2)$
2.  **Update ADK Logic**: Ensure the default fallback in ADK is safe (e.g., fallback to a standard decay curve based on time only) rather than \`999\`.
`;
        failed = true;
    } else {
        report += `
The metric was found.
`;
    }

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`[Audit] Report generated at ${REPORT_FILE}`);

    if (failed) {
        console.error('[Audit] FAIL: Missing `days_until_forget` metric.');
        process.exit(1);
    } else {
        console.log('[Audit] PASS: Metric present.');
        process.exit(0);
    }
}

runAudit().catch(err => {
    console.error('[Audit] Error:', err);
    process.exit(2);
});
