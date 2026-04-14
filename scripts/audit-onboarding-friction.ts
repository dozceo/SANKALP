
import fs from 'fs';
import path from 'path';

const TARGET_DIR = path.join(process.cwd(), 'src/app/(auth)');
const REPORT_FILE = path.join(process.cwd(), 'reports', 'STUDENT_ONBOARDING_FRICTION_REPORT.md');

interface FileReport {
  filepath: string;
  inputCount: number;
  hasValidation: boolean;
  hasNavigation: boolean;
  frictionScore: number;
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

  // Count inputs
  const inputMatches = content.match(/<(Input|Select|Textarea|RadioGroup)/g);
  const inputCount = inputMatches ? inputMatches.length : 0;

  // Check for validation
  const hasValidation = content.includes('zod') || content.includes('useForm') || content.includes('required') || content.includes('aria-invalid');

  // Check for navigation
  const hasNavigation = content.includes('Link') || content.includes('router.push') || content.includes('redirect');

  // Friction Score: Inputs + (No Validation ? 5 : 0) + (No Navigation ? 10 : 0)
  let frictionScore = inputCount;
  if (!hasValidation && inputCount > 0) frictionScore += 5; // Risk of user error without feedback
  if (!hasNavigation) frictionScore += 10; // Dead end

  if (inputCount === 0 && !hasNavigation) return null; // Likely a layout or utility file

  return {
    filepath: path.relative(process.cwd(), filepath),
    inputCount,
    hasValidation,
    hasNavigation,
    frictionScore
  };
}

function generateReport(reports: FileReport[]) {
  // Sort by friction descending
  reports.sort((a, b) => b.frictionScore - a.frictionScore);

  let markdown = '# Student Onboarding Flow Friction Point Detection\n\n';
  markdown += 'This report identifies potential friction points in the onboarding flow based on form complexity, validation gaps, and navigation dead ends.\n\n';

  markdown += `## Summary\n`;
  markdown += `- Total Steps Analyzed: ${reports.length}\n`;
  markdown += `- High Friction Steps (>10 score): ${reports.filter(r => r.frictionScore > 10).length}\n\n`;

  markdown += `## Friction Analysis\n`;
  markdown += `Higher scores indicate higher potential for user drop-off.\n\n`;

  markdown += `| Filepath | Friction Score | Inputs | Validation | Navigation |\n`;
  markdown += `| :--- | :--- | :--- | :--- | :--- |\n`;

  reports.forEach(r => {
    const validationIcon = r.hasValidation ? '✅' : '❌';
    const navigationIcon = r.hasNavigation ? '✅' : '❌';

    markdown += `| \`${r.filepath}\` | **${r.frictionScore}** | ${r.inputCount} | ${validationIcon} | ${navigationIcon} |\n`;
  });

  markdown += `\n## Recommendations\n`;
  markdown += `1. **Break Up Long Forms**: Steps with > 5 inputs should be split into multi-step wizards.\n`;
  markdown += `2. **Ensure Validation**: All forms must have client-side validation (Zod/React Hook Form) to prevent frustration.\n`;
  markdown += `3. **Clear Navigation**: Ensure every screen has a clear 'Next' or 'Back' action.\n`;

  const reportDir = path.dirname(REPORT_FILE);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(REPORT_FILE, markdown);
  console.log(`Report generated at ${REPORT_FILE}`);
}

const files = scanDirectory(TARGET_DIR);
const reports: FileReport[] = [];

files.forEach(file => {
  const report = analyzeFile(file);
  if (report) {
    reports.push(report);
  }
});

generateReport(reports);
