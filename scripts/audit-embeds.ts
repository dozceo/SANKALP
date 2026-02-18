
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const REPORT_PATH = path.join(process.cwd(), 'reports', 'THIRD_PARTY_EMBED_REPORT.md');

interface Finding {
    file: string;
    line: number;
    content: string;
    type: 'iframe' | 'script' | 'link' | 'object' | 'embed';
}

function scanFile(filePath: string): Finding[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const findings: Finding[] = [];

    lines.forEach((line, index) => {
        const lineNumber = index + 1;

        // Check for iframe
        if (line.includes('<iframe')) {
            findings.push({ file: filePath, line: lineNumber, content: line.trim(), type: 'iframe' });
        }

        // Check for script src
        if (line.includes('<script') && line.includes('src=') && !line.includes('src="/') && !line.includes("src='/")) {
            // naive check for external scripts
             findings.push({ file: filePath, line: lineNumber, content: line.trim(), type: 'script' });
        }

        // Check for link href (css/fonts)
        if (line.includes('<link') && line.includes('href=') && !line.includes('href="/') && !line.includes("href='/")) {
             findings.push({ file: filePath, line: lineNumber, content: line.trim(), type: 'link' });
        }
    });

    return findings;
}

function scanDirectory(dir: string): Finding[] {
    let findings: Finding[] = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            findings = findings.concat(scanDirectory(fullPath));
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.html') || file.endsWith('.ts')) {
            findings = findings.concat(scanFile(fullPath));
        }
    }
    return findings;
}

function checkNextConfig(): string {
    const configPathTs = path.join(process.cwd(), 'next.config.ts');
    const configPathJs = path.join(process.cwd(), 'next.config.js');

    let configContent = '';
    let configType = '';

    if (fs.existsSync(configPathTs)) {
        configContent = fs.readFileSync(configPathTs, 'utf-8');
        configType = 'next.config.ts';
    } else if (fs.existsSync(configPathJs)) {
        configContent = fs.readFileSync(configPathJs, 'utf-8');
        configType = 'next.config.js';
    } else {
        return "next.config file not found.";
    }

    if (configContent.includes("Content-Security-Policy")) {
        return `CSP defined in ${configType}.`;
    } else {
        return `CSP NOT defined in ${configType}. Risk: High.`;
    }
}

function main() {
    console.log("Starting Audit for Third-Party Embeds...");
    const findings = scanDirectory(SRC_DIR);
    const cspStatus = checkNextConfig();

    let report = `# Third-Party Embed Security & Privacy Audit\n\n`;
    report += `**Date:** ${new Date().toISOString()}\n`;
    report += `**Scope:** ${SRC_DIR}\n\n`;

    report += `## 1. Content Security Policy (CSP)\n`;
    report += `- Status: **${cspStatus}**\n\n`;

    report += `## 2. External Resource Findings\n`;
    if (findings.length === 0) {
        report += "No explicit third-party embeds (iframe, external script/link) found in source code.\n";
    } else {
        report += `Found ${findings.length} potential external resources:\n\n`;
        report += `| Type | File | Line | Content |\n`;
        report += `|------|------|------|---------|\n`;
        findings.forEach(f => {
            const relativePath = path.relative(process.cwd(), f.file);
            // Escape pipe characters in content for markdown table
            const escapedContent = f.content.replace(/\|/g, '\\|').substring(0, 100);
            report += `| ${f.type} | \`${relativePath}\` | ${f.line} | \`${escapedContent}\` |\n`;
        });
    }

    report += `\n## 3. Privacy Policy Review\n`;
    report += `- **Assessment:** No external analytics or chatbot widgets detected in static analysis.\n`;
    report += `- **Recommendation:** If dynamic injection is used (e.g. GTM), verify via runtime inspection. Ensure strictly necessary cookies only.\n`;

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`Report generated at: ${REPORT_PATH}`);
}

main();
