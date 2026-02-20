
import fs from 'fs';
import path from 'path';

const API_DIR = path.join(process.cwd(), 'src/app/api');
const REPORT_PATH = path.join(process.cwd(), 'reports', 'DATA_PORTABILITY_REPORT.md');

let exportEndpoints: string[] = [];
let potentialExportEndpoints: string[] = [];

function scanApiRoute(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(process.cwd(), filePath);

    // Check for explicit export naming
    if (relativePath.includes('export') || relativePath.includes('download')) {
        exportEndpoints.push(relativePath);
    } else {
        // Check content for data dump logic
        if (content.includes('userData') && (content.includes('JSON.stringify') || content.includes('csv'))) {
            // Heuristic: likely returning user data
            if (!content.includes('limit(')) { // Not a paginated list
                potentialExportEndpoints.push(relativePath);
            }
        }
    }
}

function walkDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (file === 'route.ts' || file === 'page.tsx') { // Check pages too just in case
            scanApiRoute(fullPath);
        }
    }
}

function generateReport() {
    let report = `# Student Progress Data Export & Portability Audit\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;

    report += `## Executive Summary\n`;
    report += `This audit evaluates the system's compliance with data portability requirements (e.g., GDPR Article 20) by checking for functionality allowing students to export their data.\n\n`;

    if (exportEndpoints.length === 0) {
        report += `## ❌ No Dedicated Export Endpoints Found\n`;
        report += `The audit did not detect any API routes or pages explicitly named for data export (e.g., matching 'export' or 'download').\n\n`;

        if (potentialExportEndpoints.length > 0) {
            report += `### Potential Candidates (Manual Verification Required)\n`;
            report += `The following files might contain data retrieval logic that could be adapted for export:\n`;
            potentialExportEndpoints.forEach(ep => {
                report += `- \`${ep}\`\n`;
            });
            report += `\n`;
        }

        report += `## Recommendations\n`;
        report += `1. **Implement Data Export:** Create a dedicated API endpoint (e.g., \`/api/user/export\`) that aggregates all student data (quizzes, syllabus, mastery scores).\n`;
        report += `2. **Format Support:** Provide data in a machine-readable format (JSON) and potentially a human-readable format (CSV/PDF).\n`;
        report += `3. **Privacy:** Ensure the export only contains data belonging to the requesting user.\n`;

    } else {
        report += `## ✅ Export Functionality Detected\n`;
        report += `The following endpoints appear to handle data export:\n`;
        exportEndpoints.forEach(ep => {
            report += `- \`${ep}\`\n`;
        });
        report += `\n*Note: Manual verification is recommended to ensure completeness of the exported data.*\n`;
    }

    // Ensure directory exists
    const reportDir = path.dirname(REPORT_PATH);
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`Report generated at: ${REPORT_PATH}`);
}

// Run audit
try {
    console.log('Starting Data Portability Audit...');
    walkDir(API_DIR);
    generateReport();
    console.log('Audit complete.');
} catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
}
