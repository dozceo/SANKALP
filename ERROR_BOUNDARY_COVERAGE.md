# Error Boundary Coverage Report

## Executive Summary
Audit of error handling coverage using Next.js `error.tsx` files and React `<ErrorBoundary>` components.

## App Router Coverage (error.tsx)

| Route Segment | Has error.tsx | Effective Coverage |
|---|---|---|
| `/` | ❌ | ❌ |
| `(auth)` | ❌ | ❌ |
| `(auth)/join-class` | ❌ | ❌ |
| `(auth)/login` | ❌ | ❌ |
| `(auth)/onboarding` | ❌ | ❌ |
| `(auth)/sign-up` | ❌ | ❌ |
| `(auth)/teacher-onboarding` | ❌ | ❌ |
| `(main)` | ❌ | ❌ |
| `(main)/brain-map` | ❌ | ❌ |
| `(main)/chat` | ❌ | ❌ |
| `(main)/classes` | ❌ | ❌ |
| `(main)/home` | ❌ | ❌ |
| `(main)/mentor` | ❌ | ❌ |
| `(main)/planner` | ❌ | ❌ |
| `(main)/profile` | ❌ | ❌ |
| `(main)/quiz` | ❌ | ❌ |
| `(main)/rewards` | ❌ | ❌ |
| `(main)/settings` | ❌ | ❌ |
| `(main)/syllabus` | ❌ | ❌ |
| `(main)/teacher` | ❌ | ❌ |
| `(main)/teacher/classes` | ❌ | ❌ |
| `(main)/teacher/classes/[classId]` | ❌ | ❌ |
| `(main)/teacher/student/[studentId]` | ❌ | ❌ |
| `(main)/teacher/students` | ❌ | ❌ |
| `(main)/teacher/students/[studentId]` | ❌ | ❌ |
| `test-accessibility` | ❌ | ❌ |
| `test-charts` | ❌ | ❌ |

## Component-Level Usage (<ErrorBoundary>)

Found 1 usages in components:

- `src/components/ErrorBoundary.tsx`

## Recommendations

1. **Add Global Error Boundary:** Ensure the root `src/app/error.tsx` or `src/app/global-error.tsx` exists to catch root layout errors.
2. **Segment-Level Handling:** Add `error.tsx` to critical feature roots (e.g. `/(main)` or `/dashboard`) to isolate failures.
3. **Component Wrappers:** Wrap unstable widgets (like charts or AI outputs) in local `<ErrorBoundary>` to prevent page crashes.
