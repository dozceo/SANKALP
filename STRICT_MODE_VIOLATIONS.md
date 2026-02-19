# TypeScript Strict Mode Compliance Report

## Executive Summary
Audit of type safety practices, focusing on `any` usage, non-null assertions, and suppressed errors.

## Configuration (tsconfig.json)

No configuration issues found. Strict mode appears enabled.

## Violation Statistics

- **Explicit `any` types:** 110
- **Non-null assertions (`!`):** 21
- **TS Ignore/Expect Error:** 0

## Top Offenders

| File | `any` | `!` | `@ts-ignore` |
|---|---|---|---|
| `src/lib/mock-db.ts` | 20 | 0 | 0 |
| `src/components/InteractiveGraph.tsx` | 12 | 0 | 0 |
| `src/ai/genkit.ts` | 8 | 0 | 0 |
| `src/lib/auth.ts` | 6 | 0 | 0 |
| `src/lib/firestore.ts` | 6 | 0 | 0 |
| `src/components/planner/FocusTimer.tsx` | 1 | 4 | 0 |
| `src/lib/firebase-admin.ts` | 4 | 1 | 0 |
| `src/lib/storage.ts` | 5 | 0 | 0 |
| `src/app/api/chaos/route.ts` | 4 | 0 | 0 |
| `src/components/PersonalKnowledgeGraph.tsx` | 4 | 0 | 0 |
| `src/lib/syllabus-fallback.ts` | 0 | 4 | 0 |
| `src/app/(main)/classes/page.tsx` | 3 | 0 | 0 |
| `src/app/(main)/quiz/page.tsx` | 0 | 3 | 0 |
| `src/ai/detect_drift.ts` | 2 | 0 | 0 |
| `src/ai/flows/smart-revision-planner.ts` | 2 | 0 | 0 |
| `src/app/(auth)/login/page.tsx` | 2 | 0 | 0 |
| `src/app/(main)/mentor/page.tsx` | 1 | 1 | 0 |
| `src/app/api/intelligence/student/route.ts` | 0 | 2 | 0 |
| `src/components/SankalpSwitch.tsx` | 2 | 0 | 0 |
| `src/components/planner/AddStudyMaterial.tsx` | 2 | 0 | 0 |

*...and 28 more files.*

## Recommendations

1. **Replace `any`:** Use `unknown` or specific interfaces. `any` disables type checking for that variable and propagates.
2. **Avoid Non-Null Assertions:** Use optional chaining (`?.`) and nullish coalescing (`??`) or type guards instead of `!`.
3. **Remove Suppressions:** `@ts-ignore` hides bugs. Fix the underlying type error.
