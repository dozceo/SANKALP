# Bundle Size Analysis

**Date:** 2026-02-16T19:37:56.175Z

## Build Output Summary

```
Route (app)                                     Size  First Load JS
┌ ○ /                                         3.1 kB         211 kB
├ ○ /_not-found                              1.15 kB         103 kB
├ ƒ /api/activity/log                          387 B         103 kB
├ ƒ /api/brainmap/nodes                        387 B         103 kB
├ ƒ /api/classes/create                        387 B         103 kB
├ ƒ /api/classes/join                          387 B         103 kB
├ ƒ /api/classes/leave                         386 B         103 kB
├ ƒ /api/intelligence/student                  388 B         103 kB
├ ƒ /api/planner/convert-to-node               387 B         103 kB
├ ƒ /api/planner/data                          387 B         103 kB
├ ƒ /api/planner/review                        386 B         103 kB
├ ƒ /api/quiz/submit                           388 B         103 kB
├ ƒ /api/sankalp/session/end                   386 B         103 kB
├ ƒ /api/sankalp/session/start                 387 B         103 kB
├ ƒ /api/student                               387 B         103 kB
├ ƒ /api/student/graph                         387 B         103 kB
├ ƒ /api/student/onboard                       387 B         103 kB
├ ƒ /api/students/create                       386 B         103 kB
├ ƒ /api/syllabus/save                         386 B         103 kB
├ ƒ /api/teacher                               386 B         103 kB
├ ƒ /api/teacher/classes                       388 B         103 kB
├ ƒ /api/teacher/classes/[classId]             386 B         103 kB
├ ƒ /api/teacher/classes/[classId]/students    387 B         103 kB
├ ƒ /api/teacher/graph                         387 B         103 kB
├ ƒ /api/teacher/onboard                       387 B         103 kB
├ ƒ /api/teacher/students                      387 B         103 kB
├ ƒ /api/teacher/students/[studentId]          387 B         103 kB
├ ƒ /api/teachers/create                       386 B         103 kB
├ ƒ /api/users/[userId]                        386 B         103 kB
├ ƒ /api/users/create                          387 B         103 kB
├ ○ /brain-map                               3.28 kB         260 kB
├ ○ /chat                                    7.39 kB         170 kB
├ ○ /classes                                 10.3 kB         239 kB
├ ○ /home                                    13.8 kB         271 kB
├ ○ /join-class                              5.87 kB         222 kB
├ ○ /login                                    4.3 kB         236 kB
├ ○ /mentor                                  5.93 kB         123 kB
├ ○ /onboarding                              3.38 kB         237 kB
├ ○ /planner                                   14 kB         267 kB
├ ○ /profile                                 9.34 kB         232 kB
├ ○ /quiz                                    6.07 kB         283 kB
├ ○ /rewards                                   11 kB         333 kB
├ ○ /settings                                11.4 kB         265 kB
├ ○ /sign-up                                 3.69 kB         235 kB
├ ○ /syllabus                                10.9 kB         244 kB
├ ○ /teacher                                 9.38 kB         282 kB
├ ○ /teacher-onboarding                      3.12 kB         224 kB
├ ○ /teacher/classes                         5.56 kB         287 kB
├ ƒ /teacher/classes/[classId]               6.24 kB         117 kB
├ ƒ /teacher/student/[studentId]               375 B         257 kB
├ ○ /teacher/students                        3.45 kB         254 kB
├ ƒ /teacher/students/[studentId]            7.47 kB         118 kB
├ ○ /test-accessibility                      5.58 kB         117 kB
└ ○ /test-charts                               359 B         257 kB
+ First Load JS shared by all                 102 kB
  ├ chunks/1255-d3f9f88e89ba1c3c.js          45.4 kB
  ├ chunks/4bd1b696-a2f84591164abdd2.js      54.4 kB
  └ other shared chunks (total)              2.36 kB


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


[@sentry/nextjs] The Sentry SDK has enabled source map generation for your Next.js app. If you don't want to serve Source Maps to your users, either set the `sourcemaps.deleteSourcemapsAfterUpload` option to true, or manually delete the source maps after the build. In future Sentry SDK versions `sourcemaps.deleteSourcemapsAfterUpload` will default to `true`. If you do not want to generate and upload sourcemaps, set the `sourcemaps.disable` option in `withSentryConfig()`.

```

## Recommendations
- Analyze large pages (>150kB First Load JS).
- Use dynamic imports (`next/dynamic`) for heavy components.
- Check `package.json` for unused large dependencies.
