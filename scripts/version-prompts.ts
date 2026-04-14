
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const FLOWS_DIR = path.join(process.cwd(), 'src/ai/flows');
const HISTORY_FILE = path.join(process.cwd(), 'src/ai/prompts/prompt_history.json');
const REPORT_FILE = path.join(process.cwd(), 'PROMPT_VERSION_HISTORY.md');

// Regex to capture the prompt string (handling escaped quotes within strings)
// It looks for "prompt:" key followed by a string.
// Matches: `...`, '...', "..."
const PROMPT_REGEX = /prompt:\s*(`(?:[^`\\]|\\.)*`|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g;

interface PromptVersion {
  hash: string;
  timestamp: string;
  content: string; // Storing content might be large, but useful for diffs. Or maybe just store snippet.
  // Actually, let's store full content for now, or just hash. The prompt asks to "track prompt template changes".
  // To correlate output quality, we need to know what the prompt was. So storing content is good.
}

interface PromptHistory {
  [filename: string]: PromptVersion[];
}

function getFileHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

async function main() {
  console.log('🔍 Scanning for prompt templates in:', FLOWS_DIR);

  if (!fs.existsSync(FLOWS_DIR)) {
    console.error('❌ Flows directory not found!');
    process.exit(1);
  }

  // Load existing history
  let history: PromptHistory = {};
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    } catch (e) {
      console.error('⚠️ Error reading history file, starting fresh:', e);
    }
  }

  const files = fs.readdirSync(FLOWS_DIR).filter(f => f.endsWith('.ts'));
  let changesCount = 0;

  for (const file of files) {
    const filePath = path.join(FLOWS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Find all prompts in file
    let match;
    let promptIndex = 0;

    // Reset regex state
    PROMPT_REGEX.lastIndex = 0;

    while ((match = PROMPT_REGEX.exec(content)) !== null) {
      const promptContent = match[1]; // The captured string including quotes
      // Remove outer quotes
      const cleanContent = promptContent.slice(1, -1);

      const hash = getFileHash(cleanContent);
      const key = `${file}#${promptIndex}`; // Handle multiple prompts per file if any

      if (!history[key]) {
        history[key] = [];
      }

      const versions = history[key];
      const lastVersion = versions.length > 0 ? versions[versions.length - 1] : null;

      if (!lastVersion || lastVersion.hash !== hash) {
        console.log(`📝 Detected change/new prompt in ${file} (Index ${promptIndex})`);
        versions.push({
          hash,
          timestamp: new Date().toISOString(),
          content: cleanContent
        });
        changesCount++;
      }

      promptIndex++;
    }
  }

  // Save history
  ensureDirectoryExistence(HISTORY_FILE);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  console.log(`💾 Updated history file: ${HISTORY_FILE}`);

  // Generate Report
  let report = '# LLM Prompt Version History\n\n';
  report += 'This document tracks changes to prompt templates used in Genkit flows.\n\n';

  for (const [key, versions] of Object.entries(history)) {
    const [filename, index] = key.split('#');
    report += `## ${filename} (Prompt ${parseInt(index) + 1})\n\n`;

    // Sort versions by timestamp desc
    const sortedVersions = [...versions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    report += '| Version | Date | SHA-256 Hash | Content Snippet |\n';
    report += '|---|---|---|---|\n';

    for (let i = 0; i < sortedVersions.length; i++) {
      const v = sortedVersions[i];
      const snippet = v.content.replace(/\n/g, ' ').substring(0, 50) + '...';
      const versionNum = versions.length - i;
      report += `| v${versionNum} | ${v.timestamp} | \`${v.hash.substring(0, 8)}\` | ${snippet} |\n`;
    }
    report += '\n';

    // Show diff for latest change if there are at least 2 versions
    if (sortedVersions.length >= 2) {
        report += `**Latest Change (v${versions.length} vs v${versions.length-1}):**\n\n`;
        // Simple diff logic (just showing full content of latest for now as diffing is complex)
        report += '```text\n' + sortedVersions[0].content + '\n```\n\n';
    } else {
        report += `**Current Content:**\n\n`;
        report += '```text\n' + sortedVersions[0].content + '\n```\n\n';
    }
  }

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`📄 Generated report: ${REPORT_FILE}`);
  console.log(`✅ Processed ${files.length} files, found ${changesCount} updates.`);
}

main().catch(console.error);
