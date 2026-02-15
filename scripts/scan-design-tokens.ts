import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const REPORT_FILE = 'design-token-violations.md';
const IGNORED_FILES = [
  path.join(SRC_DIR, 'app', 'globals.css'),
  // Add other files to ignore if needed
];

interface Violation {
  file: string;
  line: number;
  match: string;
  context: string;
}

const HEX_REGEX = /#([0-9a-fA-F]{3}){1,2}\b/g;
const RGB_REGEX = /rgb\([^)]+\)/g;
const HSL_REGEX = /hsl\([^)]+\)/g;

// List of allowed colors (if any specific ones are needed and not tokens)
const ALLOWED_VALUES: string[] = [
  // '#ffffff', // Example
  // '#000000',
];

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      if ((filePath.endsWith('.tsx') || filePath.endsWith('.css') || filePath.endsWith('.ts')) && !IGNORED_FILES.includes(filePath)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

function scanFile(filePath: string): Violation[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: Violation[] = [];

  lines.forEach((lineContent, index) => {
    // Check for Hex
    let match;
    while ((match = HEX_REGEX.exec(lineContent)) !== null) {
      const value = match[0];
      if (!ALLOWED_VALUES.includes(value.toLowerCase())) {
         // Check if it's inside a valid token usage (e.g. inside a comment? or just code)
         // Simple check: if it's a hex code, it's likely a violation unless it's a token definition (which we excluded in globals.css)
         // We might flag tailwind arbitrary values like `bg-[#123456]` which is also a violation of the system.
         violations.push({
           file: filePath,
           line: index + 1,
           match: value,
           context: lineContent.trim(),
         });
      }
    }

    // Check for RGB
    while ((match = RGB_REGEX.exec(lineContent)) !== null) {
       violations.push({
         file: filePath,
         line: index + 1,
         match: match[0],
         context: lineContent.trim(),
       });
    }

    // Check for HSL
    while ((match = HSL_REGEX.exec(lineContent)) !== null) {
      // HSL in tailwind config is fine, but in component code it's suspicious if not var(--...)
      // But wait, tailwind config uses `hsl(var(--...))`.
      // If the match contains `var(--`, it's likely using a token.
      if (!match[0].includes('var(--')) {
        violations.push({
          file: filePath,
          line: index + 1,
          match: match[0],
          context: lineContent.trim(),
        });
      }
    }
  });

  return violations;
}

function generateReport(violations: Violation[]) {
  let report = '# Design Token Violation Report\n\n';
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  report += `Total Violations: ${violations.length}\n\n`;

  if (violations.length === 0) {
    report += 'No violations found! Great job!\n';
  } else {
    report += '| File | Line | Value | Context |\n';
    report += '|---|---|---|---|\n';
    violations.forEach((v) => {
      const relativePath = path.relative(process.cwd(), v.file);
      // Escape pipe characters in context
      const safeContext = v.context.replace(/\|/g, '\\|').substring(0, 50) + (v.context.length > 50 ? '...' : '');
      report += `| ${relativePath} | ${v.line} | \`${v.match}\` | \`${safeContext}\` |\n`;
    });
  }

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated at ${REPORT_FILE}`);
}

function main() {
  console.log('Scanning for design token violations...');
  const files = getAllFiles(SRC_DIR);
  let allViolations: Violation[] = [];

  files.forEach((file) => {
    allViolations = allViolations.concat(scanFile(file));
  });

  generateReport(allViolations);
}

main();
