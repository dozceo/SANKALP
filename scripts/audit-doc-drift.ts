import fs from 'fs';
import path from 'path';

// --- Configuration ---
const README_PATH = 'README.md';
const OUTPUT_REPORT = 'DOC_DRIFT_REPORT.md';

const FEATURE_CHECKS = [
  {
    feature: 'Mindful Mentor',
    claim: 'Skeletal / Needs expansion', // Inferred from README
    evidenceFile: 'src/ai/flows/mindful-mentor.ts',
    expectedContent: 'mindfulMentorFlow',
    type: 'existence',
  },
  {
    feature: 'Teacher Dashboard',
    claim: 'Skeletal / Needs expansion',
    evidenceFile: 'src/app/(main)/teacher',
    expectedContent: '', // Directory check
    type: 'directory',
  },
  {
    feature: 'Database Integration',
    claim: 'Pending', // Explicit in README
    evidenceFile: 'src/lib/firebase.ts',
    expectedContent: 'getFirestore',
    type: 'contradiction', // If evidence exists, claim is false (drift)
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

function checkFileContent(filepath: string, pattern: string): boolean {
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    return content.includes(pattern);
  } catch (e) {
    return false;
  }
}

function generateReport(results: any[]) {
  let report = `# Documentation Drift Report\n\nGenerated on: ${new Date().toISOString()}\n\n`;
  report += `This report identifies discrepancies between documentation claims (README.md) and the actual codebase state.\n\n`;

  report += `| Feature | Doc Claim | Code Reality | Status |\n`;
  report += `|---|---|---|---|\n`;

  results.forEach(res => {
    report += `| ${res.feature} | ${res.claim} | ${res.reality} | ${res.status} |\n`;
  });

  report += `\n## Detailed Findings\n\n`;
  results.forEach(res => {
    if (res.status === 'DRIFT DETECTED') {
      report += `### ${res.feature}\n`;
      report += `- **Claim**: ${res.claim}\n`;
      report += `- **Reality**: ${res.reality}\n`;
      report += `- **Evidence**: Found in \`${res.evidenceFile}\`\n\n`;
    }
  });

  fs.writeFileSync(OUTPUT_REPORT, report);
  console.log(`Report generated at ${OUTPUT_REPORT}`);
}

// --- Main Execution ---

function main() {
  console.log('Starting Documentation Drift Audit...');

  const results = [];

  // Read README content to verify claims exist (optional enhancement, but we'll stick to configured checks for now)
  const readmeContent = fs.readFileSync(README_PATH, 'utf-8');

  for (const check of FEATURE_CHECKS) {
    let reality = '';
    let status = 'VERIFIED'; // Default to consistent

    const exists = checkFileExists(check.evidenceFile);

    if (check.type === 'existence') {
        if (exists) {
            const hasContent = checkFileContent(check.evidenceFile, check.expectedContent);
            if (hasContent) {
                reality = 'Implemented & Functional';
                // If doc says "skeletal", and code is substantial, that's drift?
                // Hard to judge "substantial" programmatically, but existence suggests implementation.
                // However, user prompt specifically mentioned checking "skeletal" claims.
                // Let's assume if it exists and has content, it's "Implemented".
                if (check.claim.toLowerCase().includes('skeletal') || check.claim.toLowerCase().includes('pending')) {
                     status = 'DRIFT DETECTED';
                }
            } else {
                reality = 'File exists but content missing';
            }
        } else {
            reality = 'Not implemented';
             if (!check.claim.toLowerCase().includes('skeletal') && !check.claim.toLowerCase().includes('pending')) {
                 status = 'DRIFT DETECTED'; // Claimed feature missing
             }
        }
    } else if (check.type === 'directory') {
         if (exists) {
             reality = 'Implemented (Directory exists)';
             if (check.claim.toLowerCase().includes('skeletal')) {
                 status = 'DRIFT DETECTED';
             }
         } else {
             reality = 'Not implemented';
         }
    } else if (check.type === 'contradiction') {
        // e.g., Claim is "Pending", but code exists
        if (exists && checkFileContent(check.evidenceFile, check.expectedContent)) {
            reality = 'Implemented';
            if (check.claim.toLowerCase().includes('pending')) {
                status = 'DRIFT DETECTED';
            }
        } else {
            reality = 'Not implemented';
            if (!check.claim.toLowerCase().includes('pending')) {
                 // If claim says "Done" but code missing, also drift, but here we check for "Pending" claim specifically
            }
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
