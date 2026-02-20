# Environment Variable Security Audit Report

**Date:** 2026-02-20T02:19:55.434Z
**Files Scanned:** 188
**Total Usages Found:** 41
**Issues Identified:** 33

## Executive Summary
This report identifies potential security risks in environment variable usage across the codebase.
Specifically, it flags:
1.  **Missing Fallbacks:** Variables accessed without `||` or `??`, which can cause runtime crashes or undefined behavior.
2.  **Insecure Defaults:** Hardcoded secrets used as defaults.
3.  **Client-Side Exposure:** `NEXT_PUBLIC_` variables that appear to contain sensitive keywords (KEY, SECRET, etc.).

## Detailed Findings


### GOOGLE_GENAI_API_KEY
- **Location:** `src/ai/genkit.ts:16`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `console.log('[Genkit Init] GOOGLE_GENAI_API_KEY present:', !!process.env.GOOGLE_GENAI_API_KEY);`


### GEMINI_API_KEY
- **Location:** `src/ai/genkit.ts:17`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `console.log('[Genkit Init] GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);`


### ADVERSARIAL_TEST
- **Location:** `src/ai/genkit.ts:47`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `if (process.env.ADVERSARIAL_TEST === 'true') {`


### USE_MOCK_DB
- **Location:** `src/app/api/chaos/route.ts:29`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `if (process.env.USE_MOCK_DB !== 'true') {`


### NODE_ENV
- **Location:** `src/components/ErrorBoundary.tsx:72`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `{process.env.NODE_ENV === 'development' && this.state.error && (`


### NEXT_RUNTIME
- **Location:** `src/instrumentation.ts:4`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `if (process.env.NEXT_RUNTIME === 'nodejs') {`


### NEXT_RUNTIME
- **Location:** `src/instrumentation.ts:8`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `if (process.env.NEXT_RUNTIME === 'edge') {`


### NODE_ENV
- **Location:** `src/lib/chaos-config.ts:128`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_CHAOS) return;`


### NODE_ENV
- **Location:** `src/lib/eventTracker.ts:397`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `enableDebugLogging: process.env.NODE_ENV === 'development'`


### FIREBASE_SERVICE_ACCOUNT
- **Location:** `src/lib/firebase-admin.ts:37`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `if (process.env.FIREBASE_SERVICE_ACCOUNT) {`


### FIREBASE_SERVICE_ACCOUNT
- **Location:** `src/lib/firebase-admin.ts:38`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);`


### NEXT_PUBLIC_FIREBASE_PROJECT_ID
- **Location:** `src/lib/firebase-admin.ts:42`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,`


### FIREBASE_PRIVATE_KEY
- **Location:** `src/lib/firebase-admin.ts:46`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {`


### FIREBASE_CLIENT_EMAIL
- **Location:** `src/lib/firebase-admin.ts:49`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `clientEmail: process.env.FIREBASE_CLIENT_EMAIL,`


### FIREBASE_PRIVATE_KEY
- **Location:** `src/lib/firebase-admin.ts:50`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),`


### NEXT_PUBLIC_FIREBASE_PROJECT_ID
- **Location:** `src/lib/firebase-admin.ts:55`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,`


### NEXT_PUBLIC_FIREBASE_PROJECT_ID
- **Location:** `src/lib/firebase-admin.ts:59`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {`


### NEXT_PUBLIC_FIREBASE_PROJECT_ID
- **Location:** `src/lib/firebase-admin.ts:61`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,`


### USE_MOCK_DB
- **Location:** `src/lib/firebase-admin.ts:68`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `if (process.env.USE_MOCK_DB === 'true') {`


### USE_MOCK_DB
- **Location:** `src/lib/firebase-admin.ts:82`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `if (process.env.USE_MOCK_DB === 'true') {`


### NODE_ENV
- **Location:** `src/lib/firebase-admin.ts:150`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `export const db = (process.env.NODE_ENV === 'production' && !process.env.ENABLE_CHAOS)`


### NEXT_PUBLIC_FIREBASE_API_KEY
- **Location:** `src/lib/firebase.ts:21`
- **Issue Type:** 🔴 **SENSITIVE CLIENT EXPOSURE**
- **Context:** `apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,`


### NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- **Location:** `src/lib/firebase.ts:22`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,`


### NEXT_PUBLIC_FIREBASE_PROJECT_ID
- **Location:** `src/lib/firebase.ts:23`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,`


### NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- **Location:** `src/lib/firebase.ts:24`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,`


### NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- **Location:** `src/lib/firebase.ts:25`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,`


### NEXT_PUBLIC_FIREBASE_APP_ID
- **Location:** `src/lib/firebase.ts:26`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,`


### NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
- **Location:** `src/lib/firebase.ts:27`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,`


### NODE_ENV
- **Location:** `src/lib/firebase.ts:93`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `if (process.env.NODE_ENV === 'development') {`


### NODE_ENV
- **Location:** `src/lib/firebase.ts:103`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `if (process.env.NODE_ENV === 'production') {`


### NODE_ENV
- **Location:** `src/lib/logger.ts:8`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `if (process.env.NODE_ENV !== 'production') {`


### NODE_ENV
- **Location:** `src/lib/logger.ts:21`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `if (process.env.NODE_ENV !== 'production') {`


### NEXT_PUBLIC_SENTRY_DSN
- **Location:** `src/sentry.client.config.ts:4`
- **Issue Type:** 🟡 **MISSING FALLBACK**
- **Context:** `dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,`


## Recommendations
- **Add Fallbacks:** Ensure all `process.env` access has a safe fallback or is validated at startup (e.g., using T3 Env or Zod).
- **Remove Hardcoded Secrets:** Never fallback to a real secret in code. Use empty strings or throw errors.
- **Review Client-Side Vars:** Ensure `NEXT_PUBLIC_` variables are truly public and do not contain private API keys.