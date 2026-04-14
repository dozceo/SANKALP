# Bundle Size Analysis Report

**Date:** 2026-02-17T19:09:45.705Z

## Build Failed

The build could not complete, likely due to missing environment variables or dependencies. Below is a static analysis of file sizes in `src/app`.

### Static File Analysis

| File Path | Size (KB) |
|---|---|
| `src/app/(main)/teacher/students/page.tsx` | 18.89 |
| `src/app/(main)/teacher/classes/page.tsx` | 17.76 |
| `src/app/(auth)/teacher-onboarding/page.tsx` | 17.76 |
| `src/app/(main)/teacher/classes/[classId]/page.tsx` | 16.51 |
| `src/app/(auth)/onboarding/page.tsx` | 16.27 |
| `src/app/favicon.ico` | 14.73 |
| `src/app/(main)/classes/page.tsx` | 13.80 |
| `src/app/(main)/teacher/students/[studentId]/page.tsx` | 12.85 |
| `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx` | 11.75 |
| `src/app/(main)/quiz/page.tsx` | 11.48 |
| `src/app/(main)/chat/page.tsx` | 10.47 |
| `src/app/(main)/home/page.tsx` | 10.20 |
| `src/app/api/intelligence/student/route.ts` | 10.08 |
| `src/app/(main)/syllabus/page.tsx` | 9.70 |
| `src/app/(main)/teacher/page.tsx` | 8.31 |
| `src/app/(main)/rewards/page.tsx` | 8.00 |
| `src/app/(main)/brain-map/page.tsx` | 7.20 |
| `src/app/(auth)/sign-up/page.tsx` | 6.30 |
| `src/app/(auth)/login/page.tsx` | 6.08 |
| `src/app/api/activity/log/route.ts` | 5.77 |

### Build Error Log

```

Stdout:

Installing devDependencies (pnpm):
- typescript

Progress: resolved 0, reused 0, downloaded 1, added 0

   ╭──────────────────────────────────────────╮
   │                                          │
   │   Update available! 10.28.0 → 10.30.0.   │
   │   Changelog: https://pnpm.io/v/10.30.0   │
   │     To update, run: pnpm add -g pnpm     │
   │                                          │
   ╰──────────────────────────────────────────╯

Progress: resolved 17, reused 0, downloaded 15, added 0
Progress: resolved 33, reused 0, downloaded 30, added 0
Progress: resolved 45, reused 0, downloaded 42, added 0
Progress: resolved 48, reused 0, downloaded 45, added 0
Progress: resolved 50, reused 0, downloaded 47, added 0
Progress: resolved 55, reused 0, downloaded 52, added 0
Progress: resolved 61, reused 0, downloaded 60, added 0
Progress: resolved 62, reused 0, downloaded 62, added 0
Progress: resolved 63, reused 0, downloaded 63, added 0
Progress: resolved 63, reused 0, downloaded 64, added 0
Progress: resolved 74, reused 0, downloaded 65, added 0
Progress: resolved 87, reused 0, downloaded 72, added 0
Progress: resolved 172, reused 0, downloaded 157, added 0
Progress: resolved 214, reused 0, downloaded 199, added 0
Progress: resolved 271, reused 0, downloaded 269, added 0
Progress: resolved 350, reused 0, downloaded 349, added 0
Progress: resolved 402, reused 0, downloaded 393, added 0
Progress: resolved 426, reused 0, downloaded 413, added 0
Progress: resolved 447, reused 0, downloaded 431, added 0
Progress: resolved 455, reused 0, downloaded 437, added 0
Progress: resolved 472, reused 0, downloaded 442, added 0
Progress: resolved 476, reused 0, downloaded 442, added 0
Progress: resolved 494, reused 0, downloaded 442, added 0
Progress: resolved 510, reused 0, downloaded 442, added 0
 WARN  Request took 10165ms: https://registry.npmjs.org/@typescript-eslint%2Fparser
Progress: resolved 526, reused 0, downloaded 443, added 0
 WARN  Request took 11444ms: https://re...
```

## Recommendations
- **Code Splitting:** Ensure heavy components are imported dynamically using `next/dynamic`.
- **Dependencies:** Analyze `package.json` for unused or large libraries.
- **Images:** Use `next/image` for automatic optimization.
