
import * as fs from 'fs';
import * as path from 'path';

// Allowed Tailwind standard text sizes
const ALLOWED_SIZES = [
  'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl',
  'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl',
  'text-7xl', 'text-8xl', 'text-9xl'
];

const ALLOWED_HEADINGS = {
  h1: ['text-4xl', 'text-5xl', 'text-6xl', 'font-headline'],
  h2: ['text-3xl', 'text-4xl', 'font-headline'],
  h3: ['text-2xl', 'text-3xl', 'font-headline'],
  h4: ['text-xl', 'text-2xl', 'font-headline'],
  h5: ['text-lg', 'text-xl', 'font-headline'],
  h6: ['text-base', 'text-lg', 'font-headline'],
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

  // Regex to find className attributes (simple, handles single/double quotes)
  // We scan line by line for simplicity but also look for specific patterns.
  // For better accuracy, we should parse, but regex is sufficient for audit.

  lines.forEach((line, index) => {
    // 1. Check for inline styles affecting font size
    if (line.includes('style={{') && line.includes('fontSize')) {
      issues.push({
        file: filePath,
        line: index + 1,
        issue: 'Inline style used for fontSize. Use Tailwind classes instead.'
      });
    }

    // 2. Check for arbitrary text sizes in className
    const arbitraryMatch = line.match(/text-\[([^\]]+)\]/);
    if (arbitraryMatch) {
       // Filter out known valid arbitrary values if any (e.g. strict design tokens)
       // But generally text-[12px] is what we want to catch.
       issues.push({
         file: filePath,
         line: index + 1,
         issue: `Arbitrary text size used: ${arbitraryMatch[0]}`
       });
    }

    // 3. Check for standard text sizes
    // Regex to match whole words starting with text-
    const textClasses = line.match(/\btext-(xs|sm|base|lg|[0-9]+xl)\b/g);
    if (textClasses) {
      // These are valid, so we don't flag them unless we want to enforce specific restrictions.
      // But we want to flag if they are used inconsistently with headings.
    }

    // 4. Check for Heading consistency
    // Simple regex for <h1 ... className="...">
    // This assumes opening tag and className are on the same line, which is common but not guaranteed.
    // To handle multiline, we'd need a state machine or full file scan.
    // For this audit, line-by-line is a reasonable approximation for "drift".
    const headingMatch = line.match(/<(h[1-6])\b[^>]*className=["']([^"']+)["']/);
    if (headingMatch) {
      const tag = headingMatch[1] as keyof typeof ALLOWED_HEADINGS;
      const classes = headingMatch[2].split(/\s+/);

      // Check if any allowed size class is present
      const hasAllowedSize = classes.some(c => ALLOWED_HEADINGS[tag].includes(c));

      // If no size class is present, maybe it inherits?
      // But we want explicit hierarchy.
      // If a size class is present but not in allowed list?
      const sizeClass = classes.find(c => c.startsWith('text-') && ALLOWED_SIZES.includes(c));

      if (sizeClass && !ALLOWED_HEADINGS[tag].includes(sizeClass)) {
         issues.push({
            file: filePath,
            line: index + 1,
            issue: `Heading <${tag}> uses inconsistent size: ${sizeClass}. Expected one of: ${ALLOWED_HEADINGS[tag].join(', ')}`,
            element: tag
         });
      } else if (!sizeClass && !classes.some(c => c.startsWith('text-'))) {
          // No text size class. Might be okay if styled by parent or global, but risky.
          // We can flag it as "Unsized heading".
          // But maybe too noisy.
      }
    }
  });
}

function traverseDir(dir: string) {
  if (!fs.existsSync(dir)) return;
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
  // Sort by file and line
  issues.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  issues.forEach(i => {
    report += `| ${i.file} | ${i.line} | ${i.issue} |\n`;
  });
}

fs.writeFileSync('typography-drift-report.md', report);
console.log('Typography Audit Complete. Report saved to typography-drift-report.md');
