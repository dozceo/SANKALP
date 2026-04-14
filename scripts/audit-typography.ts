
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
  recommendation?: string;
}

const issues: TypographyIssue[] = [];
const stats = {
  adHocCount: 0,
  headingConsistency: 0,
  inlineStyles: 0
};

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // 1. Check for inline styles affecting font size
    if (line.includes('style={{') && line.includes('fontSize')) {
      issues.push({
        file: filePath,
        line: index + 1,
        issue: 'Inline style used for fontSize.',
        recommendation: 'Use Tailwind classes (e.g., text-sm, text-base).'
      });
      stats.inlineStyles++;
    }

    // 2. Check for arbitrary text sizes in className
    const arbitraryMatch = line.match(/text-\[([^\]]+)\]/);
    if (arbitraryMatch) {
       const val = arbitraryMatch[1];
       let rec = 'Use standard token';
       // Suggest closest token if pixel value
       if (val.endsWith('px')) {
         const px = parseInt(val, 10);
         if (px < 14) rec = 'Consider text-xs or text-sm';
         else if (px < 16) rec = 'Consider text-sm';
         else if (px < 18) rec = 'Consider text-base';
         else if (px < 20) rec = 'Consider text-lg';
         else rec = 'Consider text-xl+';
       }

       issues.push({
         file: filePath,
         line: index + 1,
         issue: `Arbitrary text size used: ${arbitraryMatch[0]}`,
         recommendation: rec
       });
       stats.adHocCount++;
    }

    // 4. Check for Heading consistency
    const headingMatch = line.match(/<(h[1-6])\b[^>]*className=["']([^"']+)["']/);
    if (headingMatch) {
      const tag = headingMatch[1] as keyof typeof ALLOWED_HEADINGS;
      const classes = headingMatch[2].split(/\s+/);

      const hasAllowedSize = classes.some(c => ALLOWED_HEADINGS[tag].includes(c));
      const sizeClass = classes.find(c => c.startsWith('text-') && ALLOWED_SIZES.includes(c));

      if (sizeClass && !ALLOWED_HEADINGS[tag].includes(sizeClass)) {
         issues.push({
            file: filePath,
            line: index + 1,
            issue: `Heading <${tag}> uses inconsistent size: ${sizeClass}.`,
            element: tag,
            recommendation: `Expected one of: ${ALLOWED_HEADINGS[tag].join(', ')}`
         });
         stats.headingConsistency++;
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

report += '## Executive Summary\n';
report += `- **Ad-hoc Font Sizes**: ${stats.adHocCount} instances (Use of arbitrary values like \`text-[12px]\`)\n`;
report += `- **Heading Inconsistencies**: ${stats.headingConsistency} instances (Headings violating type scale)\n`;
report += `- **Inline Styles**: ${stats.inlineStyles} instances\n\n`;

report += '## Recommendations\n';
report += '1. **Standardize Headings**: Ensure all headings follow the design system (H1 -> text-4xl+, H2 -> text-3xl, etc.).\n';
report += '2. **Eliminate Arbitrary Values**: Replace `text-[...]` with standard Tailwind classes (`text-sm`, `text-base`, etc.) to maintain rhythm.\n';
report += '3. **Remove Inline Styles**: Move all font styling to Tailwind classes.\n\n';

if (issues.length === 0) {
  report += 'No typography issues found.\n';
} else {
  report += '## Detailed Findings\n';
  report += '| File | Line | Issue | Recommendation |\n|---|---|---|---|\n';
  issues.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  issues.forEach(i => {
    report += `| ${i.file} | ${i.line} | ${i.issue} | ${i.recommendation || ''} |\n`;
  });
}

const outputPath = 'reports/TYPOGRAPHY_DRIFT_REPORT.md';
fs.writeFileSync(outputPath, report);
console.log(`Typography Audit Complete. Report saved to ${outputPath}`);
