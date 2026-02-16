import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = 'design-token-violations.md';
const DIRECTORIES_TO_SCAN = ['src/app', 'src/components'];
const EXTENSIONS = ['.tsx', '.ts', '.css'];

// Regex patterns (strings to create new RegExp objects)
const HEX_COLOR_PATTERN_STR = '#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b';
const ARBITRARY_TAILWIND_PATTERN_STR = '\\b[a-z0-9]+-\\[[^\\]]+\\]';

interface Violation {
  file: string;
  line: number;
  match: string;
  type: 'Hex Color' | 'Arbitrary Value';
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (EXTENSIONS.includes(path.extname(fullPath))) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function scanFile(filePath: string): Violation[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: Violation[] = [];

  const isCssFile = filePath.endsWith('.css');

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) return;

    // Skip variable definitions in CSS (e.g. --primary: #333;)
    if (isCssFile && trimmedLine.startsWith('--')) return;

    // Create fresh regex for each line to avoid state issues
    const hexRegex = new RegExp(HEX_COLOR_PATTERN_STR, 'g');
    let match;
    while ((match = hexRegex.exec(line)) !== null) {
        violations.push({
          file: filePath,
          line: index + 1,
          match: match[0],
          type: 'Hex Color',
        });
    }

    // Arbitrary Value Check
    if (!isCssFile || line.includes('@apply')) {
        const arbitraryRegex = new RegExp(ARBITRARY_TAILWIND_PATTERN_STR, 'g');
        while ((match = arbitraryRegex.exec(line)) !== null) {
            // Ignore state variants like data-[...], group-[...], peer-[...]
            if (match[0].startsWith('data-[') || match[0].startsWith('group-[') || match[0].startsWith('peer-[')) {
                continue;
            }
            // Ignore calc/var usage if it looks like a system variable
            if (match[0].includes('var(--')) {
                 // Maybe allow variables?
                 // w-[var(--sidebar-width)] is technically using a token (variable), so maybe valid.
                 // But let's keep flagging it as it's not a utility class.
                 // Actually, the prompt says "hardcoded values". var(--...) is not hardcoded value.
                 continue;
            }

            violations.push({
                file: filePath,
                line: index + 1,
                match: match[0],
                type: 'Arbitrary Value',
            });
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
      report += "✅ No design token violations found.\n";
  } else {
      report += "| File | Line | Type | Violation | Recommendation |\n";
      report += "|---|---|---|---|---|\n";

      violations.forEach(v => {
          let recommendation = '';
          if (v.type === 'Hex Color') {
              recommendation = 'Use a color token (e.g., `text-primary`, `bg-muted`)';
          } else {
              recommendation = 'Use a standard utility class or add to theme';
          }
          const relPath = path.relative(process.cwd(), v.file);
          report += `| \`${relPath}\` | ${v.line} | ${v.type} | \`${v.match}\` | ${recommendation} |\n`;
      });
  }

  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(`Report generated at ${OUTPUT_FILE}`);
}

function main() {
  console.log('Starting Design Token Scan...');
  let allFiles: string[] = [];

  DIRECTORIES_TO_SCAN.forEach(dir => {
     allFiles = allFiles.concat(getAllFiles(dir));
  });

  // Deduplicate
  allFiles = [...new Set(allFiles)];

  let allViolations: Violation[] = [];

  allFiles.forEach(file => {
      // Skip node_modules just in case
      if (file.includes('node_modules')) return;

      const fileViolations = scanFile(file);
      allViolations = allViolations.concat(fileViolations);
  });

  generateReport(allViolations);
}

main();
