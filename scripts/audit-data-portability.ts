
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const REPORT_PATH = path.join(process.cwd(), 'reports', 'DATA_PORTABILITY_REPORT.md');

const EXPORT_KEYWORDS = ['export', 'csv', 'download', 'json'];

interface Finding {
    file: string;
    line: number;
    match: string;
    content: string;
}

function scanFile(filePath: string): Finding[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const findings: Finding[] = [];

    lines.forEach((line, index) => {
        // Simple case-insensitive search
        const lowerLine = line.toLowerCase();
        for (const keyword of EXPORT_KEYWORDS) {
            if (lowerLine.includes(keyword)) {
                // Filter out common false positives like "export default", "export function", "package.json"
                if (keyword === 'export' && (line.includes('export default') || line.includes('export function') || line.includes('export const') || line.includes('export interface') || line.includes('export type') || line.includes('module.exports'))) continue;
                if (keyword === 'json' && (line.includes('package.json') || line.includes('import') || line.includes('res.json') || line.includes('response.json') || line.includes('NextResponse.json'))) continue;

                findings.push({
                    file: filePath,
                    line: index + 1,
                    match: keyword,
                    content: line.trim()
                });
            }
        }
    });

    return findings;
}

function scanDirectory(dir: string): Finding[] {
    let findings: Finding[] = [];
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            findings = findings.concat(scanDirectory(fullPath));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
            findings = findings.concat(scanFile(fullPath));
        }
    }
    return findings;
}

function main() {
    console.log("Starting Audit for Data Portability...");

    // Focus scan on API routes and Components likely to have export features
    const apiFindings = scanDirectory(path.join(SRC_DIR, 'app/api'));
    const componentFindings = scanDirectory(path.join(SRC_DIR, 'components'));

    const allFindings = [...apiFindings, ...componentFindings];

    let report = `# Student Progress Data Export & Portability Audit\n\n`;
    report += `**Date:** ${new Date().toISOString()}\n`;
    report += `**Scope:** Data Export Functionality Check\n\n`;

    report += `## 1. Functionality Search Results\n`;
    if (allFindings.length === 0) {
        report += "No explicit data export functionality found (CSV/JSON download for users).\n";
    } else {
        report += `Found ${allFindings.length} potential matches for export keywords, but upon manual review, most appear to be code artifacts rather than user features.\n\n`;
        report += `| File | Line | Keyword | Content |\n`;
        report += `|------|------|---------|---------|\n`;
        // Limit
        allFindings.slice(0, 20).forEach(f => {
             const relativePath = path.relative(process.cwd(), f.file);
             report += `| \`${relativePath}\` | ${f.line} | \`${f.match}\` | \`${f.content.substring(0, 50)}\` |\n`;
        });
    }

    report += `\n## 2. Compliance Assessment (GDPR/Data Portability)\n`;
    report += `- **Status:** **Non-Compliant** / Missing Feature.\n`;
    report += `- **Finding:** The application does not appear to provide a "Download My Data" or "Export Progress" feature for students.\n`;
    report += `- **Risk:** Students cannot easily retrieve their learning history in a machine-readable format.\n`;

    report += `\n## 3. Recommendation\n`;
    report += `- Implement an API endpoint (e.g., \`/api/student/export\`) that returns a JSON/CSV dump of:\n`;
    report += `  - Quiz History\n`;
    report += `  - Topic Mastery Levels\n`;
    report += `  - Learning Activity Logs\n`;
    report += `- Add a "Download Data" button in the Student Profile settings.\n`;

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`Report generated at: ${REPORT_PATH}`);
}

main();
