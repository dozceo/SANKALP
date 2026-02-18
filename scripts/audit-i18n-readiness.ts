import fs from 'fs';
import path from 'path';

const TARGET_DIRS = [
  path.join(process.cwd(), 'src', 'app'),
  path.join(process.cwd(), 'src', 'components')
];
const OUTPUT_FILE = 'I18N_READINESS_REPORT.md';

function scanDirectory(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(scanDirectory(filePath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(filePath);
    }
  });
  return results;
}

function analyzeFile(filePath: string): { hardcodedStrings: string[] } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const hardcodedStrings: string[] = [];

  // Regex to find text between JSX tags that isn't just whitespace or brackets
  const textNodeRegex = />([^<{]+)</g;
  let match;
  while ((match = textNodeRegex.exec(content)) !== null) {
    const text = match[1].trim();
    // Improved filtering to reduce false positives
    if (
      text.length > 1 && // Ignore single chars unless meaningful (hard to tell, safe to skip for noise reduction)
      /[a-zA-Z]/.test(text) && // Must contain at least one letter
      !/^[{}();,.[\]]+$/.test(text) && // Must not be just punctuation
      !text.startsWith(');') &&
      !text.startsWith('})') &&
      !text.startsWith(']') &&
      !text.includes('React.') && // Exclude likely code references
      !text.includes('=>') && // Exclude arrow functions
      !text.includes('return ') // Exclude return statements
    ) {
      hardcodedStrings.push(text);
    }
  }

  // Regex for specific attributes
  const attrRegex = /(?:placeholder|title|alt|aria-label)="([^"]+)"/g;
  while ((match = attrRegex.exec(content)) !== null) {
    // attributes usually contain real text, but let's be safe
    const text = match[1].trim();
    if (text.length > 0 && /[a-zA-Z]/.test(text)) {
        hardcodedStrings.push(text);
    }
  }

  return { hardcodedStrings };
}

function generateReport() {
  let report = '# i18n Readiness Assessment Report\n\n';
  report += 'This report identifies potential hardcoded user-facing strings that need externalization.\n\n';

  let totalStrings = 0;
  let fileCount = 0;

  TARGET_DIRS.forEach(dir => {
    const files = scanDirectory(dir);
    files.forEach(file => {
      const analysis = analyzeFile(file);
      if (analysis.hardcodedStrings.length > 0) {
        const relativePath = path.relative(process.cwd(), file);
        report += `## ${relativePath}\n`;
        report += `- **Hardcoded Strings Found**: ${analysis.hardcodedStrings.length}\n`;
        report += `- **Examples**: "${analysis.hardcodedStrings.slice(0, 3).join('", "')}"${analysis.hardcodedStrings.length > 3 ? '...' : ''}\n\n`;
        totalStrings += analysis.hardcodedStrings.length;
        fileCount++;
      }
    });
  });

  report += `\n**Total Files with Hardcoded Strings:** ${fileCount}\n`;
  report += `**Total Hardcoded Strings Detected:** ${totalStrings}\n`;

  report += `\n## Localization Effort Estimate
- **Low Effort**: < 50 strings. Can be manually extracted in a day.
- **Medium Effort**: 50-200 strings. Requires dedicated sprint task.
- **High Effort**: > 200 strings. Significant architectural change needed.
`;

  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(`Report generated at ${OUTPUT_FILE}`);
}

generateReport();
