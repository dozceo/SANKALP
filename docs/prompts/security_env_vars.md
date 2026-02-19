# Task: Environment Variable Security Hardening

**Source:** `docs/01_Critical_Security_&_Alerts/ENV_VAR_SECURITY_REPORT.md`

## Objective
Secure environment variable usage across the application by ensuring fallbacks, removing hardcoded secrets, and validating `NEXT_PUBLIC_` exposure.

## Context
- **Files Scanned:** 183
- **Issues Found:** 31 (Missing Fallbacks, Insecure Defaults, Sensitive Client Exposure)

## Specific Issues to Fix
Refer to `docs/01_Critical_Security_&_Alerts/ENV_VAR_SECURITY_REPORT.md` for the exact line numbers. Key areas include:

1.  **Missing Fallbacks (Risk: Crash/Undefined):**
    - `src/ai/genkit.ts`: `GOOGLE_GENAI_API_KEY`, `GEMINI_API_KEY`
    - `src/instrumentation.ts`: `NEXT_RUNTIME`
    - `src/lib/firebase-admin.ts`: `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_PRIVATE_KEY`
    - `src/lib/firebase.ts`: `NEXT_PUBLIC_FIREBASE_*` config values.
    - `src/sentry.client.config.ts`: `NEXT_PUBLIC_SENTRY_DSN`

2.  **Sensitive Client Exposure (Risk: Leak):**
    - `src/lib/firebase.ts`: Check `NEXT_PUBLIC_FIREBASE_API_KEY`. ensure it is intended to be public (Firebase API keys are generally safe to be public if rules are secure, but verify).

## Requirements
1.  **Implement Safe Access:**
    - Use a helper function or library (like T3 Env or Zod) to validate env vars at startup.
    - Or, at minimum, add `|| ""` or `?? undefined` fallbacks where appropriate, and throw errors for required server-side secrets if missing.
2.  **Remove Hardcoded Secrets:**
    - Ensure no detected "insecure defaults" (fake secrets) are used in production code.

## Constraints
- Do not break the build.
- Ensure local development (`.env.local`) still works.
