import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const FLOWS_DIR = path.join(process.cwd(), 'src/ai/flows');
const HISTORY_FILE = path.join(process.cwd(), 'PROMPT_VERSION_HISTORY.md');

function calculateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
}

function extractPrompt(fileContent: string): string | null {
    // Look for prompt: `...` inside ai.definePrompt
    // Simplistic regex, assumes backticks are used for multiline strings
    const match = /prompt:\s*`([\s\S]*?)`\s*,/m.exec(fileContent);
    if (match && match[1]) {
        return match[1];
    }
    // Try single/double quotes if backticks fail
    const match2 = /prompt:\s*(["'])([\s\S]*?)\1\s*,/m.exec(fileContent);
    if (match2 && match2[2]) {
        return match2[2];
    }
    return null;
}

function ensureHistoryFile() {
    if (!fs.existsSync(HISTORY_FILE)) {
        const header = '# LLM Prompt Version History\n\n| Timestamp | Flow File | Prompt Hash | Snippet |\n|---|---|---|---|\n';
        fs.writeFileSync(HISTORY_FILE, header);
    }
}

function getLastHashForFlow(flowName: string): string | null {
    if (!fs.existsSync(HISTORY_FILE)) return null;
    const content = fs.readFileSync(HISTORY_FILE, 'utf-8');
    const lines = content.split('\n').filter(l => l.includes(`| ${flowName} |`));
    if (lines.length === 0) return null;
    const lastLine = lines[lines.length - 1];
    const parts = lastLine.split('|');
    // | Timestamp | Flow File | Prompt Hash | Snippet |
    // parts[0] is empty, parts[1] is Timestamp, parts[2] is Flow File, parts[3] is Hash
    return parts[3]?.trim() || null;
}

async function main() {
    console.log('🔍 Scanning for prompt changes in src/ai/flows/ ...');
    ensureHistoryFile();

    if (!fs.existsSync(FLOWS_DIR)) {
        console.error(`❌ Directory not found: ${FLOWS_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(FLOWS_DIR).filter(f => f.endsWith('.ts'));
    let changesCount = 0;

    for (const file of files) {
        const filePath = path.join(FLOWS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const prompt = extractPrompt(content);

        if (prompt) {
            const hash = calculateHash(prompt);
            const lastHash = getLastHashForFlow(file);

            if (hash !== lastHash) {
                console.log(`📝 Detected change in ${file}`);
                const timestamp = new Date().toISOString();
                // Escape pipes in snippet to avoid breaking markdown table
                const cleanSnippet = prompt.replace(/\s+/g, ' ').replace(/\|/g, '\\|').substring(0, 50) + '...';
                const entry = `| ${timestamp} | ${file} | ${hash} | ${cleanSnippet} |\n`;
                fs.appendFileSync(HISTORY_FILE, entry);
                changesCount++;
            }
        } else {
            // console.warn(`⚠️ No prompt found in ${file} (or regex failed)`);
        }
    }

    if (changesCount > 0) {
        console.log(`✅ Recorded ${changesCount} prompt version(s).`);
    } else {
        console.log('✨ No prompt changes detected.');
    }
}

main().catch(console.error);
