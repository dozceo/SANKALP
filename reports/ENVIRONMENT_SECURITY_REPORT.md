# Environment Variable Security Report

**Date:** 2026-02-19T19:29:28.112Z
**Files Scanned:** 187
**Total Usages:** 50

## 🚨 Client-Side Leaks (Non-Public Vars in Client Components)

| File | Line | Variable | Context |
|---|---|---|---|
| `src/components/ErrorBoundary.tsx` | 72 | `NODE_ENV` | `{process.env.NODE_ENV === 'development' && this.st...` |

## ⚠️ Missing Fallbacks

Variables accessed without a default value (e.g., `|| 'default'`). This can cause runtime crashes if the env var is missing.

| File | Line | Variable | Context |
|---|---|---|---|
| `src/ai/genkit.ts` | 12 | `GEMINI_API_KEY` | `const apiKey = process.env.GOOGLE_GENAI_API_KEY ||...` |
| `src/ai/genkit.ts` | 16 | `GOOGLE_GENAI_API_KEY` | `console.log('[Genkit Init] GOOGLE_GENAI_API_KEY pr...` |
| `src/ai/genkit.ts` | 17 | `GEMINI_API_KEY` | `console.log('[Genkit Init] GEMINI_API_KEY present:...` |
| `src/ai/genkit.ts` | 47 | `ADVERSARIAL_TEST` | `if (process.env.ADVERSARIAL_TEST === 'true') {...` |
| `src/app/api/chaos/route.ts` | 7 | `NODE_ENV` | `const isChaosEnabled = process.env.NODE_ENV !== 'p...` |
| `src/app/api/chaos/route.ts` | 7 | `ENABLE_CHAOS` | `const isChaosEnabled = process.env.NODE_ENV !== 'p...` |
| `src/app/api/chaos/route.ts` | 29 | `USE_MOCK_DB` | `if (process.env.USE_MOCK_DB !== 'true') {...` |
| `src/app/api/test/seed/route.ts` | 6 | `NODE_ENV` | `const isTest = process.env.NODE_ENV !== 'productio...` |
| `src/app/api/test/seed/route.ts` | 6 | `USE_MOCK_DB` | `const isTest = process.env.NODE_ENV !== 'productio...` |
| `src/components/ErrorBoundary.tsx` | 72 | `NODE_ENV` | `{process.env.NODE_ENV === 'development' && this.st...` |
| `src/instrumentation.ts` | 4 | `NEXT_RUNTIME` | `if (process.env.NEXT_RUNTIME === 'nodejs') {...` |
| `src/instrumentation.ts` | 8 | `NEXT_RUNTIME` | `if (process.env.NEXT_RUNTIME === 'edge') {...` |
| `src/lib/chaos-config.ts` | 128 | `NODE_ENV` | `if (process.env.NODE_ENV === 'production' && !proc...` |
| `src/lib/chaos-config.ts` | 128 | `ENABLE_CHAOS` | `if (process.env.NODE_ENV === 'production' && !proc...` |
| `src/lib/eventTracker.ts` | 397 | `NODE_ENV` | `enableDebugLogging: process.env.NODE_ENV === 'deve...` |
| `src/lib/firebase-admin.ts` | 37 | `FIREBASE_SERVICE_ACCOUNT` | `if (process.env.FIREBASE_SERVICE_ACCOUNT) {...` |
| `src/lib/firebase-admin.ts` | 38 | `FIREBASE_SERVICE_ACCOUNT` | `const serviceAccount = JSON.parse(process.env.FIRE...` |
| `src/lib/firebase-admin.ts` | 42 | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJEC...` |
| `src/lib/firebase-admin.ts` | 46 | `FIREBASE_PRIVATE_KEY` | `else if (process.env.FIREBASE_PRIVATE_KEY && proce...` |
| `src/lib/firebase-admin.ts` | 46 | `FIREBASE_CLIENT_EMAIL` | `else if (process.env.FIREBASE_PRIVATE_KEY && proce...` |
| `src/lib/firebase-admin.ts` | 48 | `FIREBASE_PROJECT_ID` | `projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJEC...` |
| `src/lib/firebase-admin.ts` | 49 | `FIREBASE_CLIENT_EMAIL` | `clientEmail: process.env.FIREBASE_CLIENT_EMAIL,...` |
| `src/lib/firebase-admin.ts` | 50 | `FIREBASE_PRIVATE_KEY` | `privateKey: process.env.FIREBASE_PRIVATE_KEY.repla...` |
| `src/lib/firebase-admin.ts` | 55 | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJEC...` |
| `src/lib/firebase-admin.ts` | 59 | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_...` |
| `src/lib/firebase-admin.ts` | 61 | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJEC...` |
| `src/lib/firebase-admin.ts` | 68 | `USE_MOCK_DB` | `if (process.env.USE_MOCK_DB === 'true') {...` |
| `src/lib/firebase-admin.ts` | 82 | `USE_MOCK_DB` | `if (process.env.USE_MOCK_DB === 'true') {...` |
| `src/lib/firebase-admin.ts` | 150 | `NODE_ENV` | `export const db = (process.env.NODE_ENV === 'produ...` |
| `src/lib/firebase-admin.ts` | 150 | `ENABLE_CHAOS` | `export const db = (process.env.NODE_ENV === 'produ...` |
| `src/lib/firebase.ts` | 21 | `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,...` |
| `src/lib/firebase.ts` | 22 | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_...` |
| `src/lib/firebase.ts` | 23 | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJEC...` |
| `src/lib/firebase.ts` | 24 | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket: process.env.NEXT_PUBLIC_FIREBASE_ST...` |
| `src/lib/firebase.ts` | 25 | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId: process.env.NEXT_PUBLIC_FIREBAS...` |
| `src/lib/firebase.ts` | 26 | `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,...` |
| `src/lib/firebase.ts` | 27 | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `measurementId: process.env.NEXT_PUBLIC_FIREBASE_ME...` |
| `src/lib/firebase.ts` | 93 | `NODE_ENV` | `if (process.env.NODE_ENV === 'development') {...` |
| `src/lib/firebase.ts` | 103 | `NODE_ENV` | `if (process.env.NODE_ENV === 'production') {...` |
| `src/lib/logger.ts` | 8 | `NODE_ENV` | `if (process.env.NODE_ENV !== 'production') {...` |
| `src/lib/logger.ts` | 21 | `NODE_ENV` | `if (process.env.NODE_ENV !== 'production') {...` |
| `src/sentry.client.config.ts` | 4 | `NEXT_PUBLIC_SENTRY_DSN` | `dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,...` |
| `src/sentry.edge.config.ts` | 4 | `NEXT_PUBLIC_SENTRY_DSN` | `dsn: process.env.SENTRY_DSN || process.env.NEXT_PU...` |
| `src/sentry.server.config.ts` | 4 | `NEXT_PUBLIC_SENTRY_DSN` | `dsn: process.env.SENTRY_DSN || process.env.NEXT_PU...` |

## 🔒 Sensitive Variable Analysis

No sensitive keywords (KEY, SECRET, PASSWORD) found in client-side code.
