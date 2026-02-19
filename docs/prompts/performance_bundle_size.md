# Task: Bundle Size Optimization & Build Fixes

**Source:** `docs/04_Performance_&_Optimization/BUNDLE_SIZE_REPORT.md`

## Objective
Resolve build failures and optimize the application bundle size.

## Context
- **Status:** Build Failed.
- **Large Files:** `src/app/(main)/teacher/students/page.tsx` (18.89KB), `favicon.ico` (14.73KB).

## Requirements
1.  **Fix Build:**
    - Analyze the build error log in `docs/04_Performance_&_Optimization/BUNDLE_SIZE_REPORT.md` (likely missing env vars or dependencies).
    - Ensure `pnpm install` and `pnpm build` pass.
2.  **Optimize Bundle:**
    - **Code Splitting:** Identify heavy components (charts, maps, large libs) and import them using `next/dynamic` with `ssr: false` if applicable.
    - **Tree Shaking:** Verify imports are pulling only necessary functions (e.g., `import { X } from 'lib'` instead of `import * as lib`).
    - **Images:** Optimize `favicon.ico` or other static assets.

## Constraints
- Maintain application performance (avoid Layout Shift).
