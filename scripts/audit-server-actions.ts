
import fs from 'fs';
import path from 'path';

const AUTH_CHECKS = [
    'auth(',
    'currentUser(',
    'getSession(',
    'verifySession(',
    'checkAuth(',
    'requireAuth(',
    'protect(',
    'getUser(',
    'validateUser('
];

interface ActionFinding {
    file: string;
    functionName: string;
    hasAuth: boolean;
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    line: number;
}

function scanFileForActions(filePath: string): ActionFinding[] {
    const findings: ActionFinding[] = [];
    try {
        const content = fs.readFileSync(filePath, 'utf-8');

        // Simple check for "use server" directive
        if (!content.includes('"use server"') && !content.includes("'use server'")) {
            return [];
        }

        const lines = content.split('\n');

        // Regex to find exported async functions
        // export async function myAction(...)
        // export const myAction = async (...)
        const funcRegex = /export\s+(async\s+function\s+([a-zA-Z0-9_]+)|const\s+([a-zA-Z0-9_]+)\s*=\s*async)/g;

        let match;
        while ((match = funcRegex.exec(content)) !== null) {
            const functionName = match[2] || match[3];
            const startIndex = match.index;

            // Find the function body (brace matching is hard with regex, so we use a heuristic)
            // We search for the next "{" and then scan forward a bit (e.g., first 500 chars of body)
            // to look for auth checks. Ideally we'd use an AST, but this is a heuristic scan.

            const bodyStart = content.indexOf('{', startIndex);
            if (bodyStart === -1) continue;

            const bodySnippet = content.substring(bodyStart, bodyStart + 1000); // Check first 1000 chars

            const hasAuth = AUTH_CHECKS.some(check => bodySnippet.includes(check));

            // Determine line number
            const line = content.substring(0, startIndex).split('\n').length;

            findings.push({
                file: filePath,
                functionName,
                hasAuth,
                riskLevel: hasAuth ? 'LOW' : 'HIGH',
                line
            });
        }

    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
    }
    return findings;
}

function walkDir(dir: string, fileList: string[] = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (['node_modules', '.git', '.next'].includes(file)) return;

        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath, fileList);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

function main() {
    console.log('Starting Server Action Audit...');
    const srcDir = 'src/app';
    if (!fs.existsSync(srcDir)) {
        console.error('src/app directory not found.');
        return;
    }

    const files = walkDir(srcDir);
    const findings: ActionFinding[] = [];

    files.forEach(file => {
        findings.push(...scanFileForActions(file));
    });

    // Generate Report
    const reportPath = 'SERVER_ACTION_SECURITY_MATRIX.md';
    let reportContent = '# Server Action Security Matrix\n\n';
    reportContent += `**Date:** ${new Date().toISOString()}\n\n`;
    reportContent += `**Total Actions Scanned:** ${findings.length}\n\n`;

    const highRisk = findings.filter(f => f.riskLevel === 'HIGH');
    reportContent += `**High Risk Actions (Missing Auth):** ${highRisk.length}\n\n`;

    reportContent += '| File | Function | Risk Level | Auth Detected |\n';
    reportContent += '|---|---|---|---|\n';

    findings.sort((a, b) => (a.riskLevel === 'HIGH' ? -1 : 1)).forEach(f => {
        const riskIcon = f.riskLevel === 'HIGH' ? '🔴' : '🟢';
        reportContent += `| \`${f.file}\` | \`${f.functionName}\` | ${riskIcon} ${f.riskLevel} | ${f.hasAuth ? 'Yes' : 'No'} |\n`;
    });

    if (highRisk.length > 0) {
        reportContent += '\n\n## Recommendations\n';
        reportContent += '1. **Add Authentication:** Ensure all High Risk actions implement `auth()` or similar checks at the beginning of the function.\n';
        reportContent += '2. **Validate Input:** Ensure all inputs are validated using Zod or similar libraries.\n';
        reportContent += '3. **CSRF Protection:** Next.js Server Actions have built-in CSRF protection, but ensure sensitive actions are not exposed via GET requests (which they shouldn\'t be by default).\n';
    }

    fs.writeFileSync(reportPath, reportContent);
    console.log(`Report generated at ${reportPath}`);
}

main();
