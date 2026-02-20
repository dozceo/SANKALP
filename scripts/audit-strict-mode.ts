
import * as fs from 'fs';
import * as path from 'path';

const REPORT_FILE = 'STRICT_MODE_VIOLATIONS.md';
const TSCONFIG_FILE = 'tsconfig.json';

interface StrictIssues {
  file: string;
  anyCount: number;
  bangCount: number;
  ignoreCount: number;
}

function checkTsConfig(): string[] {
  const issues: string[] = [];
  if (fs.existsSync(TSCONFIG_FILE)) {
    try {
      // tsconfig.json might have comments, so standard JSON.parse might fail.
      // But we can try a simple regex check for "strict": true
      const content = fs.readFileSync(TSCONFIG_FILE, 'utf-8');
      if (!content.includes('"strict": true')) {
        issues.push('- `strict` mode is not explicitly enabled in `tsconfig.json`.');
      }
      if (content.includes('"noImplicitAny": false')) {
        issues.push('- `noImplicitAny` is explicitly disabled.');
      }
      if (content.includes('"strictNullChecks": false')) {
        issues.push('- `strictNullChecks` is explicitly disabled.');
      }
    } catch (e) {
      issues.push('- Failed to parse `tsconfig.json`.');
    }
  } else {
    issues.push('- `tsconfig.json` not found.');
  }
  return issues;
}

function scanFile(filePath: string): StrictIssues {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues: StrictIssues = {
    file: filePath,
    anyCount: 0,
    bangCount: 0,
    ignoreCount: 0
  };

  const lines = content.split('\n');
  lines.forEach(line => {
    // Basic heuristics
    if (line.includes(': any') || line.includes('as any')) {
      issues.anyCount++;
    }
    // Check for ! assertion, but try to avoid logic like if (!x)
    // Heuristic: variable! or prop! usually means ! is preceded by a word character and not followed by =
    // This is hard with regex, so we'll just count ! that are likely assertions
    if (/[a-zA-Z0-9_]\![\s\.\)\]\;\,]/.test(line) || /[a-zA-Z0-9_]\!$/.test(line.trim())) {
       issues.bangCount++;
    }

    if (line.includes('@ts-ignore') || line.includes('@ts-expect-error') || line.includes('@ts-nocheck')) {
      issues.ignoreCount++;
    }
  });

  return issues;
}

function scanDir(dir: string): StrictIssues[] {
  let issues: StrictIssues[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
        issues = issues.concat(scanDir(fullPath));
      }
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      issues.push(scanFile(fullPath));
    }
  }
  return issues;
}

function generateReport() {
  console.log('Scanning for Strict Mode violations...');

  const configIssues = checkTsConfig();
  const fileIssues = scanDir('src'); // Scan src directory

  // Aggregate stats
  let totalAny = 0;
  let totalBang = 0;
  let totalIgnore = 0;

  fileIssues.forEach(i => {
    totalAny += i.anyCount;
    totalBang += i.bangCount;
    totalIgnore += i.ignoreCount;
  });

  // Filter significant files (having issues)
  const problematicFiles = fileIssues.filter(i => i.anyCount > 0 || i.bangCount > 0 || i.ignoreCount > 0);
  problematicFiles.sort((a, b) => (b.anyCount + b.bangCount + b.ignoreCount) - (a.anyCount + a.bangCount + a.ignoreCount));

  let reportContent = `# TypeScript Strict Mode Compliance Report

## Executive Summary
Audit of type safety practices, focusing on \`any\` usage, non-null assertions, and suppressed errors.

## Configuration (tsconfig.json)

${configIssues.length > 0 ? configIssues.join('\n') : 'No configuration issues found. Strict mode appears enabled.'}

## Violation Statistics

- **Explicit \`any\` types:** ${totalAny}
- **Non-null assertions (\`!\`):** ${totalBang}
- **TS Ignore/Expect Error:** ${totalIgnore}

## Top Offenders

| File | \`any\` | \`!\` | \`@ts-ignore\` |
|---|---|---|---|
`;

  problematicFiles.slice(0, 20).forEach(file => {
    const relativePath = path.relative(process.cwd(), file.file);
    reportContent += `| \`${relativePath}\` | ${file.anyCount} | ${file.bangCount} | ${file.ignoreCount} |\n`;
  });

  if (problematicFiles.length > 20) {
    reportContent += `\n*...and ${problematicFiles.length - 20} more files.*\n`;
  }

  reportContent += `\n## Recommendations

1. **Replace \`any\`:** Use \`unknown\` or specific interfaces. \`any\` disables type checking for that variable and propagates.
2. **Avoid Non-Null Assertions:** Use optional chaining (\`?.\`) and nullish coalescing (\`??\`) or type guards instead of \`!\`.
3. **Remove Suppressions:** \`@ts-ignore\` hides bugs. Fix the underlying type error.
`;

  fs.writeFileSync(REPORT_FILE, reportContent);
  console.log(`Report generated: ${REPORT_FILE}`);
}

generateReport();
