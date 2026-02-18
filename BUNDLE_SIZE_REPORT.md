# Bundle Size Analysis Report

**Date:** 2026-02-18T19:10:39.176Z

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
| `src/app/api/intelligence/student/route.ts` | 10.01 |
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

Progress: resolved 44, reused 0, downloaded 44, added 0
Progress: resolved 53, reused 0, downloaded 53, added 0
Progress: resolved 54, reused 0, downloaded 54, added 0
Progress: resolved 64, reused 0, downloaded 64, added 0
Progress: resolved 64, reused 0, downloaded 65, added 0
Progress: resolved 150, reused 0, downloaded 138, added 0
Progress: resolved 283, reused 0, downloaded 273, added 0
Progress: resolved 354, reused 0, downloaded 344, added 0
Progress: resolved 445, reused 0, downloaded 435, added 0
Progress: resolved 504, reused 0, downloaded 480, added 0
Progress: resolved 584, reused 0, downloaded 484, added 0
Progress: resolved 603, reused 0, downloaded 498, added 0
Progress: resolved 699, reused 0, downloaded 604, added 0
Progress: resolved 869, reused 0, downloaded 778, added 0
Progress: resolved 1086, reused 0, downloaded 997, added 0
Progress: resolved 1195, reused 0, downloaded 1105, added 0
Progress: resolved 1294, reused 0, downloaded 1198, added 0
Progress: resolved 1295, reused 0, downloaded 1200, added 0
Progress: resolved 1299, reused 0, downloaded 1203, added 0
Progress: resolved 1343, reused 0, downloaded 1248, added 0
 WARN  4 deprecated subdependencies found: @opentelemetry/exporter-jaeger@1.30.1, glob@10.5.0, glob@9.3.5, node-domexception@1.0.0
Packages: +1243
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 1343, reused 0, downloaded 1248, added 763
Progress: resolved 1343, reused 0, downloaded 1248, added 1243, done
 WARN  Issues with peer depen...
```

## Recommendations
- **Code Splitting:** Ensure heavy components are imported dynamically using `next/dynamic`.
- **Dependencies:** Analyze `package.json` for unused or large libraries.
- **Images:** Use `next/image` for automatic optimization.
