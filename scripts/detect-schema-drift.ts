
import './drift-env-setup'; // Must be first
import fs from 'fs';
import path from 'path';
import { z } from 'genkit';

// Import schemas
import { SyllabusOutputSchema } from '../src/ai/flows/syllabus-generator';
import { AdaptiveQuizOutputSchema } from '../src/ai/flows/adaptive-quiz-engine';
import { SmartRevisionPlannerOutputSchema } from '../src/ai/flows/smart-revision-planner';
import { MotivationalCounselingOutputSchema } from '../src/ai/flows/mindful-mentor';
import { ExplainConceptOutputSchema } from '../src/ai/flows/multilingual-cognitive-chatbot';

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

const MOCK_FILE = path.join(process.cwd(), 'src/ai/sampling/mock_responses.json');
const REPORT_FILE = path.join(process.cwd(), 'SCHEMA_DRIFT_REPORT.md');

function detectDrift(response: any, schema: z.ZodType<any>): { status: 'valid' | 'invalid' | 'drift', details: string[] } {
  const parseResult = schema.safeParse(response);

  if (!parseResult.success) {
    const issues = parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
    return { status: 'invalid', details: issues };
  }

  // Check for extra keys (drift)
  const originalKeys = getAllKeys(response);
  const parsedKeys = getAllKeys(parseResult.data);

  const extraKeys = originalKeys.filter(k => !parsedKeys.includes(k));

  if (extraKeys.length > 0) {
    return { status: 'drift', details: [`Extra keys found: ${extraKeys.join(', ')}`] };
  }

  return { status: 'valid', details: [] };
}

function getAllKeys(obj: any, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [];
  if (Array.isArray(obj)) {
    // For arrays, we don't track indices as keys for drift detection purpose unless needed
    // But if array elements are objects, we might want to check their keys.
    // Simplifying: just check top level keys for objects in array?
    // Actually, deep check is better.
    return obj.flatMap((item, index) => getAllKeys(item, `${prefix}[${index}]`));
  }

  return Object.keys(obj).flatMap(key => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return [fullKey, ...getAllKeys(obj[key], fullKey)];
  });
}

function generateRecommendations(details: string[], flow: string): string {
  if (details.length === 0) return 'None';

  const recommendations: string[] = [];

  details.forEach(detail => {
    if (detail.includes('Extra keys found')) {
      const keys = detail.replace('Extra keys found: ', '').split(', ');
      keys.forEach(k => recommendations.push(`Consider adding optional field \`${k}\` to schema if it's useful.`));
    } else if (detail.includes('Required')) {
      recommendations.push(`Mark field as optional in schema or ensure LLM always returns it.`);
    } else if (detail.includes('Expected array, received string')) {
      recommendations.push(`Update schema to allow \`z.union([z.string(), z.array(z.string())])\` or fix LLM prompt.`);
    } else if (detail.includes('Invalid enum value')) {
        recommendations.push(`Update schema enum to include the new value or constrain LLM prompt.`);
    } else {
      recommendations.push(`Investigate schema definition for: ${detail}`);
    }
  });

  return recommendations.join('\n');
}

async function main() {
  console.log('Reading mock responses...');
  if (!fs.existsSync(MOCK_FILE)) {
    console.error(`Mock file not found: ${MOCK_FILE}`);
    process.exit(1);
  }

  const mocks: MockResponse[] = JSON.parse(fs.readFileSync(MOCK_FILE, 'utf-8'));

  let reportContent = `# Schema Drift Report\n\nGenerated on: ${new Date().toISOString()}\n\n`;
  reportContent += `| Flow | Timestamp | Expected | Actual | Details | Recommendations |\n`;
  reportContent += `|---|---|---|---|---|---|\n`;

  let driftCount = 0;

  for (const mock of mocks) {
    const schema = SCHEMAS[mock.flow];
    if (!schema) {
      console.warn(`No schema found for flow: ${mock.flow}`);
      continue;
    }

    const { status, details } = detectDrift(mock.response, schema);

    // Determine if this is a "finding"
    // If status matches expectedStatus, it's good (even if it's 'drift' or 'invalid' expected).
    // But we report discrepancies AND confirmed drifts.

    const isDiscrepancy = status !== mock.expectedStatus;
    const isDriftOrInvalid = status === 'drift' || status === 'invalid';

    // We log everything for the report, but highlight discrepancies.

    const detailsStr = details.length > 0 ? `<ul><li>${details.join('</li><li>')}</li></ul>` : 'None';
    const recommendation = generateRecommendations(details, mock.flow);
    const recommendationStr = recommendation ? `<ul><li>${recommendation.split('\n').join('</li><li>')}</li></ul>` : 'None';

    reportContent += `| ${mock.flow} | ${mock.timestamp} | ${mock.expectedStatus} | **${status}** | ${detailsStr} | ${recommendationStr} |\n`;

    if (isDriftOrInvalid) driftCount++;
  }

  reportContent += `\n\n## Summary\n\nTotal responses analyzed: ${mocks.length}\nIssues/Drifts detected: ${driftCount}\n`;

  fs.writeFileSync(REPORT_FILE, reportContent);
  console.log(`Report generated at: ${REPORT_FILE}`);
}

main().catch(console.error);
