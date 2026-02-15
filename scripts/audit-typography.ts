
import * as fs from 'fs';
import * as path from 'path';

// Allowed Tailwind standard text sizes
const ALLOWED_SIZES = [
  'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl',
  'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl',
  'text-7xl', 'text-8xl', 'text-9xl'
];

const ALLOWED_HEADINGS = {
  h1: ['text-4xl', 'text-5xl', 'text-6xl'],
  h2: ['text-3xl', 'text-4xl'],
  h3: ['text-2xl', 'text-3xl'],
  h4: ['text-xl', 'text-2xl'],
  h5: ['text-lg', 'text-xl'],
  h6: ['text-base', 'text-lg'],
};

interface TypographyIssue {
  file: string;
  line: number;
  issue: string;
  element?: string;
}

const issues: TypographyIssue[] = [];

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Regex to match className="..." or className={...}
    const classMatches = line.matchAll(/className=["']([^"']+)["']/g);
    for (const match of classMatches) {
      const classes = match[1].split(/\s+/);

      // Check for arbitrary values like text-[12px]
      const arbitraryTextSize = classes.find(c => c.startsWith('text-['));
      if (arbitraryTextSize) {
        issues.push({
          file: filePath,
          line: index + 1,
          issue: `Arbitrary text size used: ${arbitraryTextSize}`,
        });
      }

      // Check for standard sizes not in allow list (though allow list covers standard ones, this catches text-10xl if added)
      const textSize = classes.find(c => c.startsWith('text-') && !c.startsWith('text-[') && !['text-left', 'text-right', 'text-center', 'text-justify', 'text-transparent', 'text-current'].includes(c) && !c.includes('/'));
      if (textSize && !ALLOWED_SIZES.includes(textSize)) {
         // Check if it's a color
         // A simple check is if it matches text-{color}-{shade}
         // But we only care about size. standard sizes are text-xs to 9xl.
         // If it's something like text-red-500, we ignore it.
         // Standard sizes don't have a second dash usually, except maybe future versions.
         // The regex /text-(xs|sm|base|lg|[0-9]+xl)/ matches sizes.
         if (!textSize.match(/text-(xs|sm|base|lg|[0-9]+xl)$/)) {
            // Likely a color or other utility, ignore
         } else {
             // It matches pattern but not allowed list? text-10xl?
             issues.push({
                file: filePath,
                line: index + 1,
                issue: `Non-standard text size: ${textSize}`,
             });
         }
      }
    }

    // Heuristic check for headings (very simple)
    // Looking for <h1 ... className="...">
    const headingMatch = line.match(/<(h[1-6])\s+[^>]*className=["']([^"']+)["']/);
    if (headingMatch) {
      const tag = headingMatch[1] as keyof typeof ALLOWED_HEADINGS;
      const classes = headingMatch[2].split(/\s+/);
      const sizeClass = classes.find(c => c.startsWith('text-') && ALLOWED_SIZES.includes(c));

      if (sizeClass && !ALLOWED_HEADINGS[tag].includes(sizeClass)) {
         issues.push({
          file: filePath,
          line: index + 1,
          issue: `Heading <${tag}> uses inconsistent size: ${sizeClass}. Expected one of: ${ALLOWED_HEADINGS[tag].join(', ')}`,
          element: tag
        });
      }
    }
  });
}

function traverseDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      scanFile(fullPath);
    }
  }
}

console.log('Starting Typography Audit...');
traverseDir('src/app');
traverseDir('src/components');

let report = '# Typography Drift Report\n\n';
if (issues.length === 0) {
  report += 'No typography issues found.\n';
} else {
  report += '| File | Line | Issue |\n|---|---|---|\n';
  issues.forEach(i => {
    report += `| ${i.file} | ${i.line} | ${i.issue} |\n`;
  });
}

fs.writeFileSync('typography-drift-report.md', report);
console.log('Typography Audit Complete. Report saved to typography-drift-report.md');
