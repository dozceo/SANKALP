
import './drift-env-setup'; // Must be first to mock env vars
import fs from 'fs';
import path from 'path';
import { z } from 'genkit';

// Import schemas directly
import { SyllabusOutputSchema } from '../src/ai/flows/syllabus-generator';
import { AdaptiveQuizOutputSchema } from '../src/ai/flows/adaptive-quiz-engine';
import { SmartRevisionPlannerOutputSchema } from '../src/ai/flows/smart-revision-planner';
import { MotivationalCounselingOutputSchema } from '../src/ai/flows/mindful-mentor';
import { ExplainConceptOutputSchema } from '../src/ai/flows/multilingual-cognitive-chatbot';

const MOCK_RESPONSES_PATH = path.join(process.cwd(), 'src/ai/sampling/mock_responses.json');
const REPORT_PATH = path.join(process.cwd(), 'SCHEMA_DRIFT_REPORT.md');

// Map flow names to imported schemas
const SCHEMAS: Record<string, z.ZodType<any>> = {
  syllabusGeneratorFlow: SyllabusOutputSchema,
  adaptiveQuizFlow: AdaptiveQuizOutputSchema,
  smartRevisionPlannerFlow: SmartRevisionPlannerOutputSchema,
  mindfulMentorFlow: MotivationalCounselingOutputSchema,
  explainConceptFlow: ExplainConceptOutputSchema,
};

interface MockResponse {
  flow: string;
  timestamp: string;
  response: any;
  expectedStatus: 'valid' | 'invalid' | 'drift';
  description?: string;
}

interface ValidationResult {
  flow: string;
  timestamp: string;
  status: 'valid' | 'invalid_schema' | 'drift_extra_fields';
  details?: string;
  expectedStatus: 'valid' | 'invalid' | 'drift';
  match: boolean;
}

async function main() {
  console.log('Starting Schema Drift Detection (with Imports)...');

  if (!fs.existsSync(MOCK_RESPONSES_PATH)) {
    console.error(`Mock responses file not found at ${MOCK_RESPONSES_PATH}`);
    process.exit(1);
  }

  const mockData: MockResponse[] = JSON.parse(fs.readFileSync(MOCK_RESPONSES_PATH, 'utf-8'));
  const results: ValidationResult[] = [];

  for (const item of mockData) {
    const schema = SCHEMAS[item.flow];
    if (!schema) {
      console.warn(`No schema found for flow: ${item.flow}`);
      continue;
    }

    // 1. Standard Validation
    const standardResult = schema.safeParse(item.response);

    let status: 'valid' | 'invalid_schema' | 'drift_extra_fields' = 'valid';
    let details = '';

    if (!standardResult.success) {
      status = 'invalid_schema';
      details = standardResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    } else {
      // 2. Strict Validation (Check for extra fields)
      let strictResult;
      try {
         if (schema instanceof z.ZodObject) {
             strictResult = schema.strict().safeParse(item.response);
         } else {
             // For non-object schemas, assuming strict check is not applicable or done differently
             strictResult = { success: true };
         }
      } catch (e) {
          // If strict() fails (e.g. chaining issues on some Zod versions or types), ignore
          strictResult = { success: true };
      }

      if (schema instanceof z.ZodObject && !strictResult.success) {
        status = 'drift_extra_fields';
        details = strictResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      }
    }

    let match = false;
    if (item.expectedStatus === 'valid' && status === 'valid') match = true;
    if (item.expectedStatus === 'invalid' && status === 'invalid_schema') match = true;
    if (item.expectedStatus === 'drift' && (status === 'drift_extra_fields' || status === 'invalid_schema')) match = true;

    results.push({
      flow: item.flow,
      timestamp: item.timestamp,
      status,
      details,
      expectedStatus: item.expectedStatus,
      match
    });
  }

  generateReport(results);
}

function generateReport(results: ValidationResult[]) {
  let report = `# Schema Drift Report

Generated on: ${new Date().toISOString()}

## Summary
Total Responses Analyzed: ${results.length}
Drift Detected (Extra Fields): ${results.filter(r => r.status === 'drift_extra_fields').length}
Schema Violations (Invalid): ${results.filter(r => r.status === 'invalid_schema').length}
Unexpected Results: ${results.filter(r => !r.match).length}

## Detailed Analysis

| Flow | Timestamp | Status | Expected | Match | Details |
|------|-----------|--------|----------|-------|---------|
`;

  for (const r of results) {
    const icon = r.match ? '✅' : '❌';
    report += `| ${r.flow} | ${r.timestamp} | ${r.status} | ${r.expectedStatus} | ${icon} | ${r.details || '-'} |\n`;
  }

  report += `
## Recommendations

### 1. Handling Extra Fields (Drift)
For responses marked as **drift_extra_fields**, the LLM is returning more data than defined in the Zod schema.
- **Recommendation:** If the extra fields are useful (e.g., \`metadata\`, \`reasoning\`), update the Zod schema to include them as optional fields.
- **Recommendation:** If the extra fields are irrelevant, use \`.passthrough()\` in the schema to allow them without validation errors (if strict validation is enforced elsewhere), or explicitly strip them (default Zod behavior).

### 2. Handling Invalid Schemas
For responses marked as **invalid_schema**, the LLM output violates the contract.
- **Recommendation:** Loosen constraints if the drift is acceptable (e.g., change \`z.array()\` to \`z.array().or(z.string())\` if the LLM sometimes returns a single string).
- **Recommendation:** Improve prompt engineering to enforce the schema more strictly.
- **Recommendation:** Add fallback logic or retry mechanisms in the flow.

`;

  fs.writeFileSync(REPORT_PATH, report);
  console.log(`Report generated at ${REPORT_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
