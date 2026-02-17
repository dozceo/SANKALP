import fs from 'fs';
import path from 'path';

// --- Configuration ---
const README_PATH = 'README.md';
const OUTPUT_REPORT = 'DOC_DRIFT_REPORT.md';

const FEATURE_CHECKS = [
  {
    feature: 'Mindful Mentor',
    claim: 'Implements AI tutor functionality',
    evidenceFile: 'src/ai/flows/mindful-mentor.ts',
    expectedContent: 'mindfulMentorFlow',
    type: 'existence',
  },
  {
    feature: 'Teacher Dashboard',
    claim: 'Provides teacher analytics and class management',
    evidenceFile: 'src/app/(main)/teacher',
    expectedContent: '', // Directory check
    type: 'directory',
  },
  {
    feature: 'Syllabus Generator',
    claim: 'Generates structured syllabi based on exam names',
    evidenceFile: 'src/ai/flows/syllabus-generator.ts',
    expectedContent: 'syllabusGeneratorFlow',
    type: 'existence',
  },
  {
    feature: 'Adaptive Quiz Engine',
    claim: 'Generates quizzes adapted to student weak areas',
    evidenceFile: 'src/ai/flows/adaptive-quiz-engine.ts',
    expectedContent: 'adaptiveQuizFlow',
    type: 'existence',
  },
  {
    feature: 'Database Integration',
    claim: 'Firebase integration for data persistence',
    evidenceFile: 'src/lib/firebase.ts',
    expectedContent: 'getFirestore',
    type: 'existence',
  },
  {
    feature: 'ML Inference Bridge',
    claim: 'Python scripts executed via Node.js subprocess',
    evidenceFile: 'src/ml/inference/ml-bridge.ts',
    expectedContent: 'spawn',
    type: 'existence',
  }
];

// --- Helper Functions ---

function checkFileExists(filepath: string): boolean {
  return fs.existsSync(filepath);
}

function analyzeFileContent(filepath: string, pattern: string): { valid: boolean, skeletal: boolean, reason?: string } {
  try {
    const content = fs.readFileSync(filepath, 'utf-8');

    // Check for skeletal indicators
    if (content.length < 100) {
        return { valid: true, skeletal: true, reason: 'File is too small (< 100 bytes)' };
    }

    if (pattern && !content.includes(pattern)) {
        return { valid: false, skeletal: false, reason: `Pattern '${pattern}' not found` };
    }

    return { valid: true, skeletal: false };
  } catch (e) {
    return { valid: false, skeletal: false, reason: 'Read error' };
  }
}

function generateReport(results: any[]) {
  let report = `# Documentation Drift Report\n\nGenerated on: ${new Date().toISOString()}\n\n`;
  report += `This report identifies discrepancies between documentation claims (README.md) and the actual codebase state.\n\n`;

  report += `| Feature | Doc Claim | Code Reality | Status |\n`;
  report += `|---|---|---|---|\n`;

  let driftCount = 0;

  results.forEach(res => {
    if (res.status === 'DRIFT DETECTED') driftCount++;
    report += `| ${res.feature} | ${res.claim} | ${res.reality} | ${res.status} |\n`;
  });

  report += `\n## Detailed Findings\n\n`;
  results.forEach(res => {
    if (res.status === 'DRIFT DETECTED') {
      report += `### ${res.feature}\n`;
      report += `- **Claim**: ${res.claim}\n`;
      report += `- **Reality**: ${res.reality}\n`;
      report += `- **Evidence**: Checked \`${res.evidenceFile}\`\n\n`;
    }
  });

  report += `\n**Summary:**\n- Features Checked: ${results.length}\n- Drifts Detected: ${driftCount}\n`;

  fs.writeFileSync(OUTPUT_REPORT, report);
  console.log(`Report generated at ${OUTPUT_REPORT}`);
}

// --- Main Execution ---

function main() {
  console.log('Starting Documentation Drift Audit...');

  const results = [];

  for (const check of FEATURE_CHECKS) {
    let reality = '';
    let status = 'VERIFIED';

    const exists = checkFileExists(check.evidenceFile);

    if (check.type === 'existence') {
        if (exists) {
            const analysis = analyzeFileContent(check.evidenceFile, check.expectedContent);
            if (analysis.skeletal) {
                reality = `Implemented but Skeletal (${analysis.reason})`;
                status = 'DRIFT DETECTED';
            } else if (analysis.valid) {
                reality = 'Implemented & Functional';
            } else {
                reality = `File exists but content missing pattern: '${check.expectedContent}'`;
                status = 'DRIFT DETECTED';
            }
        } else {
            reality = 'File missing';
            status = 'DRIFT DETECTED';
        }
    } else if (check.type === 'directory') {
         if (exists) {
             // For directory, we just check existence for now.
             // Could verify it's not empty.
             const files = fs.readdirSync(check.evidenceFile);
             if (files.length > 0) {
                 reality = `Implemented (Directory with ${files.length} files)`;
             } else {
                 reality = 'Directory empty';
                 status = 'DRIFT DETECTED';
             }
         } else {
             reality = 'Directory missing';
             status = 'DRIFT DETECTED';
         }
    }

    results.push({
      feature: check.feature,
      claim: check.claim,
      reality: reality,
      status: status,
      evidenceFile: check.evidenceFile
    });
  }

  generateReport(results);
}

main();
