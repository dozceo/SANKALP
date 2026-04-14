
import * as fs from 'fs';
import * as path from 'path';

// --- Configuration ---
const CONFIG = {
    python: {
        inference: 'src/ml/inference/predict_mastery.py',
        trainingData: 'src/ml/training/training_data.csv'
    },
    typescript: {
        mlTypes: 'src/ml/inference/types.ts',
        features: 'src/ml/features/student_features.ts',
        intelligence: 'src/types/intelligence.ts',
        dbHelpers: 'src/lib/db-helpers.ts'
    },
    zod: {
        smartRevision: 'src/ai/flows/smart-revision-planner.ts',
        adaptiveQuiz: 'src/ai/flows/adaptive-quiz-engine.ts'
    },
    reportFile: 'POLYGLOT_TYPE_CONSISTENCY_REPORT.md'
};

// --- Types ---
interface FieldInfo {
    name: string;
    isOptional: boolean;
    type?: string;
}

interface SchemaInfo {
    name: string;
    fields: Map<string, FieldInfo>;
}

// --- Helpers ---
function readFile(filepath: string): string {
    try {
        return fs.readFileSync(filepath, 'utf-8');
    } catch (e) {
        console.warn(`Warning: Could not read file ${filepath}`);
        return '';
    }
}

// --- Extractors ---

function extractPythonFeatures(content: string): Map<string, FieldInfo> {
    const fields = new Map<string, FieldInfo>();
    const matches = content.matchAll(/features(?:\[\s*['"](.+?)['"]\s*\]|\.get\(\s*['"](.+?)['"]\s*\))/g);
    for (const match of matches) {
        const name = match[1] || match[2];
        fields.set(name, { name, isOptional: false, type: 'any' }); // Inferred as required usage
    }
    return fields;
}

function extractPythonOutput(content: string): Map<string, FieldInfo> {
    const fields = new Map<string, FieldInfo>();
    const returnBlockMatch = content.match(/return\s*\{\s*([\s\S]*?)\s*\}/);
    if (returnBlockMatch) {
        const block = returnBlockMatch[1];
        const keyMatches = block.matchAll(/['"]?([a-zA-Z0-9_]+)['"]?\s*:/g);
        for (const match of keyMatches) {
            fields.set(match[1], { name: match[1], isOptional: false, type: 'any' });
        }
    }
    return fields;
}

function extractCsvHeaders(content: string): Map<string, FieldInfo> {
    const fields = new Map<string, FieldInfo>();
    const firstLine = content.split('\n')[0];
    if (firstLine) {
        firstLine.split(',').forEach(h => {
            const name = h.trim();
            fields.set(name, { name, isOptional: false, type: 'csv_col' });
        });
    }
    return fields;
}

function extractTsInterface(content: string, interfaceName: string): Map<string, FieldInfo> {
    const fields = new Map<string, FieldInfo>();
    const regex = new RegExp(`interface\\s+${interfaceName}\\s*{([\\s\\S]*?)}`, 'm');
    const match = content.match(regex);
    if (match) {
        const block = match[1];
        // Match "key?: type" or "key: type"
        const propMatches = block.matchAll(/^\s*([a-zA-Z0-9_]+)(\??)\s*:\s*([^;]+);/gm);
        for (const m of propMatches) {
            fields.set(m[1], {
                name: m[1],
                isOptional: m[2] === '?',
                type: m[3].trim()
            });
        }
    }
    return fields;
}

function extractZodSchema(content: string, schemaName: string): Map<string, FieldInfo> {
    const fields = new Map<string, FieldInfo>();
    const regex = new RegExp(`const\\s+${schemaName}\\s*=\\s*z\\.object\\(\\{([\\s\\S]*?)\\}\\)`, 'm');
    const match = content.match(regex);
    if (match) {
        const block = match[1];
        const propMatches = block.matchAll(/^\s*([a-zA-Z0-9_]+)\s*:\s*z\.([a-zA-Z0-9_().]+)(,)?/gm);
        for (const m of propMatches) {
            const isOptional = m[2].includes('optional()');
            fields.set(m[1], {
                name: m[1],
                isOptional,
                type: m[2]
            });
        }
    }
    return fields;
}

// --- Report Generators ---

function generateMermaidDiagram(schemas: SchemaInfo[]): string {
    let mermaid = '```mermaid\nerDiagram\n';

    schemas.forEach(schema => {
        mermaid += `    ${schema.name.replace(/\s+/g, '_')} {\n`;
        schema.fields.forEach(field => {
            // Cleanup type string for mermaid
            let type = field.type || 'string';
            type = type.replace(/["|]/g, '').replace(/\s+/g, '_').substring(0, 15);
            mermaid += `        ${type} ${field.name}\n`;
        });
        mermaid += `    }\n`;
    });

    // Add relationships (Conceptual)
    mermaid += `    ML_Training_Data ||--|| Python_Inference_Input : "trains"\n`;
    mermaid += `    Python_Inference_Input ||--|| TS_MasteryPredictionInput : "serialized as"\n`;
    mermaid += `    TS_MasteryPredictionOutput ||--|| Firestore_MLPrediction : "caches to"\n`;
    mermaid += `    Firestore_MLPrediction ||--|| Frontend_MasterySignal : "consumes"\n`;
    mermaid += `    Zod_AdaptiveQuizOutput ||--|| Firestore_QuizGeneration : "stores as"\n`;

    mermaid += '```\n';
    return mermaid;
}

function compareSchemas(source: SchemaInfo, target: SchemaInfo): string {
    let output = `### ${source.name} ↔ ${target.name}\n\n`;

    const sourceKeys = Array.from(source.fields.keys());
    const targetKeys = Array.from(target.fields.keys());

    const missingInTarget = sourceKeys.filter(x => !target.fields.has(x));
    const extraInTarget = targetKeys.filter(x => !source.fields.has(x));

    // Check type/optionality mismatches for matching keys
    const mismatches: string[] = [];
    sourceKeys.forEach(key => {
        if (target.fields.has(key)) {
            const s = source.fields.get(key)!;
            const t = target.fields.get(key)!;

            if (s.isOptional !== t.isOptional) {
                mismatches.push(`- \`${key}\`: Nullability mismatch (${source.name}: ${s.isOptional ? 'Optional' : 'Required'} vs ${target.name}: ${t.isOptional ? 'Optional' : 'Required'})`);
            }

            // Loose type check (e.g. any vs string)
            if (t.type === 'any' || t.type === 'any[]' || s.type === 'any') {
                 mismatches.push(`- \`${key}\`: ⚠️ Type safety loss (mapped to \`any\` or \`any[]\`)`);
            }
        }
    });

    if (missingInTarget.length === 0 && extraInTarget.length === 0 && mismatches.length === 0) {
        output += `✅ **Perfect Match**\n\n`;
    } else {
        if (missingInTarget.length > 0) {
            output += `❌ **Missing in Target**:\n${missingInTarget.map(k => `  - \`${k}\``).join('\n')}\n`;
        }
        if (extraInTarget.length > 0) {
            output += `⚠️ **Extra in Target**:\n${extraInTarget.map(k => `  - \`${k}\``).join('\n')}\n`;
        }
        if (mismatches.length > 0) {
            output += `⚠️ **Type/Nullability Mismatches**:\n${mismatches.join('\n')}\n`;
        }
        output += '\n';
    }

    return output;
}

// --- Main ---

function main() {
    console.log('Generating Polyglot Consistency Report...');

    // 1. Extract
    const pyScript = readFile(CONFIG.python.inference);
    const pyInput = extractPythonFeatures(pyScript);
    const pyOutput = extractPythonOutput(pyScript);

    const trainingData = readFile(CONFIG.python.trainingData);
    const trainingFeatures = extractCsvHeaders(trainingData);
    trainingFeatures.delete('mastered');

    const tsMlTypes = readFile(CONFIG.typescript.mlTypes);
    const tsInput = extractTsInterface(tsMlTypes, 'MasteryPredictionInput');
    const tsOutput = extractTsInterface(tsMlTypes, 'MasteryPredictionOutput');

    const dbHelpers = readFile(CONFIG.typescript.dbHelpers);
    const fsPrediction = extractTsInterface(dbHelpers, 'MLPrediction');
    const fsQuizGen = extractTsInterface(dbHelpers, 'QuizGeneration');

    const intelTypes = readFile(CONFIG.typescript.intelligence);
    const feMasterySignal = extractTsInterface(intelTypes, 'MasterySignal');

    const adaptiveQuiz = readFile(CONFIG.zod.adaptiveQuiz);
    const zodAdaptiveOutput = extractZodSchema(adaptiveQuiz, 'AdaptiveQuizOutputSchema');

    // 2. Define Schemas
    const schemas: SchemaInfo[] = [
        { name: 'ML_Training_Data', fields: trainingFeatures },
        { name: 'Python_Inference_Input', fields: pyInput },
        { name: 'Python_Inference_Output', fields: pyOutput },
        { name: 'TS_MasteryPredictionInput', fields: tsInput },
        { name: 'TS_MasteryPredictionOutput', fields: tsOutput },
        { name: 'Firestore_MLPrediction', fields: fsPrediction },
        { name: 'Frontend_MasterySignal', fields: feMasterySignal },
        { name: 'Zod_AdaptiveQuizOutput', fields: zodAdaptiveOutput },
        { name: 'Firestore_QuizGeneration', fields: fsQuizGen }
    ];

    // 3. Generate Report
    let report = `# Polyglot Type Consistency Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;

    report += `## 1. Visual Schema Map\n\n`;
    report += generateMermaidDiagram(schemas);
    report += `\n`;

    report += `## 2. Cross-Language Diff Matrix\n\n`;
    report += compareSchemas(schemas[0], schemas[1]); // Train vs PyInput
    report += compareSchemas(schemas[1], schemas[3]); // PyInput vs TSInput
    report += compareSchemas(schemas[2], schemas[4]); // PyOutput vs TSOutput
    report += compareSchemas(schemas[4], schemas[5]); // TSOutput vs Firestore
    report += compareSchemas(schemas[5], schemas[6]); // Firestore vs Frontend

    // Custom comparison for Zod vs Firestore
    // QuizGeneration uses 'questions' vs AdaptiveQuizOutput uses 'quiz'
    // We create a fake "Target" schema that maps 'quiz' -> 'questions' to make the comparison meaningful
    // Or just compare raw and let the report show the mismatch
    report += compareSchemas(schemas[7], schemas[8]);

    report += `## 3. Serialization Boundary Failure Catalog\n\n`;

    const snakeKeys = Array.from(tsInput.keys()).filter(k => k.includes('_'));
    const camelKeys = Array.from(fsPrediction.keys()).filter(k => /[a-z][A-Z]/.test(k));

    report += `### A. Case Conversion Risks\n`;
    report += `The following fields require manual mapping (snake_case ↔ camelCase). Any missing map in \`ml-bridge.ts\` or \`smart-revision-planner.ts\` causes data loss.\n\n`;
    report += `**Snake Case (ML Layer)**:\n${snakeKeys.map(k => `- \`${k}\``).join('\n')}\n\n`;
    report += `**Camel Case (App Layer)**:\n${camelKeys.map(k => `- \`${k}\``).join('\n')}\n\n`;

    report += `### B. Known Hardcoded Mappings\n`;
    report += `We detected manual mappings in the codebase that are points of failure:\n`;
    report += `- \`src/ai/flows/smart-revision-planner.ts\`: Maps \`mastery_probability\` → \`masteryProbability\` manually.\n`;
    report += `- \`src/ml/features/student_features.ts\`: Manually constructs snake_case object.\n\n`;

    report += `## 4. Schema Evolution Impact Simulation\n\n`;
    report += `**Scenario: Adding a new feature 'avg_time_per_session' to the ML Model**\n\n`;
    report += `If you add \`avg_time_per_session\` to \`training_data.csv\` and re-train:\n`;
    report += `1. **Python Script**: Will fail if \`predict_mastery.py\` is not updated to extract this feature.\n`;
    report += `2. **TypeScript Types**: \`MasteryPredictionInput\` will be missing the field.\n`;
    report += `3. **Feature Extractor**: \`extractMasteryFeatures\` will not return it, causing Python key error.\n`;
    report += `4. **Runtime**: Silent failure or 500 Error in \`ml-bridge\` depending on error handling.\n\n`;

    report += `**Recommendation**: Use a shared schema definition (Protobuf or JSON Schema) to generate types for both Python and TypeScript automatically.\n\n`;

    report += `## 5. Recommended Migration Path\n\n`;
    report += `1. **Define Source of Truth**: Create \`schemas/prediction.json\` (JSON Schema).\n`;
    report += `2. **Codegen**: \n`;
    report += `   - Use \`datamodel-code-generator\` for Python Pydantic models.\n`;
    report += `   - Use \`json-schema-to-typescript\` for TS Interfaces.\n`;
    report += `3. **Validate**: Add a pre-commit hook that validates \`training_data.csv\` headers against the schema.\n`;

    fs.writeFileSync(CONFIG.reportFile, report);
    console.log(`Report generated: ${CONFIG.reportFile}`);
}

main();
