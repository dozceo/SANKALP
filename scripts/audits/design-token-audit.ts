import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const REPORT_PATH = path.join(process.cwd(), 'design-token-violations.md');

// Configuration for what to ignore
const IGNORED_FILES = [
  'globals.css', // We'll handle this separately or just ignore variable definitions
  'tailwind.config.ts',
  'design-token-audit.ts', // ignore self
];

const IGNORED_VALUES = [
  '0px', '1px', '2px', // Common border widths or resets
  'transparent', 'currentColor', 'inherit', 'initial', 'none', 'auto'
];

// Regex patterns
const HEX_REGEX = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
const RGB_REGEX = /rgba?\([\d\s,./%]+\)/g;
const HSL_REGEX = /hsla?\([\d\s,./%]+\)/g;
const PIXEL_REGEX = /\b\d+(?:\.\d+)?px\b/g;
const ARBITRARY_TAILWIND_REGEX = /\b[a-z]+-\[[^\]]+\]/g; // e.g., w-[100px], bg-[#ff0000]

interface Violation {
  file: string;
  line: number;
  match: string;
  type: 'Color' | 'Pixel' | 'Arbitrary Tailwind';
  context: string;
}

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        getAllFiles(filePath, fileList);
      }
    } else {
      if ((file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) && !IGNORED_FILES.includes(file)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

function checkFile(filePath: string): Violation[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: Violation[] = [];
  const relativePath = path.relative(process.cwd(), filePath);

  // Skip likely non-source files or specific ignored paths
  if (relativePath.includes('src/lib/') || relativePath.includes('src/components/ui/')) {
      // Maybe relax for ui/ lib/ if they contain the definitions?
      // Actually ui/ components SHOULD use tokens.
  }

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) return;

    // Skip likely CSS variable definitions in CSS files
    if (filePath.endsWith('.css') && line.trim().startsWith('--')) return;

    // Check Hex
    let match;
    while ((match = HEX_REGEX.exec(line)) !== null) {
      if (!IGNORED_VALUES.includes(match[0])) {
         // Check if it's inside a def like `const c = "#fff"` which might be valid in some contexts, but usually we want tokens.
         // In Tailwind config it's fine, but we excluded tailwind.config.ts
         violations.push({
           file: relativePath,
           line: lineNum,
           match: match[0],
           type: 'Color',
           context: line.trim()
         });
      }
    }

    // Check RGB
    while ((match = RGB_REGEX.exec(line)) !== null) {
       violations.push({
         file: relativePath,
         line: lineNum,
         match: match[0],
         type: 'Color',
         context: line.trim()
       });
    }

    // Check HSL
    while ((match = HSL_REGEX.exec(line)) !== null) {
       violations.push({
         file: relativePath,
         line: lineNum,
         match: match[0],
         type: 'Color',
         context: line.trim()
       });
    }

    // Check Arbitrary Tailwind
    while ((match = ARBITRARY_TAILWIND_REGEX.exec(line)) !== null) {
       violations.push({
         file: relativePath,
         line: lineNum,
         match: match[0],
         type: 'Arbitrary Tailwind',
         context: line.trim()
       });
    }

    // Check Pixels (exclude arbitrary tailwind matches which are already caught)
    // We need to be careful not to double count `w-[100px]` as pixel violation if we caught it as arbitrary.
    // But pixel regex is simple.
    // Also, ignoring 0px, 1px, 2px
    while ((match = PIXEL_REGEX.exec(line)) !== null) {
      if (!IGNORED_VALUES.includes(match[0])) {
        // Check if it is inside an arbitrary tailwind class (already caught)
        const isArbitrary = ARBITRARY_TAILWIND_REGEX.test(line); // simple check, not perfect
        if (!isArbitrary) {
            violations.push({
                file: relativePath,
                line: lineNum,
                match: match[0],
                type: 'Pixel',
                context: line.trim()
            });
        }
      }
    }
  });

  return violations;
}

function generateReport(violations: Violation[]) {
  let report = '# Design Token Violation Report\n\n';
  report += `Generated on: ${new Date().toLocaleString()}\n`;
  report += `Total Violations: ${violations.length}\n\n`;

  if (violations.length === 0) {
    report += 'No violations found. Great job adhering to the design system!\n';
  } else {
    report += '## Violations by File\n\n';

    const byFile: Record<string, Violation[]> = {};
    violations.forEach(v => {
      if (!byFile[v.file]) byFile[v.file] = [];
      byFile[v.file].push(v);
    });

    for (const [file, fileViolations] of Object.entries(byFile)) {
      report += `### ${file} (${fileViolations.length})\n`;
      report += '| Line | Type | Value | Context |\n';
      report += '|---|---|---|---|\n';
      fileViolations.forEach(v => {
        report += `| ${v.line} | ${v.type} | \`${v.match}\` | \`${v.context.substring(0, 50).replace(/\|/g, '\\|')}\` |\n`;
      });
      report += '\n';
    }
  }

  fs.writeFileSync(REPORT_PATH, report);
  console.log(`Report generated at ${REPORT_PATH}`);
}

function run() {
  const files = getAllFiles(SRC_DIR);
  let allViolations: Violation[] = [];

  console.log(`Scanning ${files.length} files...`);

  files.forEach(file => {
    allViolations = allViolations.concat(checkFile(file));
  });

  generateReport(allViolations);
}

run();
