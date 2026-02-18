
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const REPORT_PATH = path.join(process.cwd(), 'reports', 'THEME_CONSISTENCY_REPORT.md');

// Regex to find hardcoded colors
// We want to find classes like 'bg-white', 'text-black', 'text-gray-500' etc.
// And hex codes like '#fff', '#000000'
const COLOR_PATTERN = /(?:bg|text|border|ring)-(?:white|black|gray-\d+|slate-\d+|zinc-\d+|neutral-\d+|stone-\d+|red-\d+|orange-\d+|amber-\d+|yellow-\d+|lime-\d+|green-\d+|emerald-\d+|teal-\d+|cyan-\d+|sky-\d+|blue-\d+|indigo-\d+|violet-\d+|purple-\d+|fuchsia-\d+|pink-\d+|rose-\d+)|#[0-9A-Fa-f]{3,6}\b/g;

interface Finding {
    file: string;
    line: number;
    match: string;
}

function scanFile(filePath: string): Finding[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const findings: Finding[] = [];

    lines.forEach((line, index) => {
        // Skip comments roughly
        if (line.trim().startsWith('//') || line.trim().startsWith('/*')) return;

        // Reset regex state or create new one for each line to avoid lastIndex issues
        const regex = new RegExp(COLOR_PATTERN);
        let match;
        while ((match = regex.exec(line)) !== null) {
            findings.push({
                file: filePath,
                line: index + 1,
                match: match[0]
            });
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
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            findings = findings.concat(scanFile(fullPath));
        }
    }
    return findings;
}

function auditGlobals() {
    const globalsPath = path.join(SRC_DIR, 'app/globals.css');
    if (!fs.existsSync(globalsPath)) return "globals.css not found.";

    const content = fs.readFileSync(globalsPath, 'utf-8');
    const hasDark = content.includes('.dark');
    const hasVars = content.includes('--background') && content.includes('--foreground');

    if (hasDark && hasVars) {
        return "globals.css contains dark mode variables.";
    }
    return "globals.css MISSING explicit dark mode configuration.";
}

function main() {
    console.log("Starting Audit for Theme Consistency...");

    // Ensure report directory exists
    const reportDir = path.dirname(REPORT_PATH);
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    const findingList: Finding[] = [];

    // Scan recursively
    function traverse(dir: string) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                traverse(fullPath);
            } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
                findingList.push(...scanFile(fullPath));
            }
        }
    }
    traverse(SRC_DIR);

    const globalsStatus = auditGlobals();

    let report = `# Dark Mode / Theme Switching Consistency Audit\n\n`;
    report += `**Date:** ${new Date().toISOString()}\n`;
    report += `**Scope:** ${SRC_DIR}\n\n`;

    report += `## 1. Global Configuration\n`;
    report += `- Status: **${globalsStatus}**\n\n`;

    report += `## 2. Hardcoded Color Findings\n`;
    report += `Potential issues where colors are hardcoded instead of using semantic variables (e.g. \`bg-background\`, \`text-foreground\`).\n\n`;

    if (findingList.length === 0) {
        report += "No hardcoded colors found in components.\n";
    } else {
        const MAX_FINDINGS = 50;
        report += `Found ${findingList.length} potential hardcoded color usages. Showing first ${MAX_FINDINGS}:\n\n`;
        report += `| File | Line | Content |\n`;
        report += `|------|------|---------|\n`;
        findingList.slice(0, MAX_FINDINGS).forEach(f => {
            const relativePath = path.relative(process.cwd(), f.file);
            report += `| \`${relativePath}\` | ${f.line} | \`${f.match}\` |\n`;
        });
        if (findingList.length > MAX_FINDINGS) {
            report += `\n... and ${findingList.length - MAX_FINDINGS} more.\n`;
        }
    }

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`Report generated at: ${REPORT_PATH}`);
}

main();
