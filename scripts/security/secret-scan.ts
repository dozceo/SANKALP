
import fs from 'fs';
import path from 'path';

const SUSPICIOUS_PATTERNS = [
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z-_]{35}/g },
  { name: 'Firebase Private Key', regex: /-----BEGIN PRIVATE KEY-----/g },
  { name: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9]{48}/g },
  { name: 'Generic Secret', regex: /(api_key|secret|token|password)\s*[:=]\s*['"][a-zA-Z0-9-_\.]+['"]/gi },
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g },
];

const IGNORE_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', 'reports'];
const IGNORE_FILES = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'scan-secrets.ts'];

interface Finding {
  file: string;
  line: number;
  type: string;
  snippet: string;
}

const findings: Finding[] = [];

function scanFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      SUSPICIOUS_PATTERNS.forEach(pattern => {
        if (pattern.regex.test(line)) {
            // Check if it's a false positive (e.g., in a comment explaining the pattern, or a placeholder)
            if (line.includes('process.env') || line.includes('NEXT_PUBLIC_')) {
                // Likely a usage, not a hardcoded secret, but still worth checking if it's assigning a literal
                // If it looks like `const key = process.env.KEY`, it's fine.
                // If it looks like `const key = "AIza..."`, it's bad.
                if (!line.match(/['"`][a-zA-Z0-9-_\.]+['"`]/)) return;
            }

            // simple check to avoid flagging the scanner itself if it were reading its own source,
            // but we are in scripts/ so we might scan ourselves.
            if (filePath.endsWith('scan-secrets.ts')) return;

            findings.push({
            file: filePath,
            line: index + 1,
            type: pattern.name,
            snippet: line.trim().substring(0, 100) // Truncate for report
          });
        }
      });
    });
  } catch (err) {
    // ignore read errors (directories, binary files)
  }
}

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        walkDir(filePath);
      }
    } else {
        if (!IGNORE_FILES.includes(file)) {
            scanFile(filePath);
        }
    }
  }
}

// Main execution
console.log('Starting Secret Scan...');

// Scan specific files
['env.txt', '.env.local'].forEach(f => {
    if (fs.existsSync(f)) scanFile(f);
});

// Scan src directory
if (fs.existsSync('src')) {
    walkDir('src');
}

// Generate Report
let report = `# Secret Exposure Report

**Date:** ${new Date().toISOString()}
**Files Scanned:** env.txt, .env.local, src/**

## Summary
Found ${findings.length} potential secrets.

## Detailed Findings

| File | Line | Type | Snippet |
|------|------|------|---------|
`;

findings.forEach(f => {
    // Mask the snippet for the report
    const maskedSnippet = f.snippet.replace(/['":=]\s*([a-zA-Z0-9-_\.]+)/g, (match, p1) => {
        if (p1.length > 5) return match.replace(p1, p1.substring(0, 3) + '***');
        return match;
    }).replace(/\|/g, '\\|'); // Escape pipes for markdown table

    report += `| \`${f.file}\` | ${f.line} | ${f.type} | \`${maskedSnippet}\` |\n`;
});

report += `\n## Remediation Steps
1. **Rotate Credentials:** Immediately revoke and rotate any exposed keys.
2. **Use Environment Variables:** Move secrets to \`.env\` (and ensure it's gitignored).
3. **Check Git History:** Use tools like BFG Repo-Cleaner to remove secrets from history.
`;

const reportPath = path.join('reports', 'SECRET_EXPOSURE_REPORT.md');
if (!fs.existsSync('reports')) fs.mkdirSync('reports');
fs.writeFileSync(reportPath, report);

console.log(`Scan complete. Report generated at ${reportPath}`);
