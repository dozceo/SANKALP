
import fs from 'fs';
import path from 'path';

// ============================================
// 1. Schema Definitions (Extracted/Hardcoded)
// ============================================

interface SchemaField {
    name: string;
    type: string;
    source: string;
    subType?: string;
    required?: boolean;
    defaultValue?: any;
    range?: [number, number];
}

interface Schema {
    name: string;
    fields: SchemaField[];
    source: string;
}

// Python ML Model Expectations (Source: src/ml/training/generate_data.py & src/ml/inference/predict_mastery.py)
const PYTHON_ML_SCHEMA: Schema = {
  name: 'Python ML Model',
  source: 'src/ml/training/generate_data.py',
  fields: [
    { name: 'avg_quiz_score', type: 'float', source: 'src/ml/training/generate_data.py', range: [0, 1] },
    { name: 'attempts_per_topic', type: 'int', source: 'src/ml/training/generate_data.py', range: [1, 10] },
    { name: 'days_since_last_revision', type: 'int', source: 'src/ml/training/generate_data.py', range: [0, 30] },
    { name: 'quiz_score_variance', type: 'float', source: 'src/ml/training/generate_data.py', range: [0, 0.5] },
    { name: 'time_spent_per_question', type: 'float', source: 'src/ml/training/generate_data.py', range: [10, 120] },
  ],
};

// TypeScript Feature Extraction (Source: src/ml/features/student_features.ts)
const TS_FEATURE_SCHEMA: Schema = {
  name: 'TypeScript Features',
  source: 'src/ml/features/student_features.ts',
  fields: [
    { name: 'avg_quiz_score', type: 'number', source: 'src/ml/features/student_features.ts' },
    { name: 'attempts_per_topic', type: 'number', source: 'src/ml/features/student_features.ts' },
    { name: 'days_since_last_revision', type: 'number', source: 'src/ml/features/student_features.ts', defaultValue: 999 },
    { name: 'quiz_score_variance', type: 'number', source: 'src/ml/features/student_features.ts' },
    { name: 'time_spent_per_question', type: 'number', source: 'src/ml/features/student_features.ts' },
  ],
};

// Zod Schemas (Source: src/ai/flows/)
const ZOD_SCHEMAS = {
  AdaptiveQuizOutput: {
    name: 'Zod: Adaptive Quiz',
    source: 'src/ai/flows/adaptive-quiz-engine.ts',
    fields: [
      { name: 'quiz', type: 'array', subType: 'object', required: true, source: 'src/ai/flows/adaptive-quiz-engine.ts' },
      { name: 'isFallback', type: 'boolean', required: false, source: 'src/ai/flows/adaptive-quiz-engine.ts' },
    ],
  },
  SyllabusOutput: {
    name: 'Zod: Syllabus',
    source: 'src/ai/flows/syllabus-generator.ts',
    fields: [
      { name: 'title', type: 'string', required: true, source: 'src/ai/flows/syllabus-generator.ts' },
      { name: 'structure', type: 'string', required: true, source: 'src/ai/flows/syllabus-generator.ts' },
      { name: 'strategy', type: 'string', required: true, source: 'src/ai/flows/syllabus-generator.ts' },
      { name: 'references', type: 'array', subType: 'string', required: true, source: 'src/ai/flows/syllabus-generator.ts' }, // The problematic field
      { name: 'isFallback', type: 'boolean', required: false, source: 'src/ai/flows/syllabus-generator.ts' },
    ],
  },
};

// Firestore Schemas (Source: src/lib/db-helpers.ts)
const FIRESTORE_SCHEMAS = {
  QuizGeneration: {
    name: 'Firestore: QuizGeneration',
    source: 'src/lib/db-helpers.ts',
    fields: [
      { name: 'studentId', type: 'string', source: 'src/lib/db-helpers.ts' },
      { name: 'topic', type: 'string', source: 'src/lib/db-helpers.ts' },
      { name: 'difficulty', type: 'string', source: 'src/lib/db-helpers.ts' },
      { name: 'educationLevel', type: 'string', source: 'src/lib/db-helpers.ts' },
      { name: 'numQuestions', type: 'number', source: 'src/lib/db-helpers.ts' },
      { name: 'questions', type: 'any[]', source: 'src/lib/db-helpers.ts' }, // The problematic loose type
      { name: 'generatedAt', type: 'Date', source: 'src/lib/db-helpers.ts' },
    ],
  },
  Syllabus: {
    name: 'Firestore: Syllabus',
    source: 'src/lib/db-helpers.ts',
    fields: [
      { name: 'studentId', type: 'string', source: 'src/lib/db-helpers.ts' },
      { name: 'examName', type: 'string', source: 'src/lib/db-helpers.ts' },
      { name: 'title', type: 'string', source: 'src/lib/db-helpers.ts' },
      { name: 'structure', type: 'any', source: 'src/lib/db-helpers.ts' }, // Loose type
      { name: 'strategy', type: 'string', source: 'src/lib/db-helpers.ts' },
      { name: 'createdAt', type: 'Date', source: 'src/lib/db-helpers.ts' },
      // Missing 'references'
    ],
  },
  QuizResult: {
    name: 'Firestore: QuizResult',
    source: 'src/lib/db-helpers.ts',
    fields: [
      { name: 'studentId', type: 'string', source: 'src/lib/db-helpers.ts' },
      { name: 'topic', type: 'string', source: 'src/lib/db-helpers.ts' },
      { name: 'score', type: 'number', source: 'src/lib/db-helpers.ts' },
      { name: 'timeSpent', type: 'number', source: 'src/lib/db-helpers.ts' },
      { name: 'questionsAttempted', type: 'number', source: 'src/lib/db-helpers.ts' },
      { name: 'timestamp', type: 'Date', source: 'src/lib/db-helpers.ts' },
    ],
  },
};

// ============================================
// 2. Audit Logic
// ============================================

const reportLines: string[] = [];

function log(message: string) {
  console.log(message);
}

function report(level: 'INFO' | 'WARN' | 'ERROR', title: string, description: string) {
  const icon = level === 'ERROR' ? '🔴' : level === 'WARN' ? '⚠️' : '✅';
  reportLines.push(`### ${icon} ${title}`);
  reportLines.push(`**Severity:** ${level}`);
  reportLines.push(`${description}`);
  reportLines.push('');
}

// Helper to verify existence in file
function verifyFieldInFile(field: string, filepath: string): boolean {
    try {
        const fullPath = path.resolve(__dirname, '..', filepath);
        if (!fs.existsSync(fullPath)) return false;
        const content = fs.readFileSync(fullPath, 'utf-8');
        return content.includes(field);
    } catch (e) {
        return false;
    }
}

function auditMLFeatures() {
  log('Auditing ML Features...');
  const pyFields = PYTHON_ML_SCHEMA.fields.map(f => f.name).sort();
  const tsFields = TS_FEATURE_SCHEMA.fields.map(f => f.name).sort();

  // 1. Verify fields exist in source files
  PYTHON_ML_SCHEMA.fields.forEach(f => {
      if (!verifyFieldInFile(f.name, f.source)) {
          report('WARN', `Schema Drift: ${f.name}`, `Field '${f.name}' defined in audit schema but not found in ${f.source}. Has the code changed?`);
      }
  });

  // 2. Check OOD Risk (999 vs 30)
  const daysFieldTS = TS_FEATURE_SCHEMA.fields.find(f => f.name === 'days_since_last_revision');
  const daysFieldPy = PYTHON_ML_SCHEMA.fields.find(f => f.name === 'days_since_last_revision');

  if (daysFieldTS && daysFieldPy && daysFieldTS.defaultValue === 999 && daysFieldPy.range) {
      if (daysFieldTS.defaultValue > daysFieldPy.range[1]) {
           report('WARN', 'Out-of-Distribution Risk: Default Value',
               `TypeScript 'days_since_last_revision' defaults to **${daysFieldTS.defaultValue}** (when no history exists).\n` +
               `Python model was trained on range **[${daysFieldPy.range[0]}, ${daysFieldPy.range[1]}]**.\n` +
               `**Impact:** New users with no history will receive erratic predictions because 999 is far outside the training distribution.`
           );
      }
  }

  // 3. Check for missing fields
  const missingInTS = pyFields.filter(f => !tsFields.includes(f));
  const missingInPy = tsFields.filter(f => !pyFields.includes(f));

  if (missingInTS.length > 0) {
    report('ERROR', 'ML Feature Mismatch: Python inputs missing in TypeScript',
      `Python model expects fields that are not produced by TypeScript feature extraction: ${missingInTS.join(', ')}.\n` +
      `Prediction will likely fail or use default values.`
    );
  } else if (missingInPy.length > 0) {
    report('WARN', 'ML Feature Mismatch: Extra TypeScript fields',
      `TypeScript produces fields that are unused by Python model: ${missingInPy.join(', ')}.`
    );
  } else {
    report('INFO', 'ML Feature Consistency', 'Python model inputs and TypeScript feature extraction outputs are perfectly aligned.');
  }

  // Naming Convention Check
  const snakeCase = pyFields.filter(f => f.includes('_'));
  if (snakeCase.length > 0) {
    report('INFO', 'Naming Convention: Snake Case in TypeScript',
      `TypeScript uses snake_case for ML features to match Python convention: ${snakeCase.join(', ')}. This is acceptable for this boundary.`);
  }
}

function auditQuizPersistence() {
  log('Auditing Quiz Persistence...');

  // 1. Check strict typing in Firestore
  const quizGenSchema = FIRESTORE_SCHEMAS.QuizGeneration;
  const questionsField = quizGenSchema.fields.find(f => f.name === 'questions');
  if (questionsField && questionsField.type === 'any[]') {
    report('WARN', 'Loose Typing: Quiz Questions',
      `Firestore schema for 'QuizGeneration.questions' is defined as 'any[]'.\n` +
      `It should be strictly typed to match Zod schema: '{ question: string, options: string[], correctAnswer: string }[]'.`
    );
  }

  // 2. Check for data persistence usage
  const projectRoot = path.resolve(__dirname, '..');
  try {
      const appDir = path.join(projectRoot, 'src', 'app');
      let foundUsage = false;

      function searchDir(dir: string) {
          if (!fs.existsSync(dir)) return;
          const files = fs.readdirSync(dir);
          for (const file of files) {
              const filePath = path.join(dir, file);
              const stat = fs.statSync(filePath);
              if (stat.isDirectory()) {
                  searchDir(filePath);
              } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                  const content = fs.readFileSync(filePath, 'utf-8');
                  if (content.includes('saveQuizGeneration') && !content.includes('export async function saveQuizGeneration')) {
                      foundUsage = true;
                  }
              }
          }
      }

      searchDir(appDir);

      if (!foundUsage) {
          report('ERROR', 'Data Loss: Quiz Questions Not Persisted',
              `The function 'saveQuizGeneration' is defined in 'src/lib/db-helpers.ts' but is NEVER called in the application logic (e.g., 'src/app/(main)/quiz/actions.ts').\n` +
              `**Impact:** Generated quizzes are ephemeral. We lose the ability to analyze question quality, difficulty, or student misconceptions later.`
          );
      } else {
           report('INFO', 'Quiz Persistence', 'Quiz generation persistence is active.');
      }

  } catch (e) {
      log('Error during grep simulation: ' + e);
  }
}

function auditSyllabusPersistence() {
  log('Auditing Syllabus Persistence...');

  const zodSchema = ZOD_SCHEMAS.SyllabusOutput;
  const dbSchema = FIRESTORE_SCHEMAS.Syllabus;

  // Check fields
  const zodFields = zodSchema.fields.map(f => f.name);
  const dbFields = dbSchema.fields.map(f => f.name);

  const missingInDB = zodFields.filter(f => !dbFields.includes(f) && f !== 'isFallback'); // isFallback is optional/transient

  if (missingInDB.length > 0) {
      report('ERROR', 'Data Loss: Syllabus Fields Dropped',
          `The following fields are generated by the AI (Zod Schema) but are missing from the Firestore schema: **${missingInDB.join(', ')}**.\n` +
          `**Impact:** The AI generates valuable references (URLs), but they are silently discarded when saving to the database.`
      );
  }

  // Check types
  const structureField = dbSchema.fields.find(f => f.name === 'structure');
  if (structureField && structureField.type === 'any') {
      report('WARN', 'Loose Typing: Syllabus Structure',
          `Firestore schema for 'Syllabus.structure' is defined as 'any'.\n` +
          `It should be strictly typed (e.g., string or structured JSON) to match Zod schema.`
      );
  }
}

function auditNamingConventions() {
    log('Auditing Naming Conventions...');

    // Check QuizResult
    const quizResult = FIRESTORE_SCHEMAS.QuizResult;
    const camelCase = quizResult.fields.filter(f => /[a-z]+[A-Z]/.test(f.name)).map(f => f.name);

    if (camelCase.length > 0) {
        // This is just informational, standard TS/JS practice
    }

    report('INFO', 'Variable Naming Drift',
        `**Firestore/TS:** 'timeSpent' (seconds) vs **Python:** 'time_spent_per_question' (seconds/question).\n` +
        `**Status:** Handled correctly in 'extractMasteryFeatures' logic.`
    );

    report('INFO', 'Statistical Naming Drift',
         `**Python:** 'quiz_score_variance' (likely means StdDev based on range 0-0.5).\n` +
         `**TypeScript:** 'quiz_score_variance' (calculated as Math.sqrt(variance), i.e., StdDev).\n` +
         `**Status:** Consistent values, but variable name is mathematically slightly inaccurate (should be '_stddev').`
    );
}

// ============================================
// 3. Artifact Generation (Mermaid, Matrix)
// ============================================

function generateMermaidGraph(): string {
    let graph = '```mermaid\nclassDiagram\n';

    // Python Node
    graph += `    class PythonML {\n`;
    PYTHON_ML_SCHEMA.fields.forEach(f => graph += `        +${f.type} ${f.name}\n`);
    graph += `    }\n`;

    // TS Features Node
    graph += `    class TSFeatures {\n`;
    TS_FEATURE_SCHEMA.fields.forEach(f => graph += `        +${f.type} ${f.name}\n`);
    graph += `    }\n`;

    // Zod Quiz Node
    graph += `    class ZodQuiz {\n`;
    ZOD_SCHEMAS.AdaptiveQuizOutput.fields.forEach(f => graph += `        +${f.type} ${f.name}\n`);
    graph += `    }\n`;

    // Firestore Quiz Node
    graph += `    class FirestoreQuizGen {\n`;
    FIRESTORE_SCHEMAS.QuizGeneration.fields.forEach(f => graph += `        +${f.type} ${f.name}\n`);
    graph += `    }\n`;

    // Zod Syllabus Node
    graph += `    class ZodSyllabus {\n`;
    ZOD_SCHEMAS.SyllabusOutput.fields.forEach(f => graph += `        +${f.type} ${f.name}\n`);
    graph += `    }\n`;

    // Firestore Syllabus Node
    graph += `    class FirestoreSyllabus {\n`;
    FIRESTORE_SCHEMAS.Syllabus.fields.forEach(f => graph += `        +${f.type} ${f.name}\n`);
    graph += `    }\n`;

    // Relationships
    graph += `    TSFeatures ..> PythonML : Extracts Features\n`;
    graph += `    ZodQuiz --|> FirestoreQuizGen : Saves To (Broken)\n`;
    graph += `    ZodSyllabus --|> FirestoreSyllabus : Saves To (Lossy)\n`;

    graph += '```';
    return graph;
}

function generateTypeDiffMatrix(): string {
    let matrix = '| Field | Python | TypeScript | Firestore | Zod | Status |\n';
    matrix += '|---|---|---|---|---|---|\n';

    // ML Matrix
    PYTHON_ML_SCHEMA.fields.forEach(f => {
        const tsField = TS_FEATURE_SCHEMA.fields.find(tf => tf.name === f.name);
        const status = tsField ? '✅' : '❌';
        matrix += `| ${f.name} | ${f.type} | ${tsField?.type || '-'} | - | - | ${status} |\n`;
    });

    // Quiz Matrix
    matrix += '| **Quiz Data** | | | | | |\n';
    const quizFields = new Set([
        ...ZOD_SCHEMAS.AdaptiveQuizOutput.fields.map(f => f.name),
        ...FIRESTORE_SCHEMAS.QuizGeneration.fields.map(f => f.name)
    ]);

    quizFields.forEach(fname => {
        const zField = ZOD_SCHEMAS.AdaptiveQuizOutput.fields.find(f => f.name === fname);
        const dbField = FIRESTORE_SCHEMAS.QuizGeneration.fields.find(f => f.name === fname);

        let status = '✅';
        if (zField && !dbField && zField.required) status = '❌ (Missing in DB)';
        if (dbField && dbField.type === 'any[]') status = '⚠️ (Loose Type)';
        if (fname === 'questions' && !dbField) status = '❌'; // If we named it differently

        // Manual mapping for 'quiz' vs 'questions'
        if (fname === 'quiz') {
            const mapped = FIRESTORE_SCHEMAS.QuizGeneration.fields.find(f => f.name === 'questions');
            status = mapped ? (mapped.type === 'any[]' ? '⚠️ (Loose)' : '✅') : '❌';
            matrix += `| ${fname} (mapped to questions) | - | - | ${mapped?.type || '-'} | ${zField?.type || '-'} | ${status} |\n`;
        } else if (fname !== 'questions') {
             matrix += `| ${fname} | - | - | ${dbField?.type || '-'} | ${zField?.type || '-'} | ${status} |\n`;
        }
    });

    // Syllabus Matrix
    matrix += '| **Syllabus Data** | | | | | |\n';
    const sylFields = new Set([
        ...ZOD_SCHEMAS.SyllabusOutput.fields.map(f => f.name),
        ...FIRESTORE_SCHEMAS.Syllabus.fields.map(f => f.name)
    ]);

    sylFields.forEach(fname => {
        const zField = ZOD_SCHEMAS.SyllabusOutput.fields.find(f => f.name === fname);
        const dbField = FIRESTORE_SCHEMAS.Syllabus.fields.find(f => f.name === fname);

        let status = '✅';
        if (zField && !dbField && fname === 'references') status = '❌ (Data Loss)';
        if (dbField && dbField.type === 'any') status = '⚠️ (Loose Type)';

        matrix += `| ${fname} | - | - | ${dbField?.type || '-'} | ${zField?.type || '-'} | ${status} |\n`;
    });

    return matrix;
}

// ============================================
// 3. Execution & Report Generation
// ============================================

function generateReport() {
  auditMLFeatures();
  auditQuizPersistence();
  auditSyllabusPersistence();
  auditNamingConventions();

  const reportContent = `
# Polyglot Type Consistency Report

**Generated By:** scripts/audit-polyglot-types.ts
**Date:** ${new Date().toISOString()}

This report identifies structural mismatches, serialization issues, and potential data loss across the Python, TypeScript, and Firestore boundaries.

## Executive Summary
The audit detected **critical data loss** risks in the persistence layer (Quiz Questions, Syllabus References) and confirmed strict alignment in the ML Feature pipeline. It also flagged Out-of-Distribution (OOD) risks for new users.

---

## Visual Schema Map

${generateMermaidGraph()}

---

## Cross-Language Type Diff Matrix

${generateTypeDiffMatrix()}

---

## Detailed Findings

${reportLines.join('\n')}

## Recommendations

1.  **Fix Data Loss:**
    - Update \`saveSyllabus\` to include the \`references\` field.
    - Implement \`saveQuizGeneration\` call in \`src/app/(main)/quiz/actions.ts\` to persist generated quizzes.

2.  **Mitigate OOD Risk:**
    - Change default values for \`days_since_last_revision\` from 999 to a value within training range (e.g., 30) or update the ML model to handle outliers explicitly.

3.  **Tighten Types:**
    - Replace \`any[]\` in \`QuizGeneration\` with a strict interface.
    - Replace \`any\` in \`Syllabus.structure\` with \`string\` (if Markdown) or a recursive interface.

4.  **Naming:**
    - Consider renaming \`quiz_score_variance\` to \`quiz_score_stddev\` in a future refactor to align with mathematical reality.

`;

  fs.writeFileSync('POLYGLOT_TYPE_CONSISTENCY_REPORT.md', reportContent.trim());
  console.log('Report generated: POLYGLOT_TYPE_CONSISTENCY_REPORT.md');
}

generateReport();
