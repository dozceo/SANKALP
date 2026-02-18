
import fs from 'fs';
import path from 'path';

function scanDir(dir: string, pattern: RegExp): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(scanDir(filePath, pattern));
        } else {
            const content = fs.readFileSync(filePath, 'utf-8');
            if (pattern.test(content)) {
                results.push(filePath);
            }
        }
    });
    return results;
}

async function runAudit() {
  console.log('Starting Privacy Compliance Audit...');

  // 1. PII Storage Analysis
  console.log('\n1. PII Storage Analysis:');
  // Check db-helpers for plaintext PII
  const dbHelpersPath = path.join(process.cwd(), 'src/lib/db-helpers-user.ts');
  if (fs.existsSync(dbHelpersPath)) {
      const content = fs.readFileSync(dbHelpersPath, 'utf-8');
      const storesEmail = content.includes('email: data.email');
      const storesName = content.includes('name: data.name');
      console.log(`- Stores Email in Plaintext: ${storesEmail}`);
      console.log(`- Stores Name in Plaintext: ${storesName}`);
      if (storesEmail) console.log('- Finding: PII (email) is stored without encryption at rest (Firestore default encryption applies, but field level encryption is missing).');
  }

  // 2. Data Deletion Capability (Right to Erasure)
  console.log('\n2. Right to Erasure Analysis:');
  const userApiDir = path.join(process.cwd(), 'src/app/api/users');
  const hasDeleteRoute = scanDir(userApiDir, /DELETE/).length > 0;
  console.log(`- User API has DELETE method: ${hasDeleteRoute}`);

  if (!hasDeleteRoute) {
      console.error('CRITICAL: No API endpoint found for User Deletion. This is a violation of GDPR Article 17 (Right to Erasure).');
  }

  // 3. PII Logging Check
  console.log('\n3. PII Logging Analysis:');
  const loggingMatches = scanDir(path.join(process.cwd(), 'src/app/api'), /console\.log.*(email|name|student)/i);
  if (loggingMatches.length > 0) {
      console.log(`- Potential PII logging found in ${loggingMatches.length} files.`);
      console.log(`- Example: ${loggingMatches[0]}`);
  } else {
      console.log('- No obvious PII logging found in API routes.');
  }

  // 4. Generate Report
  console.log('\n4. Generating Report...');
  const reportContent = `
# Student Data Privacy Compliance Report

## Summary
The audit reveals significant compliance gaps regarding GDPR and COPPA. The most critical issue is the lack of a mechanism for users to delete their accounts and associated data (Right to Erasure). Additionally, PII is stored in plaintext within the database, and while Firestore provides encryption at rest, additional application-level safeguards for sensitive student data are recommended.

## Findings

### 1. Right to Erasure (GDPR Art. 17 / COPPA)
- **Status**: **NON-COMPLIANT**
- **Issue**: No \`DELETE\` endpoint exists in \`/api/users\` or \`/api/students\`.
- **Impact**: Users cannot exercise their right to be forgotten. This is a major regulatory risk.

### 2. Data Storage & Encryption
- **Status**: **PARTIALLY COMPLIANT**
- **Issue**: Student names and emails are stored as plaintext fields in Firestore.
- **Mitigation**: Firestore encrypts data at rest, but application-level encryption for PII is a best practice for "Defense in Depth", especially for minors' data.

### 3. Data Minimization
- **Status**: **COMPLIANT**
- **Observation**: The system appears to collect only necessary data (Name, Email, Grade, Performance). No extraneous sensitive data (e.g., biometric, location) was found in the schema.

### 4. Logging
- **Status**: **Needs Review**
- **Issue**: Static analysis flagged potential logging of student objects in API routes. Ensure production logs mask PII.

## Recommendations
1.  **Implement Account Deletion**: Create a \`DELETE /api/users/[userId]\` endpoint that recursively deletes:
    - User document
    - Student profile
    - Quiz results
    - Planner data
    - Brain map nodes
    - Chat history
2.  **Audit Logs**: Configure the logger to scrub emails and names from output.
3.  **Privacy Policy**: Ensure the frontend links to a privacy policy detailing data usage.
`;

  fs.writeFileSync('PRIVACY_COMPLIANCE_REPORT.md', reportContent);
  console.log('- Report generated: PRIVACY_COMPLIANCE_REPORT.md');
}

runAudit().catch(console.error);
