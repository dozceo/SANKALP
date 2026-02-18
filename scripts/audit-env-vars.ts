
import fs from 'fs';
import path from 'path';

// Recursively find all TypeScript files
function findFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });

  return results;
}

interface EnvVarUsage {
  file: string;
  line: number;
  variable: string;
  context: string;
  hasFallback: boolean;
  isClientSideExposed: boolean;
  isInsecureDefault: boolean;
}

function auditFile(filePath: string): EnvVarUsage[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const results: EnvVarUsage[] = [];

  // Regex for process.env.VAR
  // Captures: 1=VAR_NAME, 2=Remaining Line (to check for fallback)
  const regex = /process\.env\.([A-Z0-9_]+)(.*)/g;

  lines.forEach((line, index) => {
    let match;
    // Reset regex state for each line
    const lineContent = line;
    while ((match = regex.exec(lineContent)) !== null) {
      const varName = match[1];
      const remainder = match[2];

      const hasFallback = remainder.includes('||') || remainder.includes('??');
      const isClientSideExposed = varName.startsWith('NEXT_PUBLIC_');

      // Check for insecure defaults like "|| 'secret'" or similar
      // Very basic check: if fallback is a string literal that looks like a key/secret
      const isInsecureDefault = hasFallback && (
        remainder.includes("'secret'") ||
        remainder.includes('"secret"') ||
        remainder.includes('123456') ||
        (remainder.includes('KEY') && (remainder.includes("'") || remainder.includes('"')))
      );

      // Check if client-side exposed variable looks sensitive
      const sensitiveKeywords = ['SECRET', 'PASSWORD', 'KEY', 'TOKEN', 'PRIVATE'];
      const isSensitiveExposed = isClientSideExposed && sensitiveKeywords.some(k => varName.includes(k));

      results.push({
        file: filePath,
        line: index + 1,
        variable: varName,
        context: line.trim(),
        hasFallback,
        isClientSideExposed: isSensitiveExposed, // Flag if sensitive & exposed
        isInsecureDefault
      });
    }
  });

  return results;
}

function runAudit() {
  console.log('Starting Environment Variable Security Audit...');

  const files = findFiles('./src');
  let allIssues: EnvVarUsage[] = [];

  files.forEach(file => {
    allIssues = allIssues.concat(auditFile(file));
  });

  // Filter for issues: No fallback, or Insecure Default, or Sensitive Client-Side
  const problematicUsages = allIssues.filter(issue =>
    !issue.hasFallback || issue.isInsecureDefault || issue.isClientSideExposed
  );

  const reportContent = `
# Environment Variable Security Audit Report

**Date:** ${new Date().toISOString()}
**Files Scanned:** ${files.length}
**Total Usages Found:** ${allIssues.length}
**Issues Identified:** ${problematicUsages.length}

## Executive Summary
This report identifies potential security risks in environment variable usage across the codebase.
Specifically, it flags:
1.  **Missing Fallbacks:** Variables accessed without \`||\` or \`??\`, which can cause runtime crashes or undefined behavior.
2.  **Insecure Defaults:** Hardcoded secrets used as defaults.
3.  **Client-Side Exposure:** \`NEXT_PUBLIC_\` variables that appear to contain sensitive keywords (KEY, SECRET, etc.).

## Detailed Findings

${problematicUsages.length === 0 ? '**No critical issues found.**' : problematicUsages.map(issue => `
### ${issue.variable}
- **Location:** \`${issue.file}:${issue.line}\`
- **Issue Type:** ${issue.isClientSideExposed ? '🔴 **SENSITIVE CLIENT EXPOSURE**' : issue.isInsecureDefault ? '🟠 **INSECURE DEFAULT**' : '🟡 **MISSING FALLBACK**'}
- **Context:** \`${issue.context}\`
`).join('\n')}

## Recommendations
- **Add Fallbacks:** Ensure all \`process.env\` access has a safe fallback or is validated at startup (e.g., using T3 Env or Zod).
- **Remove Hardcoded Secrets:** Never fallback to a real secret in code. Use empty strings or throw errors.
- **Review Client-Side Vars:** Ensure \`NEXT_PUBLIC_\` variables are truly public and do not contain private API keys.

`;

  fs.writeFileSync('ENV_VAR_SECURITY_REPORT.md', reportContent.trim());
  console.log('Report generated: ENV_VAR_SECURITY_REPORT.md');
}

runAudit();
