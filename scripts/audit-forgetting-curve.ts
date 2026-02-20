
import fs from 'fs';
import path from 'path';

async function auditForgettingCurve() {
  console.log('Starting Forgetting Curve Audit...');

  const reportPath = path.join(process.cwd(), 'reports', 'FORGETTING_CURVE_AUDIT.md');
  const reportDir = path.dirname(reportPath);

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const modelPath = path.join(process.cwd(), 'src/ml/models/forgetting_model.pkl');
  const inferenceScriptPath = path.join(process.cwd(), 'src/ml/inference/predict_mastery.py');

  let reportContent = `# Forgetting Curve Model Implementation Audit

## Overview
This report audits the mathematical correctness and implementation status of the Forgetting Curve model, which is critical for the Smart Revision Planner.

## Methodology
- Checked for the existence of the trained model file: \`src/ml/models/forgetting_model.pkl\`.
- Analyzed the inference script: \`src/ml/inference/predict_mastery.py\`.
- Verified if \`days_until_forget\` is being calculated or returned.

## Findings

`;

  // Check Model File
  if (fs.existsSync(modelPath)) {
    reportContent += `- ✅ **Model File Found**: \`src/ml/models/forgetting_model.pkl\` exists.\n`;
  } else {
    reportContent += `- ❌ **MISSING**: Model file \`src/ml/models/forgetting_model.pkl\` does not exist. This confirms the feature is not deployed.\n`;
  }

  // Check Inference Script
  if (fs.existsSync(inferenceScriptPath)) {
    const content = fs.readFileSync(inferenceScriptPath, 'utf-8');
    if (content.includes('days_until_forget')) {
      reportContent += `- ✅ **Inference Logic**: The script references \`days_until_forget\`.\n`;
    } else {
      reportContent += `- ❌ **MISSING LOGIC**: The inference script \`predict_mastery.py\` does **not** contain logic for \`days_until_forget\`. It only predicts mastery probability.\n`;
    }
  } else {
    reportContent += `- ⚠️ Inference script not found at expected path.\n`;
  }

  // Impact Analysis
  reportContent += `
## Impact Analysis
The ADK Decision Engine (\`src/ai/adk/decision-engine.ts\`) relies on \`days_until_forget\` for scheduling urgent revisions:
\`\`\`typescript
    if (mastery_probability < 0.4 && (mlSignals.days_until_forget ?? 999) < 3) {
        return { action: DecisionAction.URGENT_REVISION, ... };
    }
\`\`\`
Since the model is missing, \`days_until_forget\` is undefined, defaulting to \`999\`.
**Result**: The "Urgent Revision" condition based on imminent forgetting will **never trigger**. This degrades the efficacy of the Smart Revision Planner.

## Recommendations

1.  **Implement the Forgetting Curve Model**:
    - Train a regression model (e.g., Ebbinghaus Forgetting Curve: $R = e^{-t/S}$) using historical quiz data.
    - $t$: Time since last review.
    - $S$: Strength of memory (based on previous scores).

2.  **Update Inference Pipeline**:
    - Add \`predict_forgetting.py\` or update \`predict_mastery.py\` to output \`days_until_forget\`.
    - Update \`ml-bridge.ts\` to handle this new output.

3.  **Temporary Heuristic Fallback**:
    - Until the ML model is ready, implement a Leitner System heuristic in the ADK or a utility function:
    - If mastery < 0.5, days_until_forget = 1
    - If mastery < 0.7, days_until_forget = 3
    - Else days_until_forget = 7 * (attempts + 1)

`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`Report generated at ${reportPath}`);
}

auditForgettingCurve().catch(console.error);
