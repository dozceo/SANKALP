# Prompt: Environment Variable Security Audit

## Objective
Audit all environment variable usages in the SANKALP codebase for security issues: missing fallbacks, insecure defaults, and client-side exposure of sensitive variables.

## Actions to Execute

1. **Run** `scripts/audit-env-vars.ts` against the full source directory
2. **List** every `process.env.*` usage with file path and line number
3. **Flag** usages without `||` or `??` fallbacks (potential runtime crashes)
4. **Flag** any `NEXT_PUBLIC_` variables containing sensitive keywords (KEY, SECRET, TOKEN)
5. **Flag** any hardcoded secret values used as fallback defaults
6. **Produce** a prioritized remediation list

## Expected Output
A complete environment variable security report grouped by issue type with remediation guidance.
