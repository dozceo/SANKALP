
import fs from 'fs';
import path from 'path';

const ACTION_MARKER = /['"]use server['"]/;
const AUTH_CHECKS = [
  /auth\(\)/,
  /currentUser\(\)/,
  /getSession\(\)/,
  /getServerSession\(\)/,
  /verifyIdToken\(\)/, // Firebase specific
  /validateUser\(\)/
];

const IGNORE_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', 'reports'];

interface ActionFile {
  filepath: string;
  hasAuthCheck: boolean;
  exportedFunctions: string[];
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  notes: string[];
}

const findings: ActionFile[] = [];

function scanFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check if it's a server action file
    if (!ACTION_MARKER.test(content)) return;

    const lines = content.split('\n');
    let hasAuthCheck = false;
    const exportedFunctions: string[] = [];
    const notes: string[] = [];

    // Simple regex to find exported functions
    // export async function functionName(...)
    // export const functionName = async (...)
    const funcRegex = /export\s+(?:async\s+)?function\s+([a-zA-Z0-9_]+)|export\s+const\s+([a-zA-Z0-9_]+)\s*=\s*(?:async)?/g;

    let match;
    while ((match = funcRegex.exec(content)) !== null) {
      exportedFunctions.push(match[1] || match[2]);
    }

    // Check for auth patterns
    if (AUTH_CHECKS.some(regex => regex.test(content))) {
      hasAuthCheck = true;
    }

    // Heuristic for risk
    let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';

    if (hasAuthCheck) {
        riskLevel = 'LOW';
    } else {
        // If no global auth check, look for specific patterns
        // Maybe it's a public action?
        if (filePath.includes('login') || filePath.includes('sign-up') || filePath.includes('auth')) {
            riskLevel = 'LOW'; // Public auth actions don't need auth checks usually
            notes.push('Likely public auth action');
        } else {
            notes.push('Missing explicit authentication check');
        }
    }

    findings.push({
      filepath: filePath,
      hasAuthCheck,
      exportedFunctions,
      riskLevel,
      notes
    });

  } catch (err) {
    // ignore
  }
}

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        walkDir(filePath);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        scanFile(filePath);
      }
    }
  }
}

// Main execution
console.log('Starting Server Action Audit...');

if (fs.existsSync('src')) {
    walkDir('src');
}

// Generate Report
let report = `# Server Action Security Matrix

**Date:** ${new Date().toISOString()}
**Scope:** \`src/**\` (Files with \`"use server"\`)

## Summary
Found ${findings.length} Server Action files.
- High Risk: ${findings.filter(f => f.riskLevel === 'HIGH').length}
- Medium Risk: ${findings.filter(f => f.riskLevel === 'MEDIUM').length}
- Low Risk: ${findings.filter(f => f.riskLevel === 'LOW').length}

## Detailed Matrix

| File | Risk | Auth Check Found | Exported Actions | Notes |
|------|------|------------------|------------------|-------|
`;

findings.sort((a, b) => (a.riskLevel === 'HIGH' ? -1 : 1)).forEach(f => {
    const functions = f.exportedFunctions.length > 0 ? f.exportedFunctions.join(', ') : '(None found)';
    report += `| \`${f.filepath}\` | **${f.riskLevel}** | ${f.hasAuthCheck ? '✅' : '❌'} | \`${functions}\` | ${f.notes.join('; ')} |\n`;
});

report += `\n## Recommendations
1. **Implement Middleware:** Ensure strict middleware covers all Server Action routes.
2. **Explicit Auth Checks:** Add \`await auth()\` or equivalent at the start of every protected Server Action.
3. **Input Validation:** Use Zod to validate all inputs to Server Actions.
`;

const reportPath = path.join('reports', 'SERVER_ACTION_SECURITY_MATRIX.md');
if (!fs.existsSync('reports')) fs.mkdirSync('reports');
fs.writeFileSync(reportPath, report);

console.log(`Audit complete. Report generated at ${reportPath}`);
