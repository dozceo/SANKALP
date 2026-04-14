
import fs from 'fs';
import path from 'path';

const ADK_PATH = path.join(process.cwd(), 'src/ai/adk/decision-engine.ts');
const REPORT_PATH = path.join(process.cwd(), 'reports', 'ADK_EXPLAINABILITY_REPORT.md');

function scanAdkFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let decisionCount = 0;
    let explainedCount = 0;
    const missingExplanations: number[] = [];

    let inReturnBlock = false;
    let currentBlockContent = '';
    let returnStartLine = 0;
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (!inReturnBlock) {
            if (/return\s*\{/.test(line)) {
                inReturnBlock = true;
                currentBlockContent = line;
                returnStartLine = i + 1;

                const openBraces = (line.match(/\{/g) || []).length;
                const closeBraces = (line.match(/\}/g) || []).length;
                braceCount = openBraces - closeBraces;

                if (braceCount === 0) {
                    // One-liner return
                    inReturnBlock = false;
                    if (currentBlockContent.includes('action:') || currentBlockContent.includes('priority:')) {
                        decisionCount++;
                        if (currentBlockContent.includes('reasoning:')) {
                            explainedCount++;
                        } else {
                            missingExplanations.push(returnStartLine);
                        }
                    }
                }
            }
        } else {
            currentBlockContent += line;

            const openBraces = (line.match(/\{/g) || []).length;
            const closeBraces = (line.match(/\}/g) || []).length;
            braceCount += (openBraces - closeBraces);

            if (braceCount === 0) {
                // End of block
                inReturnBlock = false;

                if (currentBlockContent.includes('action:') || currentBlockContent.includes('priority:')) {
                    decisionCount++;
                    if (currentBlockContent.includes('reasoning:')) {
                        explainedCount++;
                    } else {
                        missingExplanations.push(returnStartLine);
                    }
                }
            }
        }
    }

    return { decisionCount, explainedCount, missingExplanations };
}

function generateReport() {
    let report = `# ADK Decision Explainability Completeness Check\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;

    report += `## Executive Summary\n`;
    report += `This audit validates that all automated decisions made by the ADK Decision Engine include a human-readable explanation ('reasoning' field) to ensure transparency.\n\n`;

    if (!fs.existsSync(ADK_PATH)) {
        report += `⚠️ **Critical Error:** ADK Decision Engine file not found at \`${ADK_PATH}\`.\n`;
        const reportDir = path.dirname(REPORT_PATH);
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        fs.writeFileSync(REPORT_PATH, report);
        return;
    }

    const { decisionCount, explainedCount, missingExplanations } = scanAdkFile(ADK_PATH);
    const coverage = decisionCount > 0 ? (explainedCount / decisionCount) * 100 : 0;

    report += `- **Total Decision Paths:** ${decisionCount}\n`;
    report += `- **Explained Decisions:** ${explainedCount}\n`;
    report += `- **Explainability Coverage:** ${coverage.toFixed(1)}%\n\n`;

    if (missingExplanations.length > 0) {
        report += `## ⚠️ Unexplained Decisions\n`;
        report += `The following decision blocks are missing a 'reasoning' field:\n\n`;
        report += `| Line Number |\n`;
        report += `|-------------|\n`;
        missingExplanations.forEach(line => {
            report += `| ${line} |\n`;
        });
        report += `\n**Action Required:** Add 'reasoning' field to these return statements.\n`;
    } else {
        report += `## ✅ All Decisions Explained\n`;
        report += `Great job! Every decision path in the ADK engine includes a reasoning string.\n`;
    }

    report += `\n## Methodology\n`;
    report += `Static analysis of \`src/ai/adk/decision-engine.ts\` identifying object literals returned with \`action\` or \`priority\` keys, and verifying the presence of the \`reasoning\` key.\n`;

    const reportDir = path.dirname(REPORT_PATH);
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`Report generated at: ${REPORT_PATH}`);
}

try {
    console.log('Starting ADK Explainability Audit...');
    generateReport();
    console.log('Audit complete.');
} catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
}
