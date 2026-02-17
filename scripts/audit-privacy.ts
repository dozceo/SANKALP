
import * as fs from 'fs';
import * as path from 'path';

const REPORT_FILE = 'PRIVACY_COMPLIANCE_REPORT.md';
const KEYWORDS = ['email', 'phone', 'name', 'address', 'dob', 'birth', 'location', 'gender', 'ethnicity', 'race', 'password', 'uid'];
const TARGET_DIRS = ['src/lib', 'src/app/api', 'src/ml'];

interface Finding {
    file: string;
    line: number;
    content: string;
    keyword: string;
    category: 'Collection' | 'Storage' | 'Processing' | 'Other';
}

function scanFile(filePath: string, findings: Finding[]) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let category: Finding['category'] = 'Other';
    if (filePath.includes('api/')) category = 'Collection';
    else if (filePath.includes('db-helpers') || filePath.includes('firebase')) category = 'Storage';
    else if (filePath.includes('ml/')) category = 'Processing';

    lines.forEach((line, index) => {
        for (const keyword of KEYWORDS) {
            // Simple check: keyword followed by colon or assignment, or just presence
            // We want to avoid false positives like "filename", so we check for word boundaries roughly
            // or just simple inclusion but careful.
            // Let's use a regex for word boundary
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            if (regex.test(line)) {
                findings.push({
                    file: filePath,
                    line: index + 1,
                    content: line.trim().substring(0, 100), // Truncate
                    keyword,
                    category
                });
                break; // One finding per line is enough
            }
        }
    });
}

function scanDir(dir: string, findings: Finding[]) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDir(fullPath, findings);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.py')) {
            scanFile(fullPath, findings);
        }
    }
}

function generateReport(findings: Finding[]) {
    let report = `# Student Data Privacy Compliance Audit Report

## Executive Summary
This report identifies potential PII (Personally Identifiable Information) handling across the codebase to ensure compliance with GDPR/COPPA.
**Scope:** \`src/lib\`, \`src/app/api\`, \`src/ml\`.

## Findings by Category

### Data Collection (API Layer)
Files in \`src/app/api\` that handle PII.
`;

    const collection = findings.filter(f => f.category === 'Collection');
    if (collection.length === 0) report += "No direct PII handling detected (unlikely).\n";
    else {
        report += `| File | Line | Keyword | Context |\n|---|---|---|---|\n`;
        collection.slice(0, 20).forEach(f => {
            report += `| ${f.file} | ${f.line} | ${f.keyword} | \`${f.content.replace(/\|/g, '')}\` |\n`;
        });
        if (collection.length > 20) report += `| ... | ... | ... | (${collection.length - 20} more) |\n`;
    }

    report += `\n### Data Storage (Persistence Layer)
Files in \`src/lib\` (db-helpers, firebase) that persist PII.
`;
    const storage = findings.filter(f => f.category === 'Storage');
     if (storage.length === 0) report += "No direct PII storage detected.\n";
    else {
        report += `| File | Line | Keyword | Context |\n|---|---|---|---|\n`;
        storage.slice(0, 20).forEach(f => {
            report += `| ${f.file} | ${f.line} | ${f.keyword} | \`${f.content.replace(/\|/g, '')}\` |\n`;
        });
    }

    report += `\n### Data Processing (ML Layer)
Files in \`src/ml\` that process PII.
**Risk:** ML models should generally train on anonymized data.
`;
    const processing = findings.filter(f => f.category === 'Processing');
     if (processing.length === 0) report += "No PII found in ML layer (Good).\n";
    else {
        report += `| File | Line | Keyword | Context |\n|---|---|---|---|\n`;
        processing.slice(0, 20).forEach(f => {
            report += `| ${f.file} | ${f.line} | ${f.keyword} | \`${f.content.replace(/\|/g, '')}\` |\n`;
        });
    }

    report += `
## Regulatory Compliance Analysis

### GDPR (Right to be Forgotten)
- **Observation:** \`db-helpers.ts\` contains \`createStudent\` and \`getStudent\` but no visible \`deleteStudent\` function.
- **Risk:** High. Inability to delete user data upon request.

### COPPA (Children's Privacy)
- **Observation:** Email and Name are collected without visible parental consent flow in the API.
- **Risk:** High if users are under 13.

### Data Minimization
- **Observation:** The ML layer (if findings exist) processes raw student data.
- **Recommendation:** Anonymize \`studentId\` and remove \`name\`/\`email\` before passing to Python scripts.

`;

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`Report generated at ${REPORT_FILE}`);
}

async function run() {
    console.log('Starting Privacy Audit...');
    const findings: Finding[] = [];

    for (const dir of TARGET_DIRS) {
        scanDir(dir, findings);
    }

    generateReport(findings);
}

run().catch(console.error);
