
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const REPORT_PATH = path.join(process.cwd(), 'reports', 'NOTIFICATION_COPY_REPORT.md');

interface NotificationFinding {
    file: string;
    line: number;
    type: 'TOAST' | 'ALERT';
    title?: string;
    description?: string;
    message?: string; // fallback
}

const findings: NotificationFinding[] = [];

// Regex to capture toast calls
// matches: toast({ ... })
// naive capture of content inside braces
const TOAST_REGEX = /toast\s*\(\s*{([^}]+)}\s*\)/g;
// Regex for Alert components
// matches: <Alert>...</Alert> or <AlertTitle>...</AlertTitle>
// This is harder to regex reliably for content, so we'll look for specific props or children
const ALERT_REGEX = /<AlertTitle>([^<]+)<\/AlertTitle>/g;
const ALERT_DESC_REGEX = /<AlertDescription>([^<]+)<\/AlertDescription>/g;

function cleanString(str: string): string {
    return str.replace(/['"`]/g, '').trim();
}

function scanFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Toast detection
    let match;
    // reset regex index just in case
    TOAST_REGEX.lastIndex = 0;
    while ((match = TOAST_REGEX.exec(content)) !== null) {
        const body = match[1];
        const titleMatch = /title:\s*(?:['"`](.*?)['"`]|(.*?)(,|$))/.exec(body);
        const descMatch = /description:\s*(?:['"`](.*?)['"`]|(.*?)(,|$))/.exec(body);

        let title = titleMatch ? (titleMatch[1] || titleMatch[2]) : undefined;
        let description = descMatch ? (descMatch[1] || descMatch[2]) : undefined;

        if (title) title = cleanString(title);
        if (description) description = cleanString(description);

        // Find line number
        const index = match.index;
        const lineNum = content.substring(0, index).split('\n').length;

        findings.push({
            file: filePath,
            line: lineNum,
            type: 'TOAST',
            title,
            description
        });
    }

    // Alert detection (simple line-based)
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        let alertTitleMatch = /<AlertTitle>([^<]+)<\/AlertTitle>/.exec(line);
        if (alertTitleMatch) {
             findings.push({
                file: filePath,
                line: lineNum,
                type: 'ALERT',
                title: alertTitleMatch[1].trim()
            });
        }

        let alertDescMatch = /<AlertDescription>([^<]+)<\/AlertDescription>/.exec(line);
        if (alertDescMatch) {
             // Try to associate with previous alert title if close, otherwise new entry
             // For simplicity, just log it.
             findings.push({
                file: filePath,
                line: lineNum,
                type: 'ALERT',
                description: alertDescMatch[1].trim()
            });
        }
    });
}

function walkDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (/\.(tsx|ts|js|jsx)$/.test(file)) {
            scanFile(fullPath);
        }
    }
}

function analyzeCopy(text?: string): string {
    if (!text) return '';
    const checks = [];
    if (text.length > 60) checks.push('⚠️ Long (>60 chars)');
    if (text.endsWith('.')) checks.push('ℹ️ Ends with period');
    if (/!$/.test(text)) checks.push('ℹ️ Exclamation used');
    if (/Error|Fail|Wrong/.test(text)) checks.push('Negative sentiment');
    if (/Success|Great|Good/.test(text)) checks.push('Positive sentiment');
    return checks.join(', ');
}

function generateReport() {
    let report = `# Notification & Alert Copy Effectiveness Audit\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;

    report += `## Executive Summary\n`;
    report += `This audit lists all detected user-facing notification messages (Toasts and Alerts) to facilitate a review of tone, clarity, and consistency.\n\n`;

    report += `## Findings (${findings.length})\n\n`;

    if (findings.length === 0) {
        report += `No explicit toast or alert messages detected via static analysis.\n`;
    } else {
        report += `| Type | File | Copy (Title / Description) | Analysis |\n`;
        report += `|------|------|----------------------------|----------|\n`;

        findings.forEach(item => {
            const relativePath = path.relative(process.cwd(), item.file);
            const copyParts = [];
            if (item.title) copyParts.push(`**T:** "${item.title}"`);
            if (item.description) copyParts.push(`**D:** "${item.description}"`);
            const copy = copyParts.join('<br/>') || '(Dynamic/Unknown Content)';

            const analysis = [
                analyzeCopy(item.title),
                analyzeCopy(item.description)
            ].filter(Boolean).join('<br/>');

            report += `| ${item.type} | \`${relativePath}\` | ${copy} | ${analysis} |\n`;
        });
    }

    report += `\n## Guidelines for effective copy\n`;
    report += `- **Clarity:** Messages should be concise and unambiguous.\n`;
    report += `- **Actionability:** Users should know what to do next.\n`;
    report += `- **Tone:** Errors should be helpful, not blaming. Success messages should be encouraging.\n`;

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
    console.log('Starting Notification Copy Audit...');
    walkDir(SRC_DIR);
    generateReport();
    console.log('Audit complete.');
} catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
}
