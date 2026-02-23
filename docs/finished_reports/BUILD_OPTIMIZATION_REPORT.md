# Build Time Optimization Report

## Executive Summary
Analysis of the Next.js build pipeline to identify slow compilation paths and configuration inefficiencies.

**Total Build Time:** 136.87s
**Build Status:** Success

## Configuration Analysis
The following settings in `next.config.ts` impact build performance:

- **Sentry Integration**: Sentry webpack plugin is enabled. This significantly increases build times due to source map generation and uploading.
- **TypeScript Errors Ignored**: `ignoreBuildErrors: true` speeds up build but risks shipping type errors to production.
- **ESLint Ignored**: `ignoreDuringBuilds: true` speeds up build but skips linting checks.

## Compilation Performance

Could not extract granular page timings. This might be due to build failure or output format changes.

**Raw Build Output Snippet (last 20 lines):**
```
├ ○ /teacher-onboarding                      3.44 kB         248 kB
├ ○ /teacher/classes                         5.56 kB         287 kB
├ ƒ /teacher/classes/[classId]               6.24 kB         117 kB
├ ƒ /teacher/student/[studentId]               374 B         258 kB
├ ○ /teacher/students                        3.45 kB         254 kB
├ ƒ /teacher/students/[studentId]            7.47 kB         118 kB
├ ○ /test-accessibility                      5.58 kB         117 kB
└ ○ /test-charts                               360 B         257 kB
+ First Load JS shared by all                 102 kB
  ├ chunks/1255-d3f9f88e89ba1c3c.js          45.4 kB
  ├ chunks/4bd1b696-a2f84591164abdd2.js      54.4 kB
  └ other shared chunks (total)              2.36 kB


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


[@sentry/nextjs] The Sentry SDK has enabled source map generation for your Next.js app. If you don't want to serve Source Maps to your users, either set the `sourcemaps.deleteSourcemapsAfterUpload` option to true, or manually delete the source maps after the build. In future Sentry SDK versions `sourcemaps.deleteSourcemapsAfterUpload` will default to `true`. If you do not want to generate and upload sourcemaps, set the `sourcemaps.disable` option in `withSentryConfig()`.

```

## Recommendations

1. **Sentry Optimization:** If Sentry is not needed for all builds (e.g. dev/preview), conditionally disable it using `process.env.ENABLE_SENTRY`.
2. **Modularize Large Pages:** Pages taking >2s to compile often contain too many imports. Use `next/dynamic` for heavy components (charts, maps).
3. **Cache CI Artifacts:** Ensure `.next/cache` is restored between CI runs.
