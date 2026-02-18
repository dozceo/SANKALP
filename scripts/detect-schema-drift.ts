
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
  responseSnippet: string;
  specificRecommendation: string;
}

function generateSpecificRecommendation(status: string, details: string): string {
  if (status === 'valid') return 'None';

  if (status === 'drift_extra_fields') {
    // Extract field name from details if possible, e.g. "Unrecognized key(s) in object: 'metadata'"
    const match = details.match(/'([^']+)'/);
    const field = match ? match[1] : 'the extra field';
    return `Add \`${field}: z.any().optional()\` to the schema or use \`.passthrough()\` to allow unknown keys.`;
  }

  if (details.includes('Expected array, received string')) {
    return 'Update schema to `z.union([z.array(originalType), z.string()])` or refine prompt to ensure array output.';
  }
  if (details.includes('Invalid enum value')) {
    return 'Add the received value to the Zod enum definition or validate the prompt constraints.';
  }
  if (details.includes('Expected string, received object')) {
    return 'Update schema to allow object (e.g. `z.union([z.string(), z.object(...)])`) or check if a specific field (e.g., `.text`) should be extracted.';
  }
  if (details.includes('Required')) {
    return 'Make the field optional with `.optional()` or ensure the prompt explicitly requires it.';
  }

  return 'Review schema constraints against the response structure.';
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
             strictResult = { success: true };
         }
      } catch (e) {
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
      match,
      responseSnippet: JSON.stringify(item.response, null, 2),
      specificRecommendation: generateSpecificRecommendation(status, details)
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
## Detailed Failures & Recommendations

This section provides specific examples of schema drift and actionable recommendations for updates.

`;

  const failures = results.filter(r => r.status !== 'valid');
  if (failures.length === 0) {
    report += "No failures detected.\n";
  } else {
    for (const r of failures) {
      report += `### ${r.flow} (${r.timestamp})
**Status:** ${r.status}
**Error Details:** ${r.details}

**Response Snippet:**
\`\`\`json
${r.responseSnippet}
\`\`\`

**Recommendation:**
${r.specificRecommendation}

---
`;
    }
  }

  report += `
## General Recommendations

### 1. Handling Extra Fields (Drift)
- Use \`.passthrough()\` on Zod schemas if you want to allow extra fields without validation errors.
- Use \`.strict()\` only if you want to enforce strict schema compliance and reject unknown fields.

### 2. Handling Invalid Schemas
- Review the prompt engineering to ensure the LLM understands the output format.
- Use \`z.union()\` or \`.optional()\` to accommodate variability in LLM responses.
`;

  fs.writeFileSync(REPORT_PATH, report);
  console.log(`Report generated at ${REPORT_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
