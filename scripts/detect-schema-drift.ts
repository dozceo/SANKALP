
import './drift-env-setup';
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
  errors?: any[];
  extraFields?: string[];
}

function detectExtraFields(original: any, parsed: any, path: string[] = []): string[] {
    const extraFields: string[] = [];

    if (original === null || parsed === null || typeof original !== 'object' || typeof parsed !== 'object') {
        return [];
    }

    // If parsed is date, treat as primitive match if original matches (not drilling down)
    if (parsed instanceof Date) return [];

    if (Array.isArray(original)) {
        if (!Array.isArray(parsed)) return [];
        for (let i = 0; i < original.length; i++) {
            if (i < parsed.length) {
                extraFields.push(...detectExtraFields(original[i], parsed[i], [...path, `[${i}]`]));
            }
        }
    } else {
        // Object
        const originalKeys = Object.keys(original);
        // We only care about keys present in original that are missing in parsed (stripped)
        // Parsed might have transformed keys or values, but for strict drift detection we look for stripped data.

        // Note: parsed object from Zod usually only contains known keys.
        // If parsed has keys that original doesn't, that's transformation/default values (not drift).
        // If original has keys that parsed doesn't, that's EXTRA data (drift).

        const parsedKeys = new Set(Object.keys(parsed));

        for (const key of originalKeys) {
            if (!parsedKeys.has(key)) {
                // Key in original but not in parsed -> STRIPPED -> Extra Field
                extraFields.push([...path, key].join('.'));
            } else {
                extraFields.push(...detectExtraFields(original[key], parsed[key], [...path, key]));
            }
        }
    }

    return extraFields;
}

async function main() {
  console.log('Starting Schema Drift Detection (Deep Comparison)...');

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
    let errors: any[] = [];
    let extraFields: string[] = [];

    if (!standardResult.success) {
      status = 'invalid_schema';
      errors = standardResult.error.errors;
      details = errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
    } else {
      // 2. Deep Drift Detection (Compare Input vs Parsed Output)
      const parsed = standardResult.data;
      extraFields = detectExtraFields(item.response, parsed);

      if (extraFields.length > 0) {
        status = 'drift_extra_fields';
        details = `Extra fields detected: ${extraFields.join(', ')}`;
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
      errors,
      extraFields
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
## Automated Recommendations

`;

  // Group recommendations by Flow
  const flows = [...new Set(results.map(r => r.flow))];

  for (const flow of flows) {
      const flowResults = results.filter(r => r.flow === flow && (r.status === 'drift_extra_fields' || r.status === 'invalid_schema'));

      if (flowResults.length > 0) {
          report += `### ${flow}\n`;

          const issues = new Set<string>();

          for (const res of flowResults) {
             if (res.status === 'drift_extra_fields') {
                 // Suggest adding optional fields
                 res.extraFields?.forEach((field: string) => {
                      const lastKey = field.split('.').pop();
                      issues.add(`- **Extra Field Detected:** \`${field}\`. \n  - *Suggestion:* Update schema to include \`${lastKey}: z.any().optional()\``);
                 });
             } else if (res.status === 'invalid_schema') {
                 res.errors?.forEach((err: any) => {
                     const path = err.path.join('.');
                     if (err.code === 'invalid_type') {
                         issues.add(`- **Type Mismatch:** \`${path}\` expected \`${err.expected}\`, received \`${err.received}\`. \n  - *Suggestion:* Use \`z.union([z.${err.expected}(), z.${err.received}()])\` or relax strictness.`);
                     } else if (err.code === 'invalid_enum_value') {
                         issues.add(`- **Invalid Enum:** \`${path}\` received invalid value \`${err.received}\`. \n  - *Suggestion:* Add \`${err.received}\` to \`z.enum([...])\`.`);
                     } else {
                         issues.add(`- **Error:** \`${path}\`: ${err.message}`);
                     }
                 });
             }
          }

          issues.forEach(issue => report += `${issue}\n`);
          report += '\n';
      }
  }

  fs.writeFileSync(REPORT_PATH, report);
  console.log(`Report generated at ${REPORT_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
