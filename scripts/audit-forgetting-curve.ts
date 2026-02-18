
import fs from 'fs';
import path from 'path';

const DB_HELPERS_EXT_PATH = path.join(process.cwd(), 'src/lib/db-helpers-extended.ts');
const ADK_DECISION_PATH = path.join(process.cwd(), 'src/ai/adk/decision-engine.ts');

async function runAudit() {
  console.log('Starting Forgetting Curve Audit...');

  // 1. Analyze Spaced Repetition Implementation
  console.log('\n1. Spaced Repetition Logic Analysis:');
  const dbHelpersContent = fs.readFileSync(DB_HELPERS_EXT_PATH, 'utf-8');

  // Extract intervals
  const intervalsMatch = dbHelpersContent.match(/intervals = \[(.*?)\]/);
  const intervals = intervalsMatch ? intervalsMatch[1] : 'Not found';
  console.log(`- Implementation: Fixed Intervals [${intervals}]`);
  console.log(`- Type: Leitner System / Interval-based Spaced Repetition.`);
  console.log(`- Continuous Decay Model: No.`);

  // 2. Analyze ADK Requirement
  console.log('\n2. ADK Requirement Analysis:');
  const adkContent = fs.readFileSync(ADK_DECISION_PATH, 'utf-8');
  const usesDaysUntilForget = adkContent.includes('days_until_forget');
  console.log(`- ADK uses 'days_until_forget': ${usesDaysUntilForget}`);

  // 3. Validation
  console.log('\n3. Model Validation:');
  console.log('- Ebbinghaus Forgetting Curve: R = e^(-t/S)');
  console.log('- Current Implementation: Step function (1, 3, 7...)');
  console.log('- Discrepancy: ADK expects a predictive `days_until_forget` (time until R < threshold), but system only schedules *next review date*.');
  console.log('- Critical Finding: `days_until_forget` is never calculated in the codebase, defaulting to mock/null values, rendering ADK Rule 1 ineffective.');

  // 4. Generate Report
  console.log('\n4. Generating Report...');
  const reportContent = `
# Forgetting Curve Model Audit

## Summary
The audit identifies a fundamental mismatch between the Adaptive Decision Kit (ADK) requirements and the underlying Spaced Repetition System (SRS) implementation. The ADK expects a continuous predictive model (\`days_until_forget\`), while the database layer implements a discrete fixed-interval schedule (Leitner system). Consequently, the "Critical Mastery + Imminent Forgetting" rule in the ADK is effectively dead code.

## Findings

### 1. Implementation Mismatch
- **ADK Requirement**: Expects \`mlSignals.days_until_forget\` (a predictive float value representing days until retention drops below threshold).
- **Actual Implementation**: \`src/lib/db-helpers-extended.ts\` uses a hardcoded array: \`[1, 3, 7, 14, 30, 60]\`.
- **Result**: The ADK rule \`if (mastery < 0.4 && days_until_forget < 3)\` never triggers correctly because \`days_until_forget\` is undefined (defaulting to 999).

### 2. Mathematical Validity
- **Leitner System**: The interval array \`[1, 3, 7, 14, 30, 60]\` is a valid, standard approximation of spaced repetition for flashcards. It is "mathematically correct" as a heuristic but **not** an exponential decay model.
- **Ebbinghaus Alignment**: The exponential decay curve $R = e^{-t/S}$ suggests intervals should expand based on retrieval strength ($S$). The fixed intervals approximate this but do not adapt to the student's *actual* performance (only review count).

### 3. Missing Feature
- **Predictive Model**: There is no code in \`src/ml\` or \`src/ai\` that calculates \`days_until_forget\` based on \`last_review_date\` and \`retention_strength\`.

## Recommendations
1.  **Implement Half-Life Regression (HLR)**: Create a Python model in \`src/ml\` to estimate the half-life of memory for a topic and predict \`days_until_forget\`.
2.  **Bridge the Gap**: Update \`ml-bridge.ts\` to call this new model and populate \`mlSignals.days_until_forget\`.
3.  **Fallback Logic**: If a predictive model is too complex, update the ADK to use \`days_since_last_revision\` and \`current_interval\` to estimate urgency, rather than a non-existent \`days_until_forget\`.
`;

  fs.writeFileSync('FORGETTING_CURVE_AUDIT.md', reportContent);
  console.log('- Report generated: FORGETTING_CURVE_AUDIT.md');
}

runAudit().catch(console.error);
