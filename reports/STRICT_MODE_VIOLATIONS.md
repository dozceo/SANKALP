# TypeScript Strict Mode Violation Report

## Executive Summary
**Date:** 2024-05-23
**Scope:** `src`
**Configuration:** `strict: true` (in `tsconfig.json`)

## Findings
The codebase has `strict` mode enabled, but there are significant violations using explicit `any` and non-null assertions (`!`).

### 1. `any` Usage
- **Count:** 53 occurrences
- **Risk:** Bypasses type checking completely. Can lead to runtime errors if properties are accessed on `any` variables.
- **Top Offenders:**
    - (Based on scan) Likely in complex data processing or API responses where types were hard to define.
- **Example Violation:** `(data: any) => ...`

### 2. Non-Null Assertions (`!`)
- **Count:** 375 occurrences
- **Risk:** Asserts that a value is not null/undefined without checking. High risk of `TypeError: Cannot read properties of undefined` at runtime.
- **Top Offenders:**
    - Likely in components accessing optional props or context values without checking.
    - Likely in API responses where data is assumed to be present.

### 3. `@ts-ignore` Usage
- **Count:** 0
- **Status:** **Excellent**. No explicit suppression of type errors.

## Recommendations
1.  **Replace `any` with `unknown` or specific types.** Use Zod schemas to validate `unknown` data at runtime.
2.  **Remove `!` assertions.** Use optional chaining (`?.`) and nullish coalescing (`??`) or explicit guards (`if (!value) return`).
3.  **Strict Null Checks:** Ensure `strictNullChecks` is enabled (implied by `strict: true`) and respect it.

## Detailed Logs
- `reports/any-usage.txt`: List of files using `any`.
- `reports/non-null-assertions.txt`: List of files using `!`.
