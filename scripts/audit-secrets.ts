
import fs from 'fs';
import path from 'path';

const SECRET_PATTERNS = [
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z-_]{35}/g },
  { name: 'Firebase API Key', regex: /AIza[0-9A-Za-z-_]{35}/g },
  { name: 'Stripe Secret Key', regex: /sk_live_[0-9a-zA-Z]{24}/g },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/g },
  { name: 'Generic Private Key', regex: /-----BEGIN PRIVATE KEY-----/g },
  { name: 'Generic Secret Token', regex: /(api_key|access_token|secret_key)\s*[:=]\s*['"][a-zA-Z0-9-_]{20,}['"]/gi },
];

const IGNORED_DIRS = ['node_modules', '.git', 'dist', 'build', '.next'];
const IGNORED_FILES = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'audit-secrets.ts'];

interface Finding {
  file: string;
  line: number;
  type: string;
  snippet: string;
}

function scanFile(filePath: string): Finding[] {
  const findings: Finding[] = [];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      for (const pattern of SECRET_PATTERNS) {
        let match;
        // Reset lastIndex for global regex
        if (pattern.regex.flags.includes('g')) {
            pattern.regex.lastIndex = 0;
        }

        while ((match = pattern.regex.exec(line)) !== null) {
          const snippet = line.trim().substring(0, 100); // Limit snippet length
          const redactedSnippet = snippet.replace(match[0], 'REDACTED');

          findings.push({
            file: filePath,
            line: index + 1,
            type: pattern.name,
            snippet: redactedSnippet
          });

          // Break if not global to avoid infinite loop if logic fails,
          // though loop condition handles it.
          if (!pattern.regex.flags.includes('g')) break;
        }
      }
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
  return findings;
}

function walkDir(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (IGNORED_DIRS.includes(file)) return;

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, fileList);
    } else {
      if (!IGNORED_FILES.includes(file)) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

function main() {
  console.log('Starting secret scan...');
  const findings: Finding[] = [];

  // Check specific env files
  const envFiles = ['env.txt', '.env.local', '.env'];
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`Scanning ${file}...`);
      findings.push(...scanFile(file));
    }
  });

  // Scan src directory
  if (fs.existsSync('src')) {
    console.log('Scanning src/ directory...');
    const srcFiles = walkDir('src');
    srcFiles.forEach(file => {
        // filter out binary files or unlikely text files if needed,
        // but for now we scan everything that isn't ignored.
        // Simple check for extension
        if (['.ts', '.tsx', '.js', '.jsx', '.json', '.py', '.txt', '.md'].some(ext => file.endsWith(ext))) {
            findings.push(...scanFile(file));
        }
    });
  }

  // Generate Report
  const reportPath = 'SECRET_EXPOSURE_REPORT.md';
  let reportContent = '# Secret Exposure Report\n\n';
  reportContent += `**Date:** ${new Date().toISOString()}\n\n`;
  reportContent += `**Total Findings:** ${findings.length}\n\n`;

  if (findings.length === 0) {
    reportContent += '✅ No secrets detected in the scanned directories.\n';
  } else {
    reportContent += '| File | Line | Type | Snippet (Redacted) |\n';
    reportContent += '|---|---|---|---|\n';
    findings.forEach(f => {
      reportContent += `| \`${f.file}\` | ${f.line} | ${f.type} | \`${f.snippet.replace(/\|/g, '\\|')}\` |\n`;
    });

    reportContent += '\n\n## Remediation Steps\n';
    reportContent += '1. **Rotate Compromised Keys:** Any key found in this report should be considered compromised. Revoke it immediately and generate a new one.\n';
    reportContent += '2. **Remove from History:** Use tools like `git filter-repo` or BFG Repo-Cleaner to remove the sensitive file from git history.\n';
    reportContent += '3. **Use Environment Variables:** Store secrets in `.env.local` (which is gitignored) and access them via `process.env`.\n';
    reportContent += '4. **Check .gitignore:** Ensure `env.txt`, `.env`, and similar files are added to `.gitignore`.\n';
  }

  fs.writeFileSync(reportPath, reportContent);
  console.log(`Report generated at ${reportPath}`);
}

main();
