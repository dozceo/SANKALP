
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

// Type definitions
interface MockResponse {
  flow: string;
  timestamp: string;
  response: unknown;
  expectedStatus: 'valid' | 'invalid' | 'drift';
  description?: string;
}

type ValidationStatus = 'valid' | 'invalid_schema' | 'drift_extra_fields';
type Severity = 'Critical' | 'Warning' | 'Info';

interface ValidationResult {
  flow: string;
  timestamp: string;
  status: ValidationStatus;
  severity: Severity;
  details: string;
  expectedStatus: 'valid' | 'invalid' | 'drift';
  match: boolean;
}

interface Config {
  inputPath: string;
  outputPath: string;
  failOnViolation: boolean;
  strict: boolean;
}

// Map flow names to imported schemas
const SCHEMAS: Record<string, z.ZodType<any>> = {
  syllabusGeneratorFlow: SyllabusOutputSchema,
  adaptiveQuizFlow: AdaptiveQuizOutputSchema,
  smartRevisionPlannerFlow: SmartRevisionPlannerOutputSchema,
  mindfulMentorFlow: MotivationalCounselingOutputSchema,
  explainConceptFlow: ExplainConceptOutputSchema,
};

function parseArgs(): Config {
  const args = process.argv.slice(2);
  const config: Config = {
    inputPath: path.join(process.cwd(), 'src/ai/sampling/mock_responses.json'),
    outputPath: path.join(process.cwd(), 'SCHEMA_DRIFT_REPORT.md'),
    failOnViolation: false,
    strict: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
        config.inputPath = args[++i];
        break;
      case '--output':
        config.outputPath = args[++i];
        break;
      case '--fail-on-violation':
        config.failOnViolation = true;
        break;
      case '--strict':
        config.strict = true;
        break;
      case '--help':
        console.log(`
Usage: tsx scripts/detect-schema-drift.ts [options]

Options:
  --input <path>           Path to mock responses JSON file
  --output <path>          Path to output Markdown report
  --fail-on-violation      Exit with code 1 if schema violations are found
  --strict                 Treat drift (extra fields) as violations
  --help                   Show this help message
`);
        process.exit(0);
    }
  }
  return config;
}

function getSeverity(status: ValidationStatus, strict: boolean): Severity {
  if (status === 'invalid_schema') return 'Critical';
  if (status === 'drift_extra_fields') return strict ? 'Critical' : 'Warning';
  return 'Info';
}

function validateResponse(item: MockResponse, strictMode: boolean): ValidationResult {
  const schema = SCHEMAS[item.flow];

  if (!schema) {
    return {
      flow: item.flow,
      timestamp: item.timestamp,
      status: 'invalid_schema', // Or separate 'missing_schema' status
      severity: 'Critical',
      details: 'Schema not defined in script configuration',
      expectedStatus: item.expectedStatus,
      match: false
    };
  }

  // 1. Standard Validation
  const standardResult = schema.safeParse(item.response);

  let status: ValidationStatus = 'valid';
  let details = '';

  if (!standardResult.success) {
    status = 'invalid_schema';
    details = standardResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  } else {
    // 2. Strict Validation (Check for extra fields)
    let strictResult = { success: true, error: { errors: [] as any[] } };

    // Only apply strict check if schema supports it (ZodObject)
    if (schema instanceof z.ZodObject) {
       // Note: strict() returns a new schema, doesn't mutate
       const strictSchema = schema.strict();
       strictResult = strictSchema.safeParse(item.response);
    }

    if (!strictResult.success) {
      status = 'drift_extra_fields';
      details = strictResult.error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
    }
  }

  const severity = getSeverity(status, strictMode);

  // Determine expectation match
  let match = false;
  if (item.expectedStatus === 'valid' && status === 'valid') match = true;
  if (item.expectedStatus === 'invalid' && status === 'invalid_schema') match = true;
  if (item.expectedStatus === 'drift' && (status === 'drift_extra_fields' || status === 'invalid_schema')) match = true;

  return {
    flow: item.flow,
    timestamp: item.timestamp,
    status,
    severity,
    details,
    expectedStatus: item.expectedStatus,
    match
  };
}

async function main() {
  const config = parseArgs();
  console.log(`Starting Schema Drift Detection...`);
  console.log(`Input: ${config.inputPath}`);
  console.log(`Output: ${config.outputPath}`);
  console.log(`Fail on Violation: ${config.failOnViolation}`);

  if (!fs.existsSync(config.inputPath)) {
    console.error(`Error: Mock responses file not found at ${config.inputPath}`);
    process.exit(1);
  }

  let mockData: MockResponse[];
  try {
    const fileContent = fs.readFileSync(config.inputPath, 'utf-8');
    mockData = JSON.parse(fileContent);
    if (!Array.isArray(mockData)) throw new Error('Root element must be an array');
  } catch (e: any) {
    console.error(`Error parsing JSON input: ${e.message}`);
    process.exit(1);
  }

  const results: ValidationResult[] = mockData.map(item => validateResponse(item, config.strict));

  generateReport(results, config.outputPath);

  // Exit logic
  const criticalErrors = results.filter(r => r.severity === 'Critical').length;

  if (config.failOnViolation && criticalErrors > 0) {
    console.error(`\n❌ Failed: ${criticalErrors} critical schema violations found.`);
    process.exit(1);
  } else {
    console.log(`\n✅ Success: Analysis complete. Report written to ${config.outputPath}`);
  }
}

function generateReport(results: ValidationResult[], outputPath: string) {
  const criticalCount = results.filter(r => r.severity === 'Critical').length;
  const warningCount = results.filter(r => r.severity === 'Warning').length;

  let report = `# Schema Drift Report

Generated on: ${new Date().toISOString()}

## Summary
| Metric | Count |
|--------|-------|
| Total Analyzed | ${results.length} |
| 🔴 Critical Violations | ${criticalCount} |
| 🟡 Warnings (Drift) | ${warningCount} |
| Unexpected Results | ${results.filter(r => !r.match).length} |

## Detailed Analysis

| Severity | Flow | Timestamp | Status | Expected | Match | Details |
|----------|------|-----------|--------|----------|-------|---------|
`;

  for (const r of results) {
    const icon = r.match ? '✅' : '❌';
    const severityIcon = r.severity === 'Critical' ? '🔴' : r.severity === 'Warning' ? '🟡' : '🟢';

    // Escape pipes in details to avoid breaking markdown table
    const safeDetails = (r.details || '-').replace(/\|/g, '\\|');

    report += `| ${severityIcon} ${r.severity} | ${r.flow} | ${r.timestamp} | ${r.status} | ${r.expectedStatus} | ${icon} | ${safeDetails} |\n`;
  }

  report += `
## Recommendations

### 1. Critical Violations (Invalid Schema)
Responses marked as **🔴 Critical** violate the defined Zod schema.
- **Action:** Fix the LLM prompt or relax the schema constraints.
- **Action:** Verify if the schema correctly matches the production code expectations.

### 2. Warnings (Drift / Extra Fields)
Responses marked as **🟡 Warning** contain extra fields not in the schema.
- **Action:** If extra fields are useful, add them to the Zod schema as optional.
- **Action:** If irrelevant, consider using \`.passthrough()\` or ignoring them.

`;

  try {
    fs.writeFileSync(outputPath, report);
    console.log(`Report generated successfully.`);
  } catch (e: any) {
    console.error(`Failed to write report: ${e.message}`);
    // Don't exit process here, let main handle exit code based on violations
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
