import fs from 'fs';
import path from 'path';

const TARGET_DIRS = ['src/app', 'src/components'];
const REPORT_FILE = 'I18N_READINESS_REPORT.md';

function scanDirectory(dir: string, fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanDirectory(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function analyzeFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Heuristic regexes for hardcoded strings

  // 1. Text between tags: >Some Text<
  // We exclude whitespace-only strings
  // We exclude strings that are just likely numbers or symbols
  // We use [^<>{}] to avoid capturing content with curlies inside, though nested tags might be an issue.
  // This is a simple audit, so false negatives are acceptable, we want to catch the obvious ones.
  const textContentRegex = />\s*([a-zA-Z0-9][^<>{}]*[a-zA-Z0-9])\s*</g;

  // 2. Common attributes: placeholder="Some Text", title="Some Text", alt="Some Text", label="Some Text"
  // We look for double quotes
  const attributeRegex = /(placeholder|title|alt|label|aria-label)\s*=\s*"([^"{}]*[a-zA-Z]+[^"{} ৮ম]*)"/g;

  let hardcodedStrings: string[] = [];
  let match;

  while ((match = textContentRegex.exec(content)) !== null) {
      // Exclude if it looks like a variable reference (simple check)
      if (!match[1].includes('{') && !match[1].includes('}')) {
          hardcodedStrings.push(match[1].trim());
      }
  }

  while ((match = attributeRegex.exec(content)) !== null) {
      hardcodedStrings.push(`${match[1]}="${match[2]}"`);
  }

  return {
    filePath,
    hardcodedStrings
  };
}

function generateReport(results: any[]) {
  let report = '# Internationalization (i18n) Readiness Report\n\n';
  report += 'This report identifies potential hardcoded strings in JSX that need to be externalized for localization.\n\n';

  const filesWithIssues = results.filter(r => r.hardcodedStrings.length > 0);
  const totalStrings = filesWithIssues.reduce((sum, r) => sum + r.hardcodedStrings.length, 0);

  report += `## Summary\n`;
  report += `- Total Files Scanned: ${results.length}\n`;
  report += `- Files with Hardcoded Strings: ${filesWithIssues.length}\n`;
  report += `- Total Hardcoded Strings Detected: ${totalStrings}\n\n`;

  report += `## Files Requiring Attention\n`;

  if (filesWithIssues.length === 0) {
      report += "No obvious hardcoded strings found.\n";
  } else {
      // Sort by number of strings descending
      filesWithIssues.sort((a, b) => b.hardcodedStrings.length - a.hardcodedStrings.length);

      filesWithIssues.forEach(file => {
        report += `### ${file.filePath} (${file.hardcodedStrings.length} strings)\n`;
        // Show first 5 examples
        file.hardcodedStrings.slice(0, 5).forEach((s: string) => report += `- \`${s}\`\n`);
        if (file.hardcodedStrings.length > 5) report += `- ... and ${file.hardcodedStrings.length - 5} more\n`;
        report += '\n';
      });
  }

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated at ${REPORT_FILE}`);
}

let allFiles: string[] = [];
TARGET_DIRS.forEach(dir => {
    allFiles = scanDirectory(dir, allFiles);
});

const results = allFiles.map(analyzeFile);
generateReport(results);
