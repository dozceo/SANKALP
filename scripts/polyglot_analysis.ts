
import fs from 'fs';
import path from 'path';

// --- Configuration ---
const REPORT_FILE = 'POLYGLOT_REPORT.md';
const PY_TRAINING_FILE = 'src/ml/training/generate_data.py';
const PY_INFERENCE_FILE = 'src/ml/inference/predict_mastery.py';
const TS_ML_TYPES_FILE = 'src/ml/inference/types.ts';
const TS_FEATURES_FILE = 'src/ml/features/student_features.ts';
const TS_DB_HELPERS_FILE = 'src/lib/db-helpers.ts';
const TS_ADAPTIVE_QUIZ_FILE = 'src/ai/flows/adaptive-quiz-engine.ts';

// --- Type Definitions ---

interface FieldDef {
  name: string;
  type: string; // "number", "string", "boolean", "array", "object", "any"
  description?: string;
  isOptional?: boolean;
}

interface SchemaDef {
  name: string;
  fields: FieldDef[];
  sourceFile: string;
  type: 'python' | 'typescript' | 'firestore' | 'zod';
}

interface Mismatch {
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'TYPE_MISMATCH' | 'FIELD_MISSING' | 'SEMANTIC_DRIFT' | 'NULLABILITY' | 'CASE_CONVERSION';
  description: string;
  source: string;
  target: string;
}

// --- Parsers ---

/**
 * Extract Python dictionary keys and types from generate_data.py
 */
function parsePythonTrainingData(filepath: string): SchemaDef {
  const content = fs.readFileSync(filepath, 'utf-8');
  const fields: FieldDef[] = [];

  const dictRegex = /'(\w+)':\s*([^,\n]+)/g;
  let match;

  while ((match = dictRegex.exec(content)) !== null) {
    const key = match[1];
    const valueExpr = match[2];

    let type = 'any';
    if (valueExpr.includes('round(') || valueExpr.includes('float') || valueExpr.includes('uniform') || valueExpr.includes('beta')) {
      type = 'float';
    } else if (valueExpr.includes('randint') || valueExpr.includes('int')) {
      type = 'int';
    } else if (valueExpr.includes('True') || valueExpr.includes('False') || valueExpr.includes('bool')) {
      type = 'bool';
    } else if (valueExpr.includes('"') || valueExpr.includes("'")) {
        type = 'string';
    } else if (valueExpr.includes('mastered')) {
        type = 'int';
    }

    if (!fields.find(f => f.name === key)) {
      fields.push({ name: key, type });
    }
  }

  return { name: 'PythonTrainingData', fields, sourceFile: filepath, type: 'python' };
}

/**
 * Extract TypeScript interface
 */
function parseTypescriptInterface(filepath: string, interfaceName: string): SchemaDef {
  const content = fs.readFileSync(filepath, 'utf-8');
  const fields: FieldDef[] = [];

  const interfaceRegex = new RegExp(`interface\\s+${interfaceName}\\s*{([^}]*)}`, 's');
  const match = interfaceRegex.exec(content);

  if (match) {
    const body = match[1];
    const fieldRegex = /(\w+)\??:\s*([^;]+);/g;
    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      const name = fieldMatch[1];
      const typeStr = fieldMatch[2].trim();

      let type = 'any';
      if (typeStr.includes('number')) type = 'number';
      else if (typeStr.includes('string')) type = 'string';
      else if (typeStr.includes('boolean')) type = 'boolean';
      else if (typeStr.includes('Date')) type = 'Date';

      fields.push({
        name,
        type,
        isOptional: fieldMatch[0].includes('?:')
      });
    }
  }

  return { name: interfaceName, fields, sourceFile: filepath, type: 'typescript' };
}

/**
 * Parse Zod Schema from Genkit flow
 * Heuristic: looks for `z.object({ key: z.type()... })`
 */
function parseZodSchema(filepath: string, schemaName: string): SchemaDef {
    const content = fs.readFileSync(filepath, 'utf-8');
    const fields: FieldDef[] = [];

    // Find the schema definition block
    const schemaRegex = new RegExp(`const\\s+${schemaName}\\s*=\\s*z\\.object\\({([\\s\\S]*?)}\\);`, 'm');
    const match = schemaRegex.exec(content);

    if (match) {
        const body = match[1];
        // Match key: z.type()...
        const fieldRegex = /(\w+):\s*z\.(\w+)\(/g;
        let fieldMatch;
        while ((fieldMatch = fieldRegex.exec(body)) !== null) {
            const name = fieldMatch[1];
            const zodType = fieldMatch[2];

            let type = 'any';
            if (zodType === 'string') type = 'string';
            else if (zodType === 'number') type = 'number';
            else if (zodType === 'boolean') type = 'boolean';
            else if (zodType === 'array') type = 'array';
            else if (zodType === 'object') type = 'object';
            else if (zodType === 'enum') type = 'string'; // enum is usually string

            fields.push({
                name,
                type,
                isOptional: body.includes(`${name}: z.${zodType}().optional()`) // simple check
            });
        }
    }

    return { name: schemaName, fields, sourceFile: filepath, type: 'zod' };
}

/**
 * Specific check for the variance drift issue
 */
function checkVarianceDrift(filepath: string): Mismatch[] {
  const content = fs.readFileSync(filepath, 'utf-8');
  const mismatches: Mismatch[] = [];

  if (content.includes('quiz_score_variance = Math.sqrt(variance)')) {
    mismatches.push({
      severity: 'CRITICAL',
      category: 'SEMANTIC_DRIFT',
      description: 'Potential semantic drift: TypeScript calculates standard deviation (Math.sqrt(variance)) but assigns it to a field named "quiz_score_variance". Python model likely expects variance (squared units) or was trained on a different distribution.',
      source: filepath,
      target: 'Python ML Model'
    });
  }

  return mismatches;
}

// --- Analysis Logic ---

function simulateSchemaEvolution(schemas: SchemaDef[], newFieldName: string): string {
    let result = `Simulating addition of new field \`${newFieldName}\`:\n`;

    schemas.forEach(schema => {
        const hasField = schema.fields.some(f => f.name === newFieldName);
        if (hasField) {
            result += `- ✅ **${schema.name}**: Field already exists.\n`;
        } else {
            let impact = 'Unknown';
            if (schema.type === 'python') impact = 'Would need update in training data generation and model retraining.';
            if (schema.type === 'typescript') impact = 'Would need update in interface definition.';
            if (schema.type === 'firestore') impact = 'Would need a schema migration or default value logic.';
            if (schema.type === 'zod') impact = 'Would need update in Zod schema definition.';

            result += `- ⚠️ **${schema.name}**: Missing. ${impact}\n`;
        }
    });

    return result;
}

// --- Report Generation ---

function generateReport(schemas: SchemaDef[], mismatches: Mismatch[]): string {
  let report = `# Polyglot Type Consistency Report\n\n`;
  report += `> Generated automatically by \`scripts/polyglot_analysis.ts\`\n\n`;

  // 1. Executive Summary
  report += `## 1. Executive Summary\n`;
  const criticalCount = mismatches.filter(m => m.severity === 'CRITICAL').length;
  if (criticalCount > 0) {
    report += `🔴 **CRITICAL ISSUES FOUND**: ${criticalCount} issues detected that may cause data corruption or silent failures.\n`;
  } else {
    report += `🟢 No critical issues found.\n`;
  }
  report += `\n`;

  // 2. Visual Schema Map
  report += `## 2. Visual Schema Map\n`;
  schemas.forEach(schema => {
    report += `### ${schema.name} (${schema.type})\n`;
    report += `Source: \`${schema.sourceFile}\`\n`;
    report += `| Field | Type | Notes |\n`;
    report += `|---|---|---|\n`;
    if (schema.fields.length === 0) {
        report += `| (No fields detected or parser failed) | | |\n`;
    } else {
        schema.fields.forEach(f => {
        report += `| \`${f.name}\` | \`${f.type}\` | ${f.isOptional ? 'Optional' : 'Required'} |\n`;
        });
    }
    report += `\n`;
  });

  // 3. Cross-Language Type Diff Matrix
  report += `## 3. Cross-Language Type Diff Matrix\n`;

  // Python vs TS
  report += `### Python ML vs TypeScript Features\n`;
  const pySchema = schemas.find(s => s.name === 'PythonTrainingData');
  const tsSchema = schemas.find(s => s.name === 'MasteryPredictionInput');

  if (pySchema && tsSchema) {
      report += `| Field | Python Type | TypeScript Type | Status |\n`;
      report += `|---|---|---|---|\n`;

      const allFields = new Set([...pySchema.fields.map(f => f.name), ...tsSchema.fields.map(f => f.name)]);
      allFields.forEach(field => {
          const pyField = pySchema.fields.find(f => f.name === field);
          const tsField = tsSchema.fields.find(f => f.name === field);

          let status = '✅ Match';
          let pyType = pyField ? pyField.type : 'MISSING';
          let tsType = tsField ? tsField.type : 'MISSING';

          if (!pyField) status = '❌ Missing in Python';
          else if (!tsField) status = '❌ Missing in TS';
          else if (field === 'mastered') status = 'ℹ️ Target Variable';
          else {
              const pyIsNum = ['int', 'float'].includes(pyType);
              const tsIsNum = tsType === 'number';
              if (pyIsNum && !tsIsNum) status = '⚠️ Type Mismatch';
          }

          report += `| \`${field}\` | ${pyType} | ${tsType} | ${status} |\n`;
      });
  }
  report += `\n`;

  // Firestore vs ML
  report += `### Firestore QuizResult vs ML Features\n`;
  const fsSchema = schemas.find(s => s.name === 'QuizResult');

  if (fsSchema && tsSchema) {
       report += `| Field | Firestore Type | ML Feature Type | Status |\n`;
       report += `|---|---|---|---|\n`;
       // Check if ML features can be derived from Firestore
       const mlFields = tsSchema.fields.map(f => f.name);
       mlFields.forEach(field => {
           // Heuristic mapping
           let fsField = fsSchema.fields.find(f => f.name === field);
           let status = '✅ Direct Match';

           if (!fsField) {
               if (field === 'avg_quiz_score') {
                   fsField = fsSchema.fields.find(f => f.name === 'score');
                   status = '🔄 Derived from score';
               } else if (field === 'time_spent_per_question') {
                    fsField = fsSchema.fields.find(f => f.name === 'timeSpent');
                    status = '🔄 Derived from timeSpent';
               } else {
                   status = '❌ Not in QuizResult (Needs derivation)';
               }
           }

           const fsType = fsField ? fsField.type : 'MISSING';
           const tsType = tsSchema.fields.find(f => f.name === field)?.type || 'MISSING';
           report += `| \`${field}\` | ${fsType} | ${tsType} | ${status} |\n`;
       });
  }
  report += `\n`;


  // 4. Detected Failures & Recommendations
  report += `## 4. Detected Failures & Recommendations\n\n`;

  if (mismatches.length === 0) {
    report += `No specific mismatches detected by heuristics.\n`;
  } else {
    mismatches.forEach(m => {
      const icon = m.severity === 'CRITICAL' ? '🔴' : (m.severity === 'WARNING' ? '⚠️' : 'ℹ️');
      report += `### ${icon} ${m.category}: ${m.description}\n`;
      report += `- **Source:** \`${m.source}\`\n`;
      report += `- **Target:** \`${m.target}\`\n`;
      report += `- **Impact:** Silent model degradation or runtime errors.\n\n`;
    });
  }

  // 5. Schema Evolution Impact
  report += `## 5. Schema Evolution Impact Analysis\n`;
  report += simulateSchemaEvolution(schemas, 'reading_level');
  report += `\n`;
  report += simulateSchemaEvolution(schemas, 'quiz_score_variance'); // Existing field test

  return report;
}

// --- Main Execution ---

function main() {
  console.log('Starting Polyglot Type Analysis...');

  const schemas: SchemaDef[] = [];
  const mismatches: Mismatch[] = [];

  // 1. Parse Python Data
  try {
    schemas.push(parsePythonTrainingData(PY_TRAINING_FILE));
  } catch (e) { console.error('Error parsing Python:', e); }

  // 2. Parse TypeScript Types (ML)
  try {
    schemas.push(parseTypescriptInterface(TS_ML_TYPES_FILE, 'MasteryPredictionInput'));
  } catch (e) { console.error('Error parsing TS Types:', e); }

  // 3. Parse Firestore Types
  try {
      schemas.push(parseTypescriptInterface(TS_DB_HELPERS_FILE, 'QuizResult'));
      schemas.push(parseTypescriptInterface(TS_DB_HELPERS_FILE, 'Student'));
  } catch (e) { console.error('Error parsing Firestore Types:', e); }

  // 4. Parse Zod Schemas
  try {
      schemas.push(parseZodSchema(TS_ADAPTIVE_QUIZ_FILE, 'AdaptiveQuizInputSchema'));
      schemas.push(parseZodSchema(TS_ADAPTIVE_QUIZ_FILE, 'AdaptiveQuizOutputSchema'));
  } catch (e) { console.error('Error parsing Zod Schemas:', e); }

  // 5. Checks
  try {
      mismatches.push(...checkVarianceDrift(TS_FEATURES_FILE));
  } catch (e) { console.error('Error checking drift:', e); }

  // Case Conversion Check
  const tsSchema = schemas.find(s => s.name === 'MasteryPredictionInput');
  if (tsSchema) {
      tsSchema.fields.forEach(f => {
          if (/[a-z][A-Z]/.test(f.name)) {
               mismatches.push({
                  severity: 'WARNING',
                  category: 'CASE_CONVERSION',
                  description: `Field '${f.name}' in MasteryPredictionInput is camelCase. Python likely expects snake_case.`,
                  source: TS_ML_TYPES_FILE,
                  target: 'Python ML Model'
               });
          }
      });
  }

  // Zod vs TS mismatch check (example)
  const quizOutput = schemas.find(s => s.name === 'AdaptiveQuizOutputSchema');
  if (quizOutput) {
      // Check if it matches what frontend expects (can't easily parse frontend React props without AST, but we can list fields)
  }

  // Generate Report
  const reportContent = generateReport(schemas, mismatches);
  fs.writeFileSync(REPORT_FILE, reportContent);
  console.log(`Report generated at ${REPORT_FILE}`);
}

main();
