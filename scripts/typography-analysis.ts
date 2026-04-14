import fs from 'fs';
import path from 'path';

const TARGET_DIRS = ['src/app', 'src/components'];
const OUTPUT_FILE = 'typography-drift-report.md';

interface TypographyUsage {
  file: string;
  class: string;
}

interface HeadingUsage {
    level: string;
    classes: string[];
    file: string;
}

const typographyUsage: TypographyUsage[] = [];
const headingUsage: HeadingUsage[] = [];

function scanFile(filePath: string) {
  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    console.error(`Error reading file ${filePath}:`, e);
    return;
  }

  // Regex to find className attributes
  // Matches className="class1 class2" or className='class1 class2'
  const classNameRegex = /className=["']([^"']+)["']/g;
  let match;

  while ((match = classNameRegex.exec(content)) !== null) {
    const classNames = match[1].split(/\s+/);
    classNames.forEach(cls => {
      // Check for standard font sizes
      if (/^text-(xs|sm|base|lg|xl|[2-9]?xl)$/.test(cls)) {
        typographyUsage.push({ file: filePath, class: cls });
      }
      // Check for arbitrary values
      else if (cls.startsWith('text-[')) {
        const value = cls.slice(6, -1);
        // Heuristic: if it looks like a color (starts with #, rgb, hsl) ignore it.
        // We want sizes: px, rem, em, %
        if (/^#|^rgb|^hsl/.test(value)) {
            // Likely color
        } else if (/^\d+(\.\d+)?(px|rem|em|vh|vw|%)$/.test(value)) {
            // Likely size
            typographyUsage.push({ file: filePath, class: cls });
        } else {
            // Ambiguous, include it just in case
             typographyUsage.push({ file: filePath, class: cls });
        }
      }
    });
  }

  // Regex to find Headings
  // This is a simple regex and might miss some cases or match false positives
  const headingRegex = /<h([1-6])\b([^>]*)>/g;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1];
    const attributes = match[2];

    // Extract className from attributes
    const classMatch = /className=["']([^"']+)["']/.exec(attributes);
    if (classMatch) {
        const classes = classMatch[1].split(/\s+/);
        headingUsage.push({ level: `h${level}`, classes, file: filePath });
    } else {
        headingUsage.push({ level: `h${level}`, classes: [], file: filePath });
    }
  }
}

function traverseDir(dir: string) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDir(fullPath);
    } else if (file.endsWith('.tsx')) {
      scanFile(fullPath);
    }
  });
}

// Start scanning
TARGET_DIRS.forEach(dir => {
    traverseDir(dir);
});

// Analyze results
const sizeFrequency: Record<string, number> = {};
const arbitrarySizes: TypographyUsage[] = [];

typographyUsage.forEach(usage => {
  sizeFrequency[usage.class] = (sizeFrequency[usage.class] || 0) + 1;
  if (usage.class.startsWith('text-[')) {
    arbitrarySizes.push(usage);
  }
});

// Generate Report
let report = `# Typography Drift Report

## 1. Font Size Usage Frequency
Total instances found: ${typographyUsage.length}

| Class Name | Frequency |
| :--- | :--- |
${Object.entries(sizeFrequency)
  .sort(([, a], [, b]) => b - a)
  .map(([cls, count]) => `| \`${cls}\` | ${count} |`)
  .join('\n')}

## 2. Ad-hoc Font Sizes (Arbitrary Values)
These are deviations from the design system's type scale.

${arbitrarySizes.length === 0 ? 'No arbitrary font sizes found.' :
`| File | Class |
| :--- | :--- |
${arbitrarySizes.map(u => `| \`${u.file}\` | \`${u.class}\` |`).join('\n')}`}

## 3. Heading Hierarchy Consistency
Checking usage of \`h1\`-\`h6\` tags and their applied typography classes.

`;

const headingsByLevel: Record<string, HeadingUsage[]> = {};
['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(level => {
  headingsByLevel[level] = headingUsage.filter(h => h.level === level);
});

Object.keys(headingsByLevel).forEach(level => {
  report += `### ${level.toUpperCase()}\n`;
  if (headingsByLevel[level].length === 0) {
    report += `No \`<${level}>\` tags found.\n\n`;
  } else {
    report += `| File | Typography Classes |
| :--- | :--- |
${headingsByLevel[level].map(h => {
    const typeClasses = h.classes.filter(c => /^text-(xs|sm|base|lg|xl|[2-9]?xl)$/.test(c) || c.startsWith('text-['));
    return `| \`${h.file}\` | \`${typeClasses.length > 0 ? typeClasses.join(', ') : '(inherited/default)'}\` |`;
}).join('\n')}
\n`;
  }
});

report += `\n## Recommendations
1. **Standardize Headings**: Ensure all heading levels use consistent font sizes (e.g., \`h1\` -> \`text-4xl\`, \`h2\` -> \`text-3xl\`).
2. **Eliminate Arbitrary Values**: Replace \`text-[...]\` with the nearest standard Tailwind class or define a new theme token.
3. **Use Semantic Components**: Instead of \`div\` or \`p\` with large text, use appropriate heading tags.
`;

fs.writeFileSync(OUTPUT_FILE, report);
console.log(`Report generated: ${OUTPUT_FILE}`);
