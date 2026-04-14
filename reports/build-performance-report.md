# Build Time Optimization Report

**Date:** 2026-02-17T19:26:41.857Z

## Build Summary

### Page Sizes

```
Route (app)                                     Size  First Load JS
┌ ○ /                                        3.09 kB         210 kB
├ ○ /_not-found                              1.15 kB         103 kB
├ ƒ /api/activity/log                          393 B         103 kB
├ ƒ /api/brainmap/nodes                        394 B         103 kB
├ ƒ /api/chaos                                 394 B         103 kB
├ ƒ /api/classes/create                        393 B         103 kB
├ ƒ /api/classes/join                          394 B         103 kB
├ ƒ /api/classes/leave                         393 B         103 kB
├ ƒ /api/intelligence/student                  394 B         103 kB
├ ƒ /api/planner/convert-to-node               394 B         103 kB
├ ƒ /api/planner/data                          394 B         103 kB
├ ƒ /api/planner/review                        394 B         103 kB
├ ƒ /api/quiz/submit                           395 B         103 kB
├ ƒ /api/sankalp/session/end                   393 B         103 kB
├ ƒ /api/sankalp/session/start                 394 B         103 kB
├ ƒ /api/student                               394 B         103 kB
├ ƒ /api/student/graph                         394 B         103 kB
├ ƒ /api/student/onboard                       393 B         103 kB
├ ƒ /api/students/create                       394 B         103 kB
├ ƒ /api/syllabus/save                         394 B         103 kB
├ ƒ /api/teacher                               394 B         103 kB
├ ƒ /api/teacher/classes                       393 B         103 kB
├ ƒ /api/teacher/classes/[classId]             394 B         103 kB
├ ƒ /api/teacher/classes/[classId]/students    393 B         103 kB
├ ƒ /api/teacher/graph                         393 B         103 kB
├ ƒ /api/teacher/onboard                       393 B         103 kB
├ ƒ /api/teacher/students                      393 B         103 kB
├ ƒ /api/teacher/students/[studentId]          394 B         103 kB
├ ƒ /api/teachers/create                       394 B         103 kB
├ ƒ /api/test/seed                             394 B         103 kB
├ ƒ /api/users/[userId]                        393 B         103 kB
├ ƒ /api/users/create                          394 B         103 kB
├ ○ /brain-map                               3.29 kB         258 kB
├ ○ /chat                                    7.33 kB         170 kB
├ ○ /classes                                 10.3 kB         238 kB
├ ○ /home                                    13.8 kB         270 kB
├ ○ /join-class                               5.4 kB         244 kB
├ ○ /login                                   2.26 kB         249 kB
├ ○ /mentor                                  5.92 kB         123 kB
├ ○ /onboarding                              3.56 kB         259 kB
├ ○ /planner                                   14 kB         266 kB
├ ○ /profile                                 9.17 kB         231 kB
├ ○ /quiz                                    8.66 kB         281 kB
├ ○ /rewards                                 11.1 kB         332 kB
├ ○ /settings                                11.5 kB         264 kB
├ ○ /sign-up                                 2.52 kB         258 kB
├ ○ /syllabus                                10.8 kB         243 kB
├ ○ /teacher                                 9.21 kB         280 kB
├ ○ /teacher-onboarding                      3.43 kB         247 kB
├ ○ /teacher/classes                         5.39 kB         285 kB
├ ƒ /teacher/classes/[classId]               6.21 kB         117 kB
├ ƒ /teacher/student/[studentId]               379 B         256 kB
├ ○ /teacher/students                        3.46 kB         253 kB
├ ƒ /teacher/students/[studentId]            7.52 kB         119 kB
├ ○ /test-accessibility                      5.65 kB         117 kB
└ ○ /test-charts                               365 B         256 kB
+ First Load JS shared by all                 102 kB
  ├ chunks/67795fcc-919e8f731834cd4d.js      54.4 kB
  ├ chunks/8820-c75c138fa124562f.js          45.4 kB
  └ other shared chunks (total)              2.36 kB


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


```

### ⚠️ Large Pages Detected (>150kB First Load JS)

- `┌ ○ /                                        3.09 kB         210 kB`
- `├ ○ /brain-map                               3.29 kB         258 kB`
- `├ ○ /chat                                    7.33 kB         170 kB`
- `├ ○ /classes                                 10.3 kB         238 kB`
- `├ ○ /home                                    13.8 kB         270 kB`
- `├ ○ /join-class                               5.4 kB         244 kB`
- `├ ○ /login                                   2.26 kB         249 kB`
- `├ ○ /onboarding                              3.56 kB         259 kB`
- `├ ○ /planner                                   14 kB         266 kB`
- `├ ○ /profile                                 9.17 kB         231 kB`
- `├ ○ /quiz                                    8.66 kB         281 kB`
- `├ ○ /rewards                                 11.1 kB         332 kB`
- `├ ○ /settings                                11.5 kB         264 kB`
- `├ ○ /sign-up                                 2.52 kB         258 kB`
- `├ ○ /syllabus                                10.8 kB         243 kB`
- `├ ○ /teacher                                 9.21 kB         280 kB`
- `├ ○ /teacher-onboarding                      3.43 kB         247 kB`
- `├ ○ /teacher/classes                         5.39 kB         285 kB`
- `├ ƒ /teacher/student/[studentId]               379 B         256 kB`
- `├ ○ /teacher/students                        3.46 kB         253 kB`
- `└ ○ /test-charts                               365 B         256 kB`

**Recommendation:** Use dynamic imports or code splitting for these routes.

## Recommendations
1. **Enable Build Traces:** Add `experimental: { turbotrace: {} }` or checks in `next.config.ts` for deeper analysis.
2. **Linting/Type Checking:** Currently disabled in `next.config.ts` (`ignoreBuildErrors: true`). Enabling these might catch issues early but increase build time.
3. **Caching:** Ensure `.next/cache` is preserved between builds in CI/CD.
