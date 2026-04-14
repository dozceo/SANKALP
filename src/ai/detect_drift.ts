
import fs from 'fs';
import path from 'path';
import { z } from 'genkit';
import { SyllabusOutputSchema } from './flows/syllabus-generator';
import { AdaptiveQuizOutputSchema } from './flows/adaptive-quiz-engine';
import { SmartRevisionPlannerOutputSchema } from './flows/smart-revision-planner';
import { MotivationalCounselingOutputSchema } from './flows/mindful-mentor';
import { ExplainConceptOutputSchema } from './flows/multilingual-cognitive-chatbot';

// Mock data path
const MOCK_DATA_PATH = path.join(process.cwd(), 'src', 'ai', 'sampling', 'mock_responses.json');

// Schema mapping
const SCHEMA_MAP: Record<string, z.ZodType<any>> = {
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
  expectedStatus?: string;
  description?: string;
}

function runDriftDetection() {
  console.log('🔍 Starting Schema Drift Detection...\n');

  if (!fs.existsSync(MOCK_DATA_PATH)) {
    console.error(`❌ Mock data file not found at: ${MOCK_DATA_PATH}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(MOCK_DATA_PATH, 'utf-8');
  let responses: MockResponse[] = [];
  try {
    responses = JSON.parse(rawData);
  } catch (error) {
    console.error('❌ Failed to parse mock data JSON:', error);
    process.exit(1);
  }

  let driftCount = 0;
  let totalCount = 0;

  responses.forEach((entry, index) => {
    totalCount++;
    const schema = SCHEMA_MAP[entry.flow];

    if (!schema) {
      console.warn(`⚠️ No schema found for flow: ${entry.flow} (Entry #${index + 1})`);
      return;
    }

    const result = schema.safeParse(entry.response);

    if (!result.success) {
      driftCount++;
      console.log(`\n🔴 Drift Detected in ${entry.flow} (Timestamp: ${entry.timestamp})`);
      console.log(`   Description: ${entry.description || 'No description provided'}`);

      // Format Zod errors
      const formattedErrors = result.error.format();

      // Helper to print errors recursively
      const printErrors = (errObj: any, prefix = '') => {
        if (errObj._errors && errObj._errors.length > 0) {
          errObj._errors.forEach((e: string) => {
            console.log(`   ❌ ${prefix}: ${e}`);
          });
        }
        Object.keys(errObj).forEach((key) => {
          if (key !== '_errors') {
            printErrors(errObj[key], prefix ? `${prefix}.${key}` : key);
          }
        });
      };

      printErrors(formattedErrors);
      console.log('   Payload:', JSON.stringify(entry.response, null, 2));
    } else {
      // Check for extra keys if strict mode isn't enabled (Zod strips unknown by default, so we need to check manually if we want to detect "extra fields" drift)
      // However, standard Zod schemas created with z.object() strip unknown keys by default.
      // To detect extra keys, we would need the schema to be strict().
      // But let's check if the response has keys that are not in the parsed result.

      // Note: This is a simplistic check for extra keys at the top level.
      const parsedKeys = Object.keys(result.data);
      const responseKeys = Object.keys(entry.response);
      const extraKeys = responseKeys.filter(k => !parsedKeys.includes(k));

      if (extraKeys.length > 0) {
        driftCount++;
        console.log(`\n🟠 Minor Drift (Extra Fields) in ${entry.flow} (Timestamp: ${entry.timestamp})`);
        console.log(`   Extra Keys: ${extraKeys.join(', ')}`);
        console.log('   Payload:', JSON.stringify(entry.response, null, 2));
      } else {
        console.log(`\n✅ Valid Response: ${entry.flow}`);
      }
    }
  });

  console.log('\n--------------------------------------------------');
  console.log(`📊 Summary: ${driftCount} drift incidents detected out of ${totalCount} samples.`);

  if (driftCount > 0) {
    console.log('\n💡 Recommendations:');
    console.log('   1. Update Zod schemas to match actual LLM output structures.');
    console.log('   2. Add fallback handling in UI for missing fields.');
    console.log('   3. Use "strict()" in Zod schemas if extra fields are considered errors.');
  } else {
    console.log('\n✨ No drift detected. Schemas are aligned.');
  }
}

runDriftDetection();
