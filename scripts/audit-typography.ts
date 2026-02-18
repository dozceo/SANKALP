import fs from 'fs';
import path from 'path';

const TARGET_DIRS = ['src/app', 'src/components'];
const OUTPUT_FILE = 'typography-drift-report.md';

interface TypographyIssue {
  file: string;
  line: number;
  issue: string;
}

const issues: TypographyIssue[] = [];

// Standard Tailwind text sizes
const STANDARD_SIZES = [
  'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl',
  'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl',
  'text-7xl', 'text-8xl', 'text-9xl'
];

// Recommended sizes for headings (loose check for consistency)
const HEADING_RECOMMENDATIONS: Record<string, string[]> = {
  h1: ['text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl'],
  h2: ['text-3xl', 'text-4xl', 'text-5xl'],
  h3: ['text-2xl', 'text-3xl', 'text-4xl'],
  h4: ['text-xl', 'text-2xl', 'text-3xl'],
  h5: ['text-lg', 'text-xl', 'text-2xl'],
  h6: ['text-base', 'text-lg', 'text-xl'],
};

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // 1. Check for inline style fontSize
    if (line.includes('style={{') && line.includes('fontSize')) {
      issues.push({
        file: filePath,
        line: lineNum,
        issue: 'Inline style used for fontSize. Use Tailwind classes instead.'
      });
    }

    // 2. Check for arbitrary text sizes in className (text-[...])
    const arbitraryMatch = line.match(/text-\[([^\]]+)\]/);
    if (arbitraryMatch) {
      const val = arbitraryMatch[1];
      // allow arbitrary if it's a CSS variable (starts with var)
      if (!val.startsWith('var')) {
        issues.push({
          file: filePath,
          line: lineNum,
          issue: `Arbitrary text size used: text-[${val}]`
        });
      }
    }

    // 3. Check for Heading consistency
    // Simple regex for <h1 ... className="...">
    // Matches <h1 className="..."> or <h1 ... className="...">
    const headingMatch = line.match(/<(h[1-6])\b[^>]*className=["']([^"']+)["']/);
    if (headingMatch) {
      const tag = headingMatch[1] as keyof typeof HEADING_RECOMMENDATIONS;
      const classes = headingMatch[2].split(/\s+/);

      // check if any text size class is present
      const sizeClass = classes.find(c => c.startsWith('text-') && STANDARD_SIZES.includes(c));

      if (sizeClass) {
        if (!HEADING_RECOMMENDATIONS[tag].includes(sizeClass)) {
             issues.push({
                file: filePath,
                line: lineNum,
                issue: `Heading <${tag}> uses inconsistent size: ${sizeClass}. Recommended: ${HEADING_RECOMMENDATIONS[tag].join(', ')}`
             });
        }
      } else {
        // No size class found. Might be styled by global CSS or parent.
        // We can flag as potential issue or just info.
        // Let's flag if it has other classes but no size, suggesting it might rely on defaults which might be too small for high level headings.
        // But purely unstyled headings might be intentional (inheriting).
        // However, prompt asks for "established type scale".
        // We'll skip flagging missing size to avoid noise, unless it's h1/h2 which usually need explicit size in Tailwind reset.
        if (tag === 'h1' || tag === 'h2') {
             // Check if it has 'prose' or similar which handles typography?
             if (!classes.some(c => c.includes('prose'))) {
                 // issues.push({ file: filePath, line: lineNum, issue: `<${tag}> has no explicit text size class.` });
             }
        }
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
TARGET_DIRS.forEach(dir => traverseDir(dir));

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

report += `\n## Recommendations
1. **Standardize Headings**: Ensure all heading levels use consistent font sizes.
2. **Eliminate Arbitrary Values**: Replace \`text-[...]\` with standard Tailwind classes or define theme tokens.
3. **Avoid Inline Styles**: Use utility classes for font sizing.
`;

fs.writeFileSync(OUTPUT_FILE, report);
console.log(`Typography Audit Complete. Report saved to ${OUTPUT_FILE}`);
