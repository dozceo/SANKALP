# Environment Variable Security Audit Report

## Overview
This report provides a security audit of environment variable usage across the codebase (`src/`, `scripts/`, etc.). The goal is to identify missing fallbacks, insecure defaults, potential client-side leaks, and unsafe access patterns.

## Methodology
A static analysis was performed using `grep` to locate all instances of `process.env` usage. Each instance was reviewed for:
1.  **Safety**: Does it handle missing values?
2.  **Exposure**: Are sensitive keys exposed to the client (via `NEXT_PUBLIC_`)?
3.  **Defaults**: Are there hardcoded secrets or insecure defaults?

## Findings

### 1. Missing Fallbacks & Error Handling
Several critical configuration files access environment variables without explicit fallback values or error handling. If these variables are missing in production, the application may crash or behave unpredictably.

*   **`src/lib/firebase.ts`**:
    *   Initializes Firebase using `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`, `AUTH_DOMAIN`, etc. directly.
    *   **Risk**: If any of these are missing, `initializeApp` will likely throw or result in a broken app state.
    *   **Recommendation**: Add a check to ensure required config is present before initializing, or provide a centralized config object with validation (e.g., using `zod`).

*   **`src/lib/firebase-admin.ts`**:
    *   `JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)`: This will throw if the variable is undefined or invalid JSON.
    *   `process.env.FIREBASE_PRIVATE_KEY.replace(...)`: This will throw `TypeError` if `FIREBASE_PRIVATE_KEY` is undefined.
    *   **Recommendation**: Wrap these in `try-catch` blocks or check for existence before accessing methods like `.replace()`.

*   **`src/ai/genkit.ts`**:
    *   `const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;`
    *   **Status**: Good fallback logic between keys, but if both are missing, `apiKey` is undefined. The subsequent usage should handle this case.

### 2. Client-Side Exposure
The following variables are prefixed with `NEXT_PUBLIC_`, meaning they are bundled with the client-side code and visible to any user.

*   `NEXT_PUBLIC_FIREBASE_*`: Standard for Firebase Client SDK. Security is handled via Firestore/Storage Rules, not by hiding these keys. **Acceptable.**
*   `NEXT_PUBLIC_SENTRY_DSN`: Standard for Sentry client-side error tracking. **Acceptable.**

### 3. Hardcoded Defaults & Scripts
*   **`scripts/seed-personal.ts` & `scripts/seed-database.ts`**:
    *   `process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'sankalp-prerollout';`
    *   **Risk**: Hardcoded project ID in scripts. If run against a different environment without the env var set, it defaults to `sankalp-prerollout`, potentially affecting the wrong project.
    *   **Recommendation**: Require the env var to be set explicitly or log a prominent warning when using the default.

*   **`src/ml/inference/ml-bridge.ts`**:
    *   `const API_URL = process.env.ML_API_URL || "http://localhost:8000/predict/mastery";`
    *   **Status**: Safe default for local development.

## Recommendations

1.  **Implement Config Validation**: Create a centralized `src/env.mjs` or similar (using `t3-env` or `zod`) to validate all environment variables at build/runtime start. This prevents runtime crashes due to missing keys.
2.  **Safe Parsing**: Refactor `src/lib/firebase-admin.ts` to safely parse JSON and check for existence of private keys before string manipulation.
3.  **Audit Scripts**: Remove hardcoded Project IDs from seed scripts or ensure they are only used as a last-resort fallback with logging.

## Conclusion
The application generally follows standard patterns for Next.js environment variables. The primary risks are potential runtime crashes due to unhandled missing variables in utility files (`firebase-admin.ts`) and hardcoded defaults in seed scripts. No critical secret leaks (e.g., private keys exposed to client) were found.
