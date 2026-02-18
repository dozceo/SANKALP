import fs from 'fs';
import path from 'path';

// CLI Argument Parsing
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const targetDir = args.find(arg => !arg.startsWith('--')) || path.join(process.cwd(), 'src');

const REPORT_FILE = 'design-token-violations.md';
const IGNORED_FILES = [
  path.join(process.cwd(), 'src/app/globals.css'),
  path.join(process.cwd(), 'src/lib/styles/graph-tokens.ts'), // Tokens definition file
];

interface Violation {
  file: string;
  line: number;
  match: string;
  context: string;
  recommendation?: string;
}

const HEX_REGEX = /#([0-9a-fA-F]{3}){1,2}\b/g;
const RGB_REGEX = /rgb\([^)]+\)/g;
const HSL_REGEX = /hsl\([^)]+\)/g;
const ARBITRARY_VAL_REGEX = /\b(w|h|min-w|min-h|max-w|max-h|p|m|mt|mb|ml|mr|mx|my|pt|pb|pl|pr|px|py|gap|text|leading|tracking)-\[(\d+px)\]/g;
const INLINE_STYLE_PIXEL_REGEX = /:\s*['"]?(\d+px)['"]?/g;

// Simple map for recommendations
const SPACING_MAP: Record<string, string> = {
  '0px': '0',
  '1px': 'px',
  '2px': '0.5',
  '4px': '1',
  '6px': '1.5',
  '8px': '2',
  '10px': '2.5',
  '12px': '3',
  '14px': '3.5',
  '16px': '4',
  '20px': '5',
  '24px': '6',
  '28px': '7',
  '32px': '8',
  '36px': '9',
  '40px': '10',
  '44px': '11',
  '48px': '12',
  '56px': '14',
  '64px': '16',
  '80px': '20',
  '96px': '24',
};

const FONT_SIZE_MAP: Record<string, string> = {
  '12px': 'xs',
  '14px': 'sm',
  '16px': 'base',
  '18px': 'lg',
  '20px': 'xl',
  '24px': '2xl',
  '30px': '3xl',
  '36px': '4xl',
  '48px': '5xl',
  '60px': '6xl',
  '72px': '7xl',
  '96px': '8xl',
  '128px': '9xl',
};

function getRecommendation(value: string, type: 'color' | 'spacing' | 'fontSize' | 'unknown'): string {
  if (type === 'color') {
    return 'Use a Tailwind color token (e.g., text-primary, bg-muted)';
  }
  if (type === 'spacing') {
    return SPACING_MAP[value] ? `Use spacing token '${SPACING_MAP[value]}'` : 'Use nearest spacing token';
  }
  if (type === 'fontSize') {
    return FONT_SIZE_MAP[value] ? `Use text size '${FONT_SIZE_MAP[value]}'` : 'Use nearest text size token';
  }
  return 'Use a design token';
}

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  try {
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
  } catch (error: any) {
    if (jsonOutput) {
        console.error(JSON.stringify({ error: `Error reading directory ${dir}: ${error.message}` }));
    } else {
        console.error(`Error reading directory ${dir}: ${error.message}`);
    }
    process.exit(1);
  }

  return fileList;
}

function scanFile(filePath: string): Violation[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const violations: Violation[] = [];

    lines.forEach((lineContent, index) => {
      // Check for Hex
      let match;
      while ((match = HEX_REGEX.exec(lineContent)) !== null) {
        violations.push({
          file: filePath,
          line: index + 1,
          match: match[0],
          context: lineContent.trim(),
          recommendation: getRecommendation(match[0], 'color'),
        });
      }

      // Check for RGB
      while ((match = RGB_REGEX.exec(lineContent)) !== null) {
         violations.push({
           file: filePath,
           line: index + 1,
           match: match[0],
           context: lineContent.trim(),
           recommendation: getRecommendation(match[0], 'color'),
         });
      }

      // Check for HSL (excluding var(--...))
      while ((match = HSL_REGEX.exec(lineContent)) !== null) {
        if (!match[0].includes('var(--')) {
          violations.push({
            file: filePath,
            line: index + 1,
            match: match[0],
            context: lineContent.trim(),
            recommendation: getRecommendation(match[0], 'color'),
          });
        }
      }

      // Check for Arbitrary Values (e.g. w-[10px])
      while ((match = ARBITRARY_VAL_REGEX.exec(lineContent)) !== null) {
        const fullMatch = match[0];
        const property = match[1]; // e.g. w, p, text
        const value = match[2]; // e.g. 10px

        let type: 'spacing' | 'fontSize' | 'unknown' = 'unknown';
        if (['w', 'h', 'p', 'm', 'mt', 'mb', 'ml', 'mr', 'mx', 'my', 'pt', 'pb', 'pl', 'pr', 'px', 'py', 'gap'].some(p => property.startsWith(p))) {
          type = 'spacing';
        } else if (property === 'text') {
          type = 'fontSize';
        }

        violations.push({
          file: filePath,
          line: index + 1,
          match: fullMatch,
          context: lineContent.trim(),
          recommendation: getRecommendation(value, type),
        });
      }

      // Check for inline styles with pixel values
      if (lineContent.includes('style={{') || lineContent.includes('style={')) {
          while ((match = INLINE_STYLE_PIXEL_REGEX.exec(lineContent)) !== null) {
              const value = match[1];
              violations.push({
                  file: filePath,
                  line: index + 1,
                  match: value,
                  context: lineContent.trim(),
                  recommendation: getRecommendation(value, 'spacing'), // Assume spacing for now as it's most common in styles
              });
          }
      }
    });

    return violations;
  } catch (error: any) {
    if (jsonOutput) {
        console.error(JSON.stringify({ error: `Error reading file ${filePath}: ${error.message}` }));
    } else {
        console.error(`Error reading file ${filePath}: ${error.message}`);
    }
    // We continue scanning other files even if one fails
    return [];
  }
}

function generateReport(violations: Violation[]) {
  if (jsonOutput) {
    console.log(JSON.stringify(violations, null, 2));
    return;
  }

  let report = '# Design Token Violation Report\n\n';
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  report += `Target Directory: ${targetDir}\n\n`;
  report += `Total Violations: ${violations.length}\n\n`;

  if (violations.length === 0) {
    report += 'No violations found! Great job!\n';
    console.log('No violations found.');
  } else {
    report += '| File | Line | Value | Recommendation | Context |\n';
    report += '|---|---|---|---|---|\n';
    violations.forEach((v) => {
      const relativePath = path.relative(process.cwd(), v.file);
      const safeContext = v.context.replace(/\|/g, '\\|').substring(0, 50) + (v.context.length > 50 ? '...' : '');
      report += `| ${relativePath} | ${v.line} | \`${v.match}\` | ${v.recommendation || '-'} | \`${safeContext}\` |\n`;
    });

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`Report generated at ${REPORT_FILE}`);
    console.log(`Found ${violations.length} violations.`);
  }
}

function main() {
  if (!jsonOutput) {
    console.log(`Scanning for design token violations in: ${targetDir}`);
  }

  if (!fs.existsSync(targetDir)) {
      const message = `Target directory not found: ${targetDir}`;
      if (jsonOutput) {
          console.error(JSON.stringify({ error: message }));
      } else {
          console.error(message);
      }
      process.exit(1);
  }

  const files = getAllFiles(targetDir);
  let allViolations: Violation[] = [];

  files.forEach((file) => {
    allViolations = allViolations.concat(scanFile(file));
  });

  generateReport(allViolations);

  if (allViolations.length > 0) {
    process.exit(1); // Fail CI if violations found
  } else {
    process.exit(0);
  }
}

main();
