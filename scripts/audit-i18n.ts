
import fs from 'fs';
import path from 'path';

const TARGET_DIRS = [
  path.join(process.cwd(), 'src/app'),
  path.join(process.cwd(), 'src/components')
];
const REPORT_FILE = path.join(process.cwd(), 'reports', 'I18N_READINESS_REPORT.md');

interface FileReport {
  filepath: string;
  hardcodedStrings: string[];
  attributeStrings: string[];
}

function scanDirectory(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(scanDirectory(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

function analyzeFile(filepath: string): FileReport | null {
  const content = fs.readFileSync(filepath, 'utf-8');
  const hardcodedStrings: string[] = [];
  const attributeStrings: string[] = [];

  // Regex for text content between tags: >Some Text<
  // We need to be careful not to capture >{variable}< or > <
  const textRegex = />([^<{]+)</g;
  let match;
  while ((match = textRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text.length > 0 && !/^\d+$/.test(text) && !/^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(text)) {
      // Filter out pure numbers and pure symbols
      hardcodedStrings.push(text);
    }
  }

  // Regex for specific attributes
  const attrRegex = /(placeholder|title|alt|aria-label|label)="([^"]+)"/g;
  while ((match = attrRegex.exec(content)) !== null) {
    const text = match[2].trim();
    if (text.length > 0) {
      attributeStrings.push(`${match[1]}: "${text}"`);
    }
  }

  if (hardcodedStrings.length === 0 && attributeStrings.length === 0) return null;

  return {
    filepath: path.relative(process.cwd(), filepath),
    hardcodedStrings,
    attributeStrings
  };
}

function generateReport(reports: FileReport[]) {
  let markdown = '# Internationalization (i18n) Readiness Assessment\n\n';
  markdown += 'This report identifies hardcoded strings in the codebase that need to be externalized for multi-language support.\n\n';

  const totalStrings = reports.reduce((acc, r) => acc + r.hardcodedStrings.length + r.attributeStrings.length, 0);

  markdown += `## Summary\n`;
  markdown += `- Files with Hardcoded Strings: ${reports.length}\n`;
  markdown += `- Total Strings to Externalize: ${totalStrings}\n\n`;

  markdown += `## Detailed Findings\n`;
  markdown += `The following files contain hardcoded user-facing text.\n\n`;

  reports.forEach(r => {
    markdown += `### \`${r.filepath}\`\n`;
    if (r.hardcodedStrings.length > 0) {
      markdown += `- **Text Content** (${r.hardcodedStrings.length}):\n`;
      r.hardcodedStrings.slice(0, 5).forEach(s => markdown += `  - "${s}"\n`);
      if (r.hardcodedStrings.length > 5) markdown += `  - ... and ${r.hardcodedStrings.length - 5} more\n`;
    }
    if (r.attributeStrings.length > 0) {
      markdown += `- **Attributes** (${r.attributeStrings.length}):\n`;
      r.attributeStrings.slice(0, 5).forEach(s => markdown += `  - ${s}\n`);
      if (r.attributeStrings.length > 5) markdown += `  - ... and ${r.attributeStrings.length - 5} more\n`;
    }
    markdown += '\n';
  });

  markdown += `## Recommendations\n`;
  markdown += `1. **Install i18n Library**: Use \`next-intl\` or \`react-i18next\`.\n`;
  markdown += `2. **Extract Strings**: Move the identified strings to JSON resource files (e.g., \`en.json\`).\n`;
  markdown += `3. **Replace with Keys**: Replace hardcoded strings with translation hooks (e.g., \`t('welcome_message')\`).\n`;

  const reportDir = path.dirname(REPORT_FILE);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(REPORT_FILE, markdown);
  console.log(`Report generated at ${REPORT_FILE}`);
}

let allFiles: string[] = [];
TARGET_DIRS.forEach(dir => {
  allFiles = allFiles.concat(scanDirectory(dir));
});

const reports: FileReport[] = [];
allFiles.forEach(file => {
  const report = analyzeFile(file);
  if (report) {
    reports.push(report);
  }
});

generateReport(reports);
