# Prompt: Secret Exposure Scan

## Objective
Scan the entire SANKALP codebase for accidentally committed secrets, API keys, tokens, or credentials. Identify any hardcoded sensitive values, report where they are found, and provide remediation guidance.

## Actions to Execute

1. **Run** `scripts/scan-secrets.ts` against the full codebase
2. **Report** every file, line number, secret type, and redacted snippet found
3. **Assess** whether each finding is a real secret or a false positive (e.g., a reference to `process.env.KEY` vs a literal value)
4. **Provide** step-by-step remediation for each confirmed finding
5. **Check** `.gitignore` to verify secret files are excluded from version control

## Expected Output
A complete secret exposure report with all findings, classifications, and remediation steps.
