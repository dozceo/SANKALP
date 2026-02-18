
import fs from 'fs';
import path from 'path';

const FEATURES_FILE = 'src/ml/features/student_features.ts';
const TRAINING_DATA_FILE = 'src/ml/training/training_data.csv';
const OUTPUT_FILE = 'SCHEMA_MIGRATION_RISK_MATRIX.md';

function getMLFeatures(): string[] {
    if (!fs.existsSync(TRAINING_DATA_FILE)) {
        console.warn("Training data file not found. Using default ML features.");
        return ['avg_quiz_score', 'attempts_per_topic', 'days_since_last_revision', 'quiz_score_variance', 'time_spent_per_question', 'mastered'];
    }
    const content = fs.readFileSync(TRAINING_DATA_FILE, 'utf-8');
    const firstLine = content.split('\n')[0];
    return firstLine.split(',').map(s => s.trim());
}

function analyzeDependencies(): { schemaFields: string[], usedFields: string[] } {
    const content = fs.readFileSync(FEATURES_FILE, 'utf-8');

    // Extract StudentHistory interface fields
    // This is a naive regex approach.
    const interfaceRegex = /interface StudentHistory \{([^}]+)\}/s;
    const match = interfaceRegex.exec(content);

    let schemaFields: string[] = [];
    if (match) {
        const body = match[1];
        const lines = body.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
        schemaFields = lines.map(l => l.split(':')[0].replace('?', '').trim());
    }

    // Also look for RawQuizResult as it's nested
    const quizResultRegex = /interface RawQuizResult \{([^}]+)\}/s;
    const matchQR = quizResultRegex.exec(content);
    let quizFields: string[] = [];
    if (matchQR) {
        const body = matchQR[1];
        const lines = body.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
        quizFields = lines.map(l => l.split(':')[0].replace('?', '').trim());
    }

    // Combine fields for analysis (e.g. "quizResults", "score", "timestamp")
    const allFields = [...schemaFields, ...quizFields];

    // Check usage in the file
    // We look for .fieldName usage
    const usedFields: string[] = [];
    allFields.forEach(field => {
        const usageRegex = new RegExp(`\\.${field}\\b`, 'g');
        if (usageRegex.test(content)) {
            usedFields.push(field);
        }
    });

    return { schemaFields: allFields, usedFields };
}

function main() {
    const mlFeatures = getMLFeatures();
    const { schemaFields, usedFields } = analyzeDependencies();

    let report = `# Database Schema Migration Risk Analysis\n\n`;
    report += `**Date:** ${new Date().toISOString().split('T')[0]}\n`;
    report += `**Scope:** Database Integration Layer vs ML Feature Extraction\n\n`;

    report += `## ML Model Requirements\n`;
    report += `The following features are required by the \`mastery_model.pkl\`:\n`;
    mlFeatures.forEach(f => report += `- \`${f}\`\n`);
    report += `\n`;

    report += `## Schema Risk Matrix\n`;
    report += `Analysis of \`StudentHistory\` and \`RawQuizResult\` interfaces in \`${FEATURES_FILE}\`.\n\n`;
    report += `| Field Name | Usage Status | Migration Risk | Impact |\n`;
    report += `|---|---|---|---|\n`;

    schemaFields.forEach(field => {
        const isUsed = usedFields.includes(field);
        const risk = isUsed ? "🔴 CRITICAL" : "🟢 LOW";
        const impact = isUsed ? "Breaks ML Feature Extraction" : "Safe to modify/remove";

        report += `| \`${field}\` | ${isUsed ? "**USED**" : "Unused"} | ${risk} | ${impact} |\n`;
    });

    report += `\n## Recommendations\n`;
    report += `- **Do NOT rename or remove** fields marked as **CRITICAL** without updating \`src/ml/features/student_features.ts\`.\n`;
    report += `- Ensure any database migration (e.g., to Firestore) populates these fields exactly as typed.\n`;
    report += `- \`quizResults\` is a nested array; deep migration strategies are required.\n`;

    fs.writeFileSync(OUTPUT_FILE, report);
    console.log(`Report generated at ${OUTPUT_FILE}`);
}

main();
