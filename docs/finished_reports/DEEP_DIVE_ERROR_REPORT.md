# Deep Dive Error Report

> **Generated:** 2026-02-22  
> **Scope:** Full codebase analysis — TypeScript errors, type mismatches, security concerns, runtime inconsistencies, testing gaps, and structural issues.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [TypeScript Compilation Errors (55 errors, 30 files)](#2-typescript-compilation-errors)
3. [Type & Interface Mismatches](#3-type--interface-mismatches)
4. [Runtime & Logic Errors](#4-runtime--logic-errors)
5. [Security Concerns](#5-security-concerns)
6. [Structural Inconsistencies](#6-structural-inconsistencies)
7. [Testing Gaps](#7-testing-gaps)
8. [Configuration Issues](#8-configuration-issues)
9. [Recommendations](#9-recommendations)

---

## 1. Executive Summary

| Category | Count | Severity |
|---|---|---|
| TypeScript compilation errors | **55** | 🔴 High |
| Type/interface mismatches | **7** | 🔴 High |
| Potential runtime crashes | **4** | 🔴 Critical |
| Security concerns | **6** | 🟡 Medium–High |
| Stale/orphan files | **1 directory** | 🟡 Medium |
| Console statements in prod code | **55+** | 🟡 Medium |
| Untested API routes | **30** | 🟡 Medium |
| Missing `.env.example` | **1** | 🟡 Medium |
| ESLint config missing (v10 flat) | **1** | 🟡 Medium |

---

## 2. TypeScript Compilation Errors

Running `npx tsc --noEmit` produces **55 errors across 30 files**. Grouped by category:

### 2.1 Null-Safety Violations (Possibly Undefined)

These will cause runtime crashes if the value is ever `undefined`:

| File | Line | Error | Risk |
|---|---|---|---|
| `src/app/(main)/home/page.tsx` | 74 | `currentStudent` is possibly `null` — accessing `.name` | 🔴 Crash |
| `src/app/(main)/home/page.tsx` | 147 | `currentStudent` is possibly `null` — accessing `.classId` | 🔴 Crash |
| `src/app/(main)/home/page.tsx` | 181 | `StudentNode \| null` passed where `StudentNode` is required | 🔴 Crash |
| `src/app/api/classes/join/route.ts` | 21 | `auth` is possibly `undefined` before calling `.verifyIdToken()` | 🔴 Auth crash |
| `src/app/api/classes/leave/route.ts` | 21 | `auth` is possibly `undefined` before calling `.verifyIdToken()` | 🔴 Auth crash |
| `src/app/api/student/route.ts` | 68 | `auth` is possibly `undefined` before calling `.verifyIdToken()` | 🔴 Auth crash |
| `src/lib/middleware/auth.ts` | 42 | `auth` is possibly `undefined` | 🔴 Auth crash |
| `src/contexts/AuthContext.tsx` | 155 | `Auth \| undefined` passed to `firebaseSignOut()` | 🔴 Crash |
| `src/lib/firestore.ts` | 96, 119, 140, 159, 173, 199 | `Firestore \| undefined` passed to `collection()`/`doc()` (6 instances) | 🔴 DB crash |
| `src/app/api/intelligence/student/route.ts` | 166–236 | `MasteryPredictionOutput \| undefined` assigned where `null` expected (6 instances) | 🟡 Silent failure |

### 2.2 Missing/Nonexistent Properties

| File | Line | Error |
|---|---|---|
| `src/app/(auth)/login/page.tsx` | 27 | `googleSignIn` does not exist on `AuthContextType` (correct name: `signInWithGoogle`) |
| `src/app/(auth)/login/page.tsx` | 48 | `role` does not exist on `User` type |
| `src/app/(main)/classes/page.tsx` | 181 | `joinedClassAt` does not exist on `StudentNode` type (2 occurrences) |
| `src/contexts/StudentContext.tsx` | 80 | `joinedClassAt` set on object literal but not in `StudentNode` type |
| `src/components/ui/menubar.tsx` | 253 | `menubarGroup` not found — likely should be `MenubarGroup` (casing) |
| `src/lib/eventTracker.ts` | 443 | Return type `() => void` assigned to `void` — cleanup function never called |

### 2.3 Function Signature Mismatches

| File | Line | Error |
|---|---|---|
| `src/app/api/users/create/route.ts` | 23 | `createUser(uid, email, name, role)` — passes **4 args**, function expects **1 object** `{ uid, email, name, role }` |
| `next.config.ts` | 41 | Sentry `withSentryConfig()` called with **3 args**, expects **0–2** |

### 2.4 Type Incompatibilities

| File | Line | Error |
|---|---|---|
| `src/app/test-charts/page.tsx` | 57 | `type: string` not assignable to `NodeType` union in `GraphData` |
| `some stuff/InteractiveGraph.tsx` | 349, 404 | `GraphLink[]` incompatible with `LinkObject` generic (2 errors) |
| `scripts/trace-causal-integrity.ts` | 112 | `attention_risk: string` not assignable to `"LOW" \| "HIGH" \| "MEDIUM"` |
| `scripts/evaluate-interventions.ts` | 17, 26 | `predicted_class` not in `MLSignals`; `currentDate` missing from `DecisionContext` |

### 2.5 Script-Specific Errors

| File | Line | Error |
|---|---|---|
| `scripts/bias-analysis.ts` | 13–14 | `DecisionContext` and `LLMContext` declared locally but not exported from `decision-engine` |
| `scripts/simulate-causal-flow.ts` | 6 | `ADKDecision` not exported from `decision-engine` |
| `scripts/run-chaos.ts` | 3 | `checkChaos` not exported from `chaos-config` (it's a private class method) |
| `scripts/chaos-experiment.ts` | 6 | Cannot assign to read-only `process.env.NODE_ENV` |
| `scripts/chaos-test-suite.ts` | 16 | Cannot assign to read-only `process.env.NODE_ENV` |
| `scripts/detect-quiz-drift.ts` | 14 | `inputSchema` doesn't exist in `PromptConfig` type |
| `scripts/analyze-bundle-impact.ts` | 20, 53 | Implicit `any` on `dirPath`, `arrayOfFiles`, `file` parameters |
| `scripts/audit-teacher-rbac.test.ts` | 16–20 | `mockResolvedValue` doesn't exist — missing Jest type cast |
| `scripts/adversarial-stress-test.ts` | 255 | `totalTokens` doesn't exist on token usage type |
| `scripts/simulate-ml-burst.ts` | 49 | `reason` not narrowed on rejected promise result |

---

## 3. Type & Interface Mismatches

### 3.1 `StudentNode` vs `Student` Drift

The `StudentNode` type (in `src/data/docsData.ts`) and the `Student` interface (in `src/lib/db-helpers.ts`) have diverged:

- `Student` has `joinedClassAt` — `StudentNode` does **not**.
- `StudentContext` (line 80) writes `joinedClassAt` to a `StudentNode` object, causing a TS error.
- `classes/page.tsx` reads `currentStudent.joinedClassAt` which doesn't exist on `StudentNode`.

**Impact:** The `joinedClassAt` field is used in the UI but never type-checked, meaning it relies on runtime data shape.

### 3.2 `AuthContextType` Missing `googleSignIn`

- `login/page.tsx` destructures `{ signIn, googleSignIn }` from `useAuth()`.
- `AuthContextType` exposes `signInWithGoogle` — not `googleSignIn`.
- **Impact:** Login page will crash at runtime if this code path is reached.

### 3.3 `User` Type Missing `role` on Client Side

- `login/page.tsx:48` checks `user.role` but the client-side `User` type from Firebase Auth does not include `role`.
- The `role` field exists on the server-side `User` interface in `db-helpers.ts` but is a different type.

### 3.4 Non-Exported Types in `decision-engine.ts`

The following types are declared but not exported, breaking 3 scripts:
- `DecisionContext` (used in `bias-analysis.ts`)
- `LLMContext` (used in `bias-analysis.ts`)
- `ADKDecision` (used in `simulate-causal-flow.ts`)

### 3.5 `MLSignals` Stale Usage

- `scripts/evaluate-interventions.ts` uses `predicted_class` which no longer exists on `MLSignals`.
- `scripts/trace-causal-integrity.ts` uses `attention_risk: string` but the type expects `"LOW" | "HIGH" | "MEDIUM"`.

---

## 4. Runtime & Logic Errors

### 4.1 🔴 `createUser()` Call Will Crash

**File:** `src/app/api/users/create/route.ts:23`

```typescript
// CURRENT (BROKEN) — passes 4 positional arguments
const user = await createUser(uid, email, name, role);

// EXPECTED — function signature takes a single object
const user = await createUser({ uid, email, name, role });
```

The `createUser` function in `db-helpers.ts` (line 841) accepts a single destructured object parameter. Calling it with 4 positional arguments means `email`, `name`, and `role` are silently ignored, and the user is created with only `uid` as data.

### 4.2 🔴 `eventTracker.ts` Cleanup Function Never Called

**File:** `src/lib/eventTracker.ts:443`

```typescript
// Returns a cleanup function but the return type is `void`
return () => {
  clearInterval(heartbeatInterval);
};
```

The returned cleanup function is typed as `void`, so callers won't know to invoke it. Heartbeat intervals will leak.

### 4.3 🔴 `menubar.tsx` Export Typo

**File:** `src/components/ui/menubar.tsx:253`

```typescript
menubarGroup,  // lowercase — should be MenubarGroup
```

Any consumer importing `menubarGroup` will get `undefined`. Likely a copy-paste error from the export block.

### 4.4 🟡 Unguarded `currentStudent` Access

**File:** `src/app/(main)/home/page.tsx`

`currentStudent` is typed `StudentNode | null` but accessed without null checks at lines 74, 147, and 181. If the student context hasn't loaded yet, these will throw `Cannot read properties of null`.

---

## 5. Security Concerns

### 5.1 Overly Permissive Firebase Storage Rules

```
// storage.rules — line 8
allow read, write: if request.auth != null;
```

**Any authenticated user** can read or write **any file** in Storage. No path-scoping, file-type validation, or size limits.

### 5.2 No Input Sanitization Library

- No DOMPurify, xss, or sanitize-html in dependencies.
- User input from onboarding (`name`, `grade`, `subjects`, `goals`) is stored raw into Firestore.
- Activity log events store raw `action` and `data` fields without validation.

### 5.3 Auth Middleware Token Parsing

**File:** `src/lib/middleware/auth.ts`

```typescript
const token = authHeader.split('Bearer ')[1];
```

Fragile parsing — a malformed header like `Bearertoken` or `bearer xyz` would bypass or crash. Should use a regex or stricter check.

### 5.4 No Rate Limiting

No rate limiting on any API routes, including authentication endpoints (`/api/classes/join`, `/api/users/create`, `/api/student/onboard`).

### 5.5 Sentry `tracesSampleRate: 1`

All three Sentry configs (`client`, `server`, `edge`) capture **100% of traces**. In production this:
- Creates performance overhead
- May expose sensitive user data in trace payloads
- Should be reduced to 0.1–0.3

### 5.6 No `.env.example` File

22 environment variables are used across the codebase but there is no `.env.example` or `.env.template` file documenting them. This increases the risk of misconfiguration.

---

## 6. Structural Inconsistencies

### 6.1 Orphan `some stuff/` Directory

A directory named `some stuff/` exists at the project root containing a single file:
- `some stuff/InteractiveGraph.tsx` (438 lines)

This is an **outdated version** of `src/components/InteractiveGraph.tsx` (705 lines). The two files differ by 734 diff lines. The stale copy:
- Uses direct imports instead of `next/dynamic`
- Missing `'use client'` directive
- Uses deprecated `generateGraphData` instead of `generateEnhancedGraphData`
- Has 2 TypeScript errors from outdated `GraphData` types

**Recommendation:** Delete this directory.

### 6.2 ESLint Configuration Gap

The project has a legacy `.eslintrc.json` with `"extends": "next/core-web-vitals"`, but ESLint 10 (in devDependencies) requires a flat config (`eslint.config.mjs`). Running `pnpm lint` likely fails silently or with a config error.

### 6.3 Duplicate API Route Namespaces

While not strictly broken, two API namespaces exist for the same domain:

| Singular | Plural |
|---|---|
| `/api/student` (GET, POST for single student) | `/api/students/create` (POST to create) |
| `/api/teacher` (GET for single teacher) | `/api/teachers/create` (POST to create) |

This is inconsistent — REST convention would use either singular or plural consistently.

### 6.4 Console Statements in Production Code

**55+ `console.log`/`console.warn`/`console.debug` statements** found in production code paths:

| Area | Count | Examples |
|---|---|---|
| `src/app/page.tsx` (root page) | 13 | `[Root] Auth loaded`, `[Root] Role from context` |
| `src/app/api/student/route.ts` | 8 | `[Student API] GET request`, `[Student API] Student fetched` |
| `src/app/api/activity/log/route.ts` | 5 | `📦 [Activity Log] Batch request` |
| `src/app/api/chaos/route.ts` | 3 | `[Chaos API] Seeding mock database` |
| `src/lib/` and `src/contexts/` | 16 | Various debug logs |
| Other API routes | 10+ | Error and debug logging |

The project has a `src/lib/logger.ts` utility but it is not consistently used.

### 6.5 `pnpm` Build Script Warning

`pnpm install` emits a warning about ignored build scripts for 9 packages including `@swc/core`, `sharp`, and `esbuild`. These need `pnpm approve-builds` to whitelist, otherwise SWC compilation and image optimization may silently fail.

---

## 7. Testing Gaps

### 7.1 Test Coverage Overview

| Category | Total | Tested | Coverage |
|---|---|---|---|
| API routes | 30 | 0 | **0%** |
| AI/Genkit flows | 11 | 3 | **27%** |
| React components | 15+ | 2 | **~13%** |
| Core libraries (`lib/`) | 20+ | 2 | **~10%** |
| ML pipeline | 5 modules | 3 | **60%** |

### 7.2 Zero-Coverage API Routes

All 30 API routes under `src/app/api/` have **no unit or integration tests**:

- `api/activity/log` — logs user activity
- `api/brainmap/nodes` — brain map data
- `api/classes/create`, `join`, `leave` — class management
- `api/intelligence/student` — ML intelligence pipeline
- `api/planner/convert-to-node`, `data`, `review` — study planner
- `api/quiz/submit` — quiz submission
- `api/sankalp/session/start`, `end` — session management
- `api/student`, `student/graph`, `student/onboard` — student CRUD
- `api/students/create`, `api/teachers/create` — user creation
- `api/syllabus/save` — syllabus management
- `api/teacher`, `api/users/create`, `api/users/[userId]` — user management

### 7.3 Untested AI Flows

8 of 11 Genkit AI flows have no tests:
- `adaptive-quiz-engine.ts`
- `custom-cognitive-chatbot.ts`
- `mindful-mentor.ts`
- `multilingual-cognitive-chatbot.ts`
- `smart-revision-planner.ts`
- `speech-to-speech.ts`
- `syllabus-generator.ts`
- `text-to-speech.ts`

### 7.4 Untested Components

Critical UI components without tests:
- `ErrorBoundary.tsx` — error recovery
- `InteractiveGraph.tsx` — force-graph visualization
- `PersonalKnowledgeGraph.tsx` — student knowledge map
- `SankalpSwitch.tsx` — accessibility toggle
- `StudentSelector.tsx` — student picker
- `LogoutButton.tsx` — auth action

### 7.5 Jest Mock Issues

`scripts/audit-teacher-rbac.test.ts` uses `.mockResolvedValue()` without casting to `jest.Mock`, causing 3 TypeScript errors:

```typescript
// BROKEN
dbHelpers.getTeacherClasses.mockResolvedValue([]);
// FIX
(dbHelpers.getTeacherClasses as jest.Mock).mockResolvedValue([]);
```

---

## 8. Configuration Issues

### 8.1 `next.config.ts` — Sentry Plugin Arity

```typescript
// Line 41: withSentryConfig called with 3 args, signature accepts 0–2
}, {
  // sentry options...
});
```

The Sentry Next.js plugin API may have changed. The third argument (Sentry-specific options) should be merged into the second or removed.

### 8.2 Playwright Config Hardcoded URL

```typescript
// playwright.config.ts
baseURL: 'http://localhost:9002'
```

Should use `process.env.BASE_URL || 'http://localhost:9002'` for CI flexibility.

### 8.3 Cross-Browser Testing

Playwright config only tests Chromium. No Firefox or WebKit projects configured.

---

## 9. Recommendations

### Immediate (P0 — Will Crash at Runtime)

1. **Fix `createUser()` call** in `src/app/api/users/create/route.ts:23` — wrap args in an object
2. **Add null checks** for `currentStudent` in `src/app/(main)/home/page.tsx`
3. **Fix `googleSignIn`** reference in `login/page.tsx` — rename to `signInWithGoogle`
4. **Fix `menubarGroup`** export casing in `menubar.tsx`
5. **Guard `auth`** before calling `.verifyIdToken()` in 3 API routes and auth middleware

### Short-Term (P1 — Type Safety & Security)

6. Add `joinedClassAt` to `StudentNode` type or remove usage from UI
7. Export `DecisionContext`, `LLMContext`, `ADKDecision` from `decision-engine.ts`
8. Guard `Firestore | undefined` in `src/lib/firestore.ts` (6 instances)
9. Create `.env.example` documenting all 22 environment variables
10. Add input validation (Zod schemas) to all API routes
11. Scope Firebase Storage rules to user-specific paths

### Medium-Term (P2 — Quality & Maintainability)

12. Delete `some stuff/` directory (stale orphan code)
13. Migrate ESLint config to flat config format (`eslint.config.mjs`)
14. Replace `console.log/warn` with the existing `logger.ts` utility
15. Add unit tests for API routes (start with `users/create`, `classes/join`, `quiz/submit`)
16. Fix `eventTracker.ts` cleanup function return type
17. Reduce Sentry `tracesSampleRate` to 0.1–0.3 in production
18. Run `pnpm approve-builds` to whitelist required build scripts
19. Standardize API route naming (singular vs plural)
20. Add type annotations to `db-helpers-extended.ts` parameters (5 implicit `any`)
