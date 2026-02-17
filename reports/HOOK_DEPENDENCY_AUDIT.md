# React Hook Dependency Audit

## Executive Summary
**Date:** 2024-05-23
**Scope:** `src/app`, `src/components`
**Tool:** ESLint (`eslint-plugin-react-hooks`)

## Findings
Multiple instances of missing dependencies in `useEffect` and `useMemo` were found. These can lead to stale closures, infinite loops, or unexpected re-renders.

### Critical Violations

#### 1. API Fetching Stale Closures
Functions defined inside or outside components are used in `useEffect` without being included in the dependency array. This often means the effect runs with a stale version of the function or doesn't re-run when it should.

- **`src/app/(main)/teacher/classes/[classId]/page.tsx`**
    - Missing dependency: `fetchClassDetails`
- **`src/app/(main)/teacher/classes/page.tsx`**
    - Missing dependency: `fetchClasses`
- **`src/app/(main)/teacher/students/[studentId]/page.tsx`**
    - Missing dependency: `fetchStudentDetails`
- **`src/app/(main)/teacher/students/page.tsx`**
    - Missing dependency: `fetchStudents`

**Recommendation:** Wrap these fetch functions in `useCallback` or move them inside the `useEffect`.

#### 2. Event Handlers in Effects
- **`src/components/SankalpSwitch.tsx`**
    - Missing dependency: `handleEnd`
- **`src/components/planner/FocusTimer.tsx`**
    - Missing dependency: `handleTimerComplete`

**Recommendation:** Wrap handlers in `useCallback` to ensure stable identity, then add to dependency array.

#### 3. Unstable Object Identities in useMemo
- **`src/components/planner/FocusTimer.tsx`**
- **`src/components/planner/ScheduleView.tsx`**
- **`src/components/planner/StudyLibrary.tsx`**
    - `studyMaterials` initialization creates a new object/array reference on every render, causing `useMemo` to recompute unnecessarily.

**Recommendation:** Wrap the initialization of `studyMaterials` in its own `useMemo` or move it outside the component if static.

#### 4. Miscellaneous
- **`src/app/(main)/teacher/page.tsx`**
    - Missing dependency: `toast`.

## Remediation Plan
1.  **Refactor Fetch Logic:** Move data fetching logic inside `useEffect` where possible to avoid dependency complexity.
2.  **Stabilize Callbacks:** Use `useCallback` for functions passed as props or used in effects.
3.  **Memoize Data:** Ensure objects/arrays used in dependency arrays are stable (memoized).
