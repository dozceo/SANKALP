import fs from 'fs';
import path from 'path';

// --- Configuration ---
const README_PATH = 'README.md';
const OUTPUT_REPORT = 'DOC_DRIFT_REPORT.md';

const FEATURE_CHECKS = [
  {
    feature: 'Mindful Mentor',
    claim: 'Mindful Mentor',
    evidenceFile: 'src/ai/flows/mindful-mentor.ts',
    expectedContent: 'mindfulMentorFlow',
    type: 'existence',
  },
  {
    feature: 'Teacher Dashboard',
    claim: 'Teacher Analytics',
    evidenceFile: 'src/app/(main)/teacher',
    expectedContent: '', // Directory check
    type: 'directory',
  },
  {
    feature: 'Syllabus Generator',
    claim: 'Syllabus Generator',
    evidenceFile: 'src/ai/flows/syllabus-generator.ts',
    expectedContent: 'syllabusGeneratorFlow',
    type: 'existence',
  },
  {
    feature: 'Adaptive Quiz Engine',
    claim: 'Adaptive Quiz Engine',
    evidenceFile: 'src/ai/flows/adaptive-quiz-engine.ts',
    expectedContent: 'adaptiveQuizFlow',
    type: 'existence',
  },
  {
    feature: 'Database Integration',
    claim: 'Connected to Firebase Firestore',
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

function verifyReadmeClaim(readmeContent: string, claim: string): boolean {
    return readmeContent.includes(claim);
}

function generateReport(results: any[]) {
  let report = `# Documentation Drift Report\n\nGenerated on: ${new Date().toISOString()}\n\n`;
  report += `This report identifies discrepancies between documentation claims (README.md) and the actual codebase state.\n\n`;

  report += `| Feature | Doc Claim Status | Code Reality | Overall Status |\n`;
  report += `|---|---|---|---|\n`;

  let driftCount = 0;

  results.forEach(res => {
    if (res.status === 'DRIFT DETECTED' || res.docStatus === 'MISSING' || res.status === 'UNDOCUMENTED FEATURE') driftCount++;
    report += `| ${res.feature} | ${res.docStatus} | ${res.reality} | ${res.status} |\n`;
  });

  report += `\n## Detailed Findings\n\n`;
  results.forEach(res => {
    if (res.status === 'DRIFT DETECTED' || res.docStatus === 'MISSING' || res.status === 'UNDOCUMENTED FEATURE') {
      report += `### ${res.feature}\n`;
      report += `- **Claim Check**: Searched for "${res.claim}" in README. Result: ${res.docStatus}\n`;
      report += `- **Code Check**: Checked \`${res.evidenceFile}\`. Result: ${res.reality}\n`;
      if (res.reason) {
          report += `- **Details**: ${res.reason}\n`;
      }
      report += `\n`;
    }
  });

  report += `\n**Summary:**\n- Features Checked: ${results.length}\n- Issues Detected: ${driftCount}\n`;

  fs.writeFileSync(OUTPUT_REPORT, report);
  console.log(`Report generated at ${OUTPUT_REPORT}`);
}

// --- Main Execution ---

function main() {
  console.log('Starting Documentation Drift Audit...');

  if (!fs.existsSync(README_PATH)) {
      console.error('README.md not found!');
      process.exit(1);
  }

  const readmeContent = fs.readFileSync(README_PATH, 'utf-8');
  const results = [];

  for (const check of FEATURE_CHECKS) {
    let reality = '';
    let status = 'VERIFIED';
    let docStatus = 'FOUND';
    let reason = '';

    // 1. Verify Doc Claim
    if (!verifyReadmeClaim(readmeContent, check.claim)) {
        docStatus = 'MISSING';
        status = 'DRIFT DETECTED';
        reason = `Claim "${check.claim}" not found in README.`;
    }

    // 2. Verify Code
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
                reason = analysis.reason;
            }
        } else {
            reality = 'File missing';
            status = 'DRIFT DETECTED';
            reason = `File ${check.evidenceFile} does not exist.`;
        }
    } else if (check.type === 'directory') {
         if (exists) {
             const files = fs.readdirSync(check.evidenceFile);
             if (files.length > 0) {
                 reality = `Implemented (Directory with ${files.length} files)`;
             } else {
                 reality = 'Directory empty';
                 status = 'DRIFT DETECTED';
                 reason = `Directory ${check.evidenceFile} is empty.`;
             }
         } else {
             reality = 'Directory missing';
             status = 'DRIFT DETECTED';
             reason = `Directory ${check.evidenceFile} does not exist.`;
         }
    }

    if (docStatus === 'MISSING' && !reality.includes('missing') && !reality.includes('Directory missing')) {
        status = 'UNDOCUMENTED FEATURE';
    }

    results.push({
      feature: check.feature,
      claim: check.claim,
      docStatus: docStatus,
      reality: reality,
      status: status,
      evidenceFile: check.evidenceFile,
      reason: reason
    });
  }

  generateReport(results);
}

main();
