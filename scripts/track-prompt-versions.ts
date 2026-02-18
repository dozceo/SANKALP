
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const FLOWS_DIR = 'src/ai/flows';
const OUTPUT_FILE = 'PROMPT_VERSION_HISTORY.md';

function getHash(str: string): string {
    return crypto.createHash('sha256').update(str).digest('hex');
}

function extractPrompts(content: string): { name: string, prompt: string }[] {
    const results: { name: string, prompt: string }[] = [];

    // Regex to capture ai.definePrompt calls
    // We look for name: '...' and prompt: `...` inside the object
    // This is tricky with regex due to nesting and order.
    // Simpler approach: find `prompt:` key with backticks.

    // Attempt 1: Look for definePrompt block
    const definePromptRegex = /ai\.definePrompt\(\s*\{([\s\S]*?)\}\s*\)/g;
    let match;
    while ((match = definePromptRegex.exec(content)) !== null) {
        const body = match[1];

        // Extract name
        const nameMatch = /name:\s*['"]([^'"]+)['"]/.exec(body);
        const name = nameMatch ? nameMatch[1] : 'unnamed_prompt';

        // Extract prompt string (assuming backticks for template literals)
        const promptMatch = /prompt:\s*`([^`]+)`/.exec(body);

        if (promptMatch) {
            results.push({ name, prompt: promptMatch[1] });
        }
    }

    return results;
}

function main() {
    if (!fs.existsSync(FLOWS_DIR)) {
        console.error(`Directory not found: ${FLOWS_DIR}`);
        return;
    }

    const files = fs.readdirSync(FLOWS_DIR).filter(f => f.endsWith('.ts'));

    let report = `# LLM Prompt Template Version History\n\n`;
    report += `**Date:** ${new Date().toISOString().split('T')[0]}\n`;
    report += `**Scope:** \`${FLOWS_DIR}\`\n\n`;

    report += `| Flow File | Prompt Name | Version Hash (SHA-256) | Output Quality Baseline |\n`;
    report += `|---|---|---|---|\n`;

    files.forEach(file => {
        const filePath = path.join(FLOWS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const prompts = extractPrompts(content);

        if (prompts.length === 0) return;

        prompts.forEach(p => {
            const hash = getHash(p.prompt);
            report += `| \`${file}\` | \`${p.name}\` | \`${hash.substring(0, 12)}\` | [Link to Baseline](#) |\n`;
        });
    });

    report += `\n## Usage Guide\n`;
    report += `- **Prompt Change Detection:** Run this script on CI. If the hash changes, a new version entry should be created.\n`;
    report += `- **Quality Correlation:** When investigating output quality degradation, check if the active prompt hash matches the version that was tested.\n`;

    fs.writeFileSync(OUTPUT_FILE, report);
    console.log(`Report generated at ${OUTPUT_FILE}`);
}

main();
