
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const REPORT_PATH = path.join(process.cwd(), 'reports', 'NOTIFICATION_COPY_REPORT.md');

interface ToastCall {
    file: string;
    line: number;
    title?: string;
    description?: string;
    variant?: string;
}

function extractToasts(filePath: string): ToastCall[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const toasts: ToastCall[] = [];

    // Regex to find toast({ ... }) blocks
    // This is a best-effort regex. It captures the content inside toast({...})
    // It assumes balanced braces roughly or simple structure.
    const toastRegex = /toast\s*\(\s*\{([\s\S]*?)\}\s*\)/g;

    let match;
    while ((match = toastRegex.exec(content)) !== null) {
        const body = match[1];
        const line = content.substring(0, match.index).split('\n').length;

        const titleMatch = /title:\s*(?:["'](.+?)["']|`(.+?)`)/.exec(body);
        const descMatch = /description:\s*(?:["'](.+?)["']|`(.+?)`)/.exec(body);
        const variantMatch = /variant:\s*(?:["'](.+?)["'])/.exec(body);

        toasts.push({
            file: filePath,
            line,
            title: titleMatch ? (titleMatch[1] || titleMatch[2]) : undefined,
            description: descMatch ? (descMatch[1] || descMatch[2]) : undefined,
            variant: variantMatch ? variantMatch[1] : 'default'
        });
    }

    return toasts;
}

function scanDirectory(dir: string): ToastCall[] {
    let findings: ToastCall[] = [];
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            findings = findings.concat(scanDirectory(fullPath));
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.ts')) {
            findings = findings.concat(extractToasts(fullPath));
        }
    }
    return findings;
}

function analyzeTone(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('error') || lower.includes('failed') || lower.includes('wrong')) return 'Negative/Error';
    if (lower.includes('success') || lower.includes('completed') || lower.includes('saved')) return 'Positive/Success';
    if (lower.includes('warning') || lower.includes('attention')) return 'Urgent/Warning';
    return 'Neutral/Info';
}

function main() {
    console.log("Starting Audit for Notification Copy...");
    const findings = scanDirectory(SRC_DIR);

    let report = `# Notification & Alert Copy Effectiveness Audit\n\n`;
    report += `**Date:** ${new Date().toISOString()}\n`;
    report += `**Scope:** ${SRC_DIR}\n\n`;

    report += `## 1. Notification Inventory\n`;
    report += `Found ${findings.length} toast notification calls.\n\n`;

    report += `| File | Variant | Title | Description | Tone Analysis |\n`;
    report += `|------|---------|-------|-------------|---------------|\n`;

    findings.forEach(f => {
        const relativePath = path.relative(process.cwd(), f.file);
        const title = f.title || '(Dynamic/No Title)';
        const desc = f.description || '(Dynamic/No Description)';
        const fullText = `${title} ${desc}`;
        const tone = analyzeTone(fullText);

        report += `| \`${relativePath}\` | \`${f.variant}\` | ${title} | ${desc} | ${tone} |\n`;
    });

    report += `\n## 2. Copy Analysis Recommendations\n`;
    report += `- **Clarity:** Ensure "Error" messages explain *why* something failed.\n`;
    report += `- **Actionability:** Success messages should confirm the action taken.\n`;
    report += `- **Urgency:** Use 'destructive' variant only for critical errors.\n`;

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`Report generated at: ${REPORT_PATH}`);
}

main();
