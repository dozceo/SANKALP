# Loading UX Consistency Report

**Date:** 2026-02-17T19:34:57.493Z

Scanned **25** pages in `src/app`.

## Summary
- **Pages with `loading.tsx`:** 0
- **Pages with internal loading (Suspense/Skeleton) but no `loading.tsx`:** 2
- **Pages without evident loading state:** 23

## ⚠️ Pages Missing Loading UI
The following pages do not have a `loading.tsx` file and do not appear to use `<Suspense>` or `<Skeleton>` components internally. Use caution as these might show a blank screen during data fetching.

- `/(auth)/join-class/page.tsx` (Client)
- `/(auth)/login/page.tsx` (Client)
- `/(auth)/onboarding/page.tsx` (Client)
- `/(auth)/sign-up/page.tsx` (Client)
- `/(auth)/teacher-onboarding/page.tsx` (Client)
- `/(main)/brain-map/page.tsx` (Client)
- `/(main)/chat/page.tsx` (Client)
- `/(main)/classes/page.tsx` (Client)
- `/(main)/home/page.tsx` (Client)
- `/(main)/mentor/page.tsx` (Client)
- `/(main)/planner/page.tsx` (Client)
- `/(main)/quiz/page.tsx` (Client)
- `/(main)/settings/page.tsx` (Client)
- `/(main)/syllabus/page.tsx` (Client)
- `/(main)/teacher/classes/[classId]/page.tsx` (Client)
- `/(main)/teacher/classes/page.tsx` (Client)
- `/(main)/teacher/page.tsx` (Client)
- `/(main)/teacher/student/[studentId]/page.tsx` (Server)
- `/(main)/teacher/students/[studentId]/page.tsx` (Client)
- `/(main)/teacher/students/page.tsx` (Client)
- `/page.tsx` (Client)
- `/test-accessibility/page.tsx` (Server)
- `/test-charts/page.tsx` (Server)

## ℹ️ Pages with Internal Loading Logic
These pages lack `loading.tsx` but seem to handle loading internally.

- `/(main)/profile/page.tsx` (Suspense: false, Skeleton: true)
- `/(main)/rewards/page.tsx` (Suspense: false, Skeleton: true)
