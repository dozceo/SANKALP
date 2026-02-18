
import fs from 'fs';
import path from 'path';

const REPORT_FILE = 'reports/type-safety-audit.md';
const TARGET_DIRS = ['src'];

interface Violation {
  type: 'any' | 'non-null' | 'ts-ignore' | 'ts-expect-error';
  line: number;
  content: string;
}

function scanFile(filePath: string): Violation[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: Violation[] = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check for any
    // Simple regex, prone to false positives in comments/strings, but good enough for audit
    // Avoid comments if possible, but regex for comments is hard.
    // We'll ignore lines starting with //
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

    if (/\bany\b/.test(line) && !line.includes('//') && !line.includes('/*')) {
       // Check if it's really a type annotation like `: any` or `as any` or `<any>`
       if (/: any\b/.test(line) || /\bas any\b/.test(line) || /<any>/.test(line)) {
           violations.push({ type: 'any', line: lineNum, content: trimmed });
       }
    }

    // Check for non-null assertion !
    // Look for `!.` or `!)` or `!;` or `!,`
    if (/!\.|!\)|!;|!,/.test(line)) {
        violations.push({ type: 'non-null', line: lineNum, content: trimmed });
    }

    // Check for ts-ignore
    if (line.includes('@ts-ignore')) {
        violations.push({ type: 'ts-ignore', line: lineNum, content: trimmed });
    }

    // Check for ts-expect-error
    if (line.includes('@ts-expect-error')) {
        violations.push({ type: 'ts-expect-error', line: lineNum, content: trimmed });
    }
  });

  return violations;
}

function getAllFiles(dir: string, fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

function generateReport() {
  console.log('Scanning for TypeScript violations...');

  let allViolations: { filePath: string; violations: Violation[] }[] = [];

  TARGET_DIRS.forEach(dir => {
      const files = getAllFiles(dir);
      files.forEach(file => {
          const v = scanFile(file);
          if (v.length > 0) {
              allViolations.push({ filePath: file, violations: v });
          }
      });
  });

  let report = `# TypeScript Strict Mode Compliance Audit\n\n**Date:** ${new Date().toISOString()}\n\n`;

  const anyCount = allViolations.reduce((acc, curr) => acc + curr.violations.filter(v => v.type === 'any').length, 0);
  const nonNullCount = allViolations.reduce((acc, curr) => acc + curr.violations.filter(v => v.type === 'non-null').length, 0);
  const ignoreCount = allViolations.reduce((acc, curr) => acc + curr.violations.filter(v => v.type.startsWith('ts-')).length, 0);

  report += `## Summary\n`;
  report += `- **\`any\` usages:** ${anyCount}\n`;
  report += `- **Non-null assertions (\`!\`):** ${nonNullCount}\n`;
  report += `- **\`@ts-ignore\` / \`@ts-expect-error\`:** ${ignoreCount}\n\n`;

  if (allViolations.length > 0) {
      report += `## Detailed Violations\n\n`;
      allViolations.forEach(file => {
          report += `### \`${file.filePath}\`\n`;
          file.violations.forEach(v => {
              report += `- **Line ${v.line}** [${v.type}]: \`${v.content}\`\n`;
          });
          report += `\n`;
      });
  } else {
      report += `No violations found! Great job! 🚀\n`;
  }

  const reportsDir = path.dirname(REPORT_FILE);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated: ${REPORT_FILE}`);
}

generateReport();
