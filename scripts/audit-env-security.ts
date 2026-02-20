
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import path from 'path';

interface EnvUsage {
    file: string;
    line: number;
    variable: string;
    hasFallback: boolean;
    isClientFile: boolean;
    isNextPublic: boolean;
    isSensitive: boolean;
    context: string;
}

function scanDirectory(dir: string, fileList: string[] = []) {
    const files = readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = statSync(filePath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                scanDirectory(filePath, fileList);
            }
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                fileList.push(filePath);
            }
        }
    }
    return fileList;
}

function analyzeFile(filePath: string): EnvUsage[] {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const usages: EnvUsage[] = [];

    const isClientFile = content.includes("'use client'") || content.includes('"use client"');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const regex = /process\.env\.([A-Z_0-9]+)/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
            const variable = match[1];

            // Check for fallback
            // Simple heuristic: look for || or ?? after the variable match on the same line
            // This is not perfect (could be multiline) but good for a static audit
            const afterMatch = line.substring(match.index + match[0].length);
            const hasFallback = afterMatch.trim().startsWith('||') || afterMatch.trim().startsWith('??');

            const isNextPublic = variable.startsWith('NEXT_PUBLIC_');
            const isSensitive = /SECRET|KEY|PASSWORD|TOKEN|CREDENTIALS/i.test(variable);

            usages.push({
                file: filePath,
                line: i + 1,
                variable,
                hasFallback,
                isClientFile,
                isNextPublic,
                isSensitive,
                context: line.trim()
            });
        }
    }
    return usages;
}

function runAudit() {
    console.log("Starting Environment Variable Security Audit...");
    const srcDir = path.join(process.cwd(), 'src');
    const files = scanDirectory(srcDir);
    let allUsages: EnvUsage[] = [];

    for (const file of files) {
        allUsages = allUsages.concat(analyzeFile(file));
    }

    const clientSideLeaks = allUsages.filter(u => u.isClientFile && !u.isNextPublic);
    const missingFallbacks = allUsages.filter(u => !u.hasFallback);
    const sensitiveExposures = allUsages.filter(u => u.isSensitive && u.isClientFile);

    let reportContent = "# Environment Variable Security Report\n\n";
    reportContent += `**Date:** ${new Date().toISOString()}\n`;
    reportContent += `**Files Scanned:** ${files.length}\n`;
    reportContent += `**Total Usages:** ${allUsages.length}\n\n`;

    reportContent += "## 🚨 Client-Side Leaks (Non-Public Vars in Client Components)\n\n";
    if (clientSideLeaks.length === 0) {
        reportContent += "No client-side leaks detected.\n";
    } else {
        reportContent += "| File | Line | Variable | Context |\n";
        reportContent += "|---|---|---|---|\n";
        clientSideLeaks.forEach(u => {
            reportContent += `| \`${path.relative(process.cwd(), u.file)}\` | ${u.line} | \`${u.variable}\` | \`${u.context.substring(0, 50)}...\` |\n`;
        });
    }

    reportContent += "\n## ⚠️ Missing Fallbacks\n\n";
    reportContent += "Variables accessed without a default value (e.g., `|| 'default'`). This can cause runtime crashes if the env var is missing.\n\n";
    if (missingFallbacks.length === 0) {
        reportContent += "All usages have fallbacks.\n";
    } else {
        reportContent += "| File | Line | Variable | Context |\n";
        reportContent += "|---|---|---|---|\n";
        missingFallbacks.slice(0, 50).forEach(u => { // Limit to 50 to avoid huge report
            reportContent += `| \`${path.relative(process.cwd(), u.file)}\` | ${u.line} | \`${u.variable}\` | \`${u.context.substring(0, 50)}...\` |\n`;
        });
        if (missingFallbacks.length > 50) {
            reportContent += `\n... and ${missingFallbacks.length - 50} more.\n`;
        }
    }

    reportContent += "\n## 🔒 Sensitive Variable Analysis\n\n";
    if (sensitiveExposures.length > 0) {
        reportContent += "**CRITICAL: Sensitive variables found in client-side code!**\n\n";
         reportContent += "| File | Line | Variable |\n";
        reportContent += "|---|---|---|\n";
        sensitiveExposures.forEach(u => {
            reportContent += `| \`${path.relative(process.cwd(), u.file)}\` | ${u.line} | \`${u.variable}\` |\n`;
        });
    } else {
        reportContent += "No sensitive keywords (KEY, SECRET, PASSWORD) found in client-side code.\n";
    }

    const reportPath = path.join(process.cwd(), 'reports', 'ENVIRONMENT_SECURITY_REPORT.md');
    writeFileSync(reportPath, reportContent);
    console.log(`Report generated at ${reportPath}`);
}

runAudit();
