import fs from 'fs';
import path from 'path';

const TARGET_DIR = path.join(process.cwd(), 'src', 'app', '(auth)');
const OUTPUT_FILE = 'STUDENT_ONBOARDING_FRICTION_REPORT.md';

function scanDirectory(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(scanDirectory(filePath));
    } else if (file.endsWith('.tsx')) {
      results.push(filePath);
    }
  });
  return results;
}

function analyzeFile(filePath: string): {
  inputCount: number,
  validationComplexity: number,
  instructionDensity: number
} {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Count inputs
  const inputCount = (content.match(/<(Input|Select|Textarea|Checkbox|Radio)/g) || []).length;

  // Count validation logic (heuristic: look for zod resolver or required/pattern attributes)
  const validationComplexity = (content.match(/(z\.|required|pattern=|minLength|maxLength)/g) || []).length;

  // Count instruction text (p tags or span tags with text)
  const instructionDensity = (content.match(/<(p|span|Label)[^>]*>/g) || []).length;

  return { inputCount, validationComplexity, instructionDensity };
}

function generateReport() {
  const files = scanDirectory(TARGET_DIR);
  let report = '# Student Onboarding Flow Friction Report\n\n';
  report += 'This report identifies potential friction points in the student onboarding flow.\n\n';

  let frictionPoints = 0;

  files.forEach(file => {
    const analysis = analyzeFile(file);
    const relativePath = path.relative(process.cwd(), file);

    // Heuristic for friction: > 4 inputs OR high validation complexity relative to inputs
    const isHighFriction = analysis.inputCount > 4 || (analysis.validationComplexity > 5 && analysis.inputCount > 2);

    if (isHighFriction) {
      report += `## ${relativePath}\n`;
      report += `- **Form Length**: ${analysis.inputCount} inputs\n`;
      report += `- **Validation Load**: ${analysis.validationComplexity} validation checks\n`;
      report += `- **Guidance**: ${analysis.instructionDensity} instruction elements\n`;
      report += `- **Risk**: 🔴 High Friction - Potential Drop-off Point\n\n`;
      frictionPoints++;
    } else if (analysis.inputCount > 0) {
        report += `## ${relativePath}\n`;
        report += `- **Form Length**: ${analysis.inputCount} inputs\n`;
        report += `- **Risk**: 🟢 Low Friction\n\n`;
    }
  });

  if (frictionPoints === 0) {
    report += 'No critical friction points detected.\n';
  } else {
    report += `\n**Total High Friction Points:** ${frictionPoints}\n`;
  }

  report += `\n## Optimization Recommendations
1.  **Multi-Step Forms**: Break long forms (>4 inputs) into multiple steps.
2.  **Inline Validation**: Provide immediate feedback rather than on-submit errors.
3.  **Social Login**: Reduce friction by offering Google/GitHub login options.
`;

  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(`Report generated at ${OUTPUT_FILE}`);
}

generateReport();
