
import fs from 'fs';
import path from 'path';

const TARGET_DIR = path.resolve('src/lib/validations');
const OUTPUT_FILE = 'FORM_VALIDATION_AUDIT.md';

function getFiles(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

function extractMessages(content: string): string[] {
    const messages: string[] = [];

    // Regex for { message: "..." }
    const messageRegex = /message:\s*"([^"]+)"/g;
    let match;
    while ((match = messageRegex.exec(content)) !== null) {
        messages.push(match[1]);
    }

    // Regex for { required_error: "..." }
    const requiredErrorRegex = /required_error:\s*"([^"]+)"/g;
    while ((match = requiredErrorRegex.exec(content)) !== null) {
        messages.push(match[1]);
    }

    // Regex for .min(num, "...") or .max(num, "...") or .length(num, "...")
    // This is a bit looser, looking for string literal as second arg to common zod methods
    const shorthandRegex = /\.(?:min|max|length|regex)\([^,]+,\s*"([^"]+)"\)/g;
    while ((match = shorthandRegex.exec(content)) !== null) {
        messages.push(match[1]);
    }

    // Regex for .min(num, { message: "..." }) is covered by first regex

    return messages;
}

function scoreMessage(msg: string): { score: number, issues: string[], suggestion?: string } {
    let score = 10;
    const issues: string[] = [];

    // Check length
    if (msg.length > 60) {
        score -= 2;
        issues.push("Too long (>60 chars)");
    }

    // Check for technical jargon
    const jargon = ['string', 'regex', 'integer', 'float', 'boolean', 'array', 'object', 'undefined', 'null', 'NaN'];
    const foundJargon = jargon.filter(w => msg.toLowerCase().includes(w));
    if (foundJargon.length > 0) {
        score -= 5;
        issues.push(`Contains jargon: ${foundJargon.join(', ')}`);
    }

    // Check for passive voice or negative framing (simple heuristic)
    if (msg.includes("must not")) {
        // "must not" is okay sometimes, but "Please enter X" is better than "Field must not be empty"
    }

    // Check for "valid" (somewhat vague)
    if (msg.toLowerCase().includes("valid")) {
        score -= 1;
        issues.push("Vague 'valid' used");
    }

    let suggestion = msg;
    if (foundJargon.length > 0) {
        suggestion = msg.replace(/string/gi, "text").replace(/integer/gi, "number");
    }

    return { score, issues, suggestion: score < 10 ? suggestion : undefined };
}

function main() {
    const files = getFiles(TARGET_DIR);
    let report = `# Form Validation Error Message Clarity Audit\n\n`;
    report += `**Scope:** \`${TARGET_DIR}\`\n`;
    report += `**Date:** ${new Date().toISOString().split('T')[0]}\n\n`;

    let totalScore = 0;
    let count = 0;

    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const messages = extractMessages(content);

        if (messages.length === 0) return;

        report += `## File: \`${path.relative(process.cwd(), file)}\`\n\n`;
        report += `| Message | Score | Issues | Recommendation |\n`;
        report += `|---|---|---|---|\n`;

        messages.forEach(msg => {
            const { score, issues, suggestion } = scoreMessage(msg);
            totalScore += score;
            count++;

            const issuesStr = issues.length > 0 ? issues.join(', ') : "✅ OK";
            const recStr = suggestion && suggestion !== msg ? `Try: "${suggestion}"` : (score < 10 ? "Rewrite for clarity" : "-");

            report += `| "${msg}" | **${score}/10** | ${issuesStr} | ${recStr} |\n`;
        });
        report += `\n`;
    });

    if (count > 0) {
        const avg = (totalScore / count).toFixed(1);
        report += `\n## Summary\n`;
        report += `- **Total Messages Audited:** ${count}\n`;
        report += `- **Average Clarity Score:** ${avg}/10\n`;
    } else {
        report += `No validation messages found.\n`;
    }

    fs.writeFileSync(OUTPUT_FILE, report);
    console.log(`Report generated at ${OUTPUT_FILE}`);
}

main();
