
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const REPORT_PATH = path.join(process.cwd(), 'reports', 'THIRD_PARTY_EMBED_REPORT.md');

interface Finding {
    file: string;
    line: number;
    type: 'SCRIPT' | 'IFRAME' | 'EXTERNAL_URL';
    content: string;
}

const findings: Finding[] = [];

function scanFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
        const lineNum = index + 1;

        // Check for script tags with src
        if (/<script\s+.*src=["']http/.test(line)) {
            findings.push({ file: filePath, line: lineNum, type: 'SCRIPT', content: line.trim() });
        }

        // Check for iframes
        if (/<iframe\s+.*src=["']http/.test(line)) {
            findings.push({ file: filePath, line: lineNum, type: 'IFRAME', content: line.trim() });
        }

        // Check for generic external URLs (excluding imports)
        // This is a bit noisy, so we'll try to be specific
        // Look for string literals starting with http inside code (not imports)
        const urlMatch = /["'](https?:\/\/[^"']+)["']/.exec(line);
        if (urlMatch && !line.trim().startsWith('import ') && !line.includes('next.config')) {
             // Filter out common local host or internal patterns if needed
             if (!urlMatch[1].includes('localhost')) {
                findings.push({ file: filePath, line: lineNum, type: 'EXTERNAL_URL', content: urlMatch[1] });
             }
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
        } else if (/\.(tsx|ts|js|jsx|html)$/.test(file)) {
            scanFile(fullPath);
        }
    }
}

function generateReport() {
    let report = `# Third-Party Embed Security & Privacy Audit\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;

    report += `## Executive Summary\n`;
    report += `This report enumerates all detected third-party embeds (scripts, iframes) and external resource references in the codebase.\n`;
    report += `It also checks for Content Security Policy (CSP) configuration.\n\n`;

    report += `## CSP Configuration Check\n`;
    const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
    let cspFound = false;
    if (fs.existsSync(nextConfigPath)) {
        const content = fs.readFileSync(nextConfigPath, 'utf-8');
        if (content.includes('Content-Security-Policy') || content.includes('headers')) {
             // Simple check, might be false positive if just a comment
             if (!content.includes('// Content-Security-Policy')) {
                 cspFound = true;
             }
        }
    }

    if (cspFound) {
        report += `- ✅ CSP configuration detected in \`next.config.ts\` (manual review recommended for strictness).\n`;
    } else {
        report += `- ⚠️ **No explicit Content Security Policy (CSP) detected** in \`next.config.ts\`. This is a security risk.\n`;
        report += `  - Recommendation: Implement a strict CSP using \`next.config.js\` headers or middleware.\n`;
    }
    report += `\n`;

    report += `## Findings\n\n`;

    if (findings.length === 0) {
        report += `No third-party embeds or external URLs detected in source code.\n`;
    } else {
        const grouped = findings.reduce((acc, curr) => {
            if (!acc[curr.type]) acc[curr.type] = [];
            acc[curr.type].push(curr);
            return acc;
        }, {} as Record<string, Finding[]>);

        for (const type of ['SCRIPT', 'IFRAME', 'EXTERNAL_URL']) {
            const items = grouped[type] || [];
            if (items.length > 0) {
                report += `### ${type} Usage (${items.length})\n`;
                report += `| File | Line | Content |\n`;
                report += `|------|------|---------|\n`;
                items.forEach(item => {
                    const relativePath = path.relative(process.cwd(), item.file);
                    // escape pipe characters in content
                    const content = item.content.replace(/\|/g, '\\|').substring(0, 100);
                    report += `| \`${relativePath}\` | ${item.line} | \`${content}\` |\n`;
                });
                report += `\n`;
            }
        }
    }

    report += `## Privacy & Security Implications\n`;
    report += `- **External Scripts:** Can execute arbitrary code, track users, and exfiltrate data. Ensure all are trusted and necessary.\n`;
    report += `- **Iframes:** Can introduce clickjacking risks or leak data via URL parameters. Use \`sandbox\` attributes.\n`;
    report += `- **External URLs:** Images/Media from third parties can leak IP addresses and usage patterns.\n`;

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
    console.log('Starting Third-Party Embed Audit...');
    walkDir(SRC_DIR);
    generateReport();
    console.log('Audit complete.');
} catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
}
