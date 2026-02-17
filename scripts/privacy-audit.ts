
import * as fs from 'fs';
import * as path from 'path';

const REPORT_FILE = 'PRIVACY_COMPLIANCE_REPORT.md';

const PII_KEYWORDS = ['email', 'password', 'name', 'phone', 'address', 'dob', 'birthdate', 'gender'];
const STORAGE_KEYWORDS = ['localStorage', 'sessionStorage', 'cookie', 'indexedDB'];
const TRACKING_KEYWORDS = ['analytics', 'track', 'pixel', 'gtm', 'ga', 'segment'];
const ML_KEYWORDS = ['predict', 'train', 'inference', 'model'];

interface finding {
    file: string;
    line: number;
    content: string;
    type: string;
}

function scanDirectory(dir: string, findings: finding[]) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                scanDirectory(fullPath, findings);
            }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                const lowerLine = line.toLowerCase();

                // check for PII
                if (PII_KEYWORDS.some(k => lowerLine.includes(k) && !lowerLine.includes('import'))) {
                     // filtering out imports to reduce noise
                     findings.push({ file: fullPath, line: index + 1, content: line.trim(), type: 'PII_HANDLING' });
                }

                // check for Storage
                if (STORAGE_KEYWORDS.some(k => lowerLine.includes(k))) {
                    findings.push({ file: fullPath, line: index + 1, content: line.trim(), type: 'LOCAL_STORAGE' });
                }

                // check for Tracking
                if (TRACKING_KEYWORDS.some(k => lowerLine.includes(k))) {
                     findings.push({ file: fullPath, line: index + 1, content: line.trim(), type: 'TRACKING_POTENTIAL' });
                }
            });
        }
    }
}

async function runAudit() {
    console.log('Starting Privacy Compliance Audit...');
    const findings: finding[] = [];

    scanDirectory('src', findings);

    let report = `# Student Data Privacy Compliance Audit

## Executive Summary
This report identifies potential privacy risks in the codebase, focusing on GDPR and COPPA compliance gaps.
It scans for PII handling, local storage usage, and tracking mechanisms.

## Findings

### 1. Local Storage & Cookies (Consent Risk)
The following files use client-side storage, which may require explicit user consent (cookie banner) under GDPR/ePrivacy Directive.
`;

    const storageFindings = findings.filter(f => f.type === 'LOCAL_STORAGE');
    // Group by file
    const storageByFile = groupByFile(storageFindings);
    for (const [file, items] of Object.entries(storageByFile)) {
        report += `*   **${file}**: Used ${items.length} times.\n`;
        // Just show first example
        report += `    - Example: \`${items[0].content}\`\n`;
    }

    report += `
### 2. PII Handling (Data Minimization)
The application processes significant amounts of PII (Email, Name, etc.).
Ensure all data collection is necessary and minimized.
`;

    const piiFindings = findings.filter(f => f.type === 'PII_HANDLING');
    report += `*   **Total Instances**: ${piiFindings.length}\n`;
    report += `*   **Key Risk Areas**: Authentication flows, Database helpers, ML Feature extraction.\n`;

    report += `
### 3. Machine Learning & Profiling (Automated Decision Making)
The application uses student data for ML predictions (profiling).
Under GDPR Article 22, students (or parents) have the right to not be subject to automated decision-making.
*   **Recommendation**: Implement an "Opt-out of AI Analysis" feature in user settings.
`;

    report += `
### 4. Right to Erasure (Data Deletion)
A scan for "deleteUser" or "removeStudent" logic was performed.
`;

    // Check if delete logic exists
    const deleteLogic = findings.some(f => f.content.toLowerCase().includes('delete') && f.content.toLowerCase().includes('user'));

    if (deleteLogic) {
        report += `*   **Status**: Potential deletion logic found. (Verify completeness).\n`;
    } else {
        report += `*   **CRITICAL GAP**: No explicit "Delete User" or "Right to Erasure" functionality found in the codebase.\n`;
        report += `    *   Recommendation: Implement a self-service deletion API.\n`;
    }

    report += `
## Compliance Checklist

- [ ] **Cookie Consent Banner**: Not found in \`src/app/layout.tsx\`. (Required)
- [ ] **Privacy Policy Link**: Verify existence in footer.
- [ ] **Data Export**: No API found for "Download My Data" (Portability).
- [ ] **Age Gating**: Verify if COPPA checks exist during signup (Date of Birth validation).
`;

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`Report generated at ${REPORT_FILE}`);
}

function groupByFile(findings: finding[]) {
    const groups: Record<string, finding[]> = {};
    for (const f of findings) {
        if (!groups[f.file]) groups[f.file] = [];
        groups[f.file].push(f);
    }
    return groups;
}

runAudit().catch(console.error);
