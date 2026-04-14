# Build Time Optimization Path Analysis

**Date:** 2024-05-23
**Scope:** next.config.ts, build pipeline

## Summary
The build pipeline shows significant configuration issues that likely obscure real errors and lead to inconsistent builds. A key finding is a version mismatch where `npx next build` attempts to use Next.js v16.1.6 while the project specifies `^15.5.7`.

## Critical Findings

### 1. Build Configuration: Error Suppression
**File:** `next.config.ts`
```typescript
typescript: {
  ignoreBuildErrors: true,
},
eslint: {
  ignoreDuringBuilds: true,
},
```
**Impact:** The build succeeds even if the code is broken. This defeats the purpose of a build step as a gatekeeper for quality. It pushes runtime errors to production.
**Recommendation:** Set these to `false` immediately and fix the underlying errors.

### 2. Version Mismatch & Dependency Issues
**Observation:** Running `npx next build` triggered an installation of `next@16.1.6`, despite `package.json` locking to `^15.5.7`.
**Impact:** Discrepancy between development and build environments. Next.js 16 is a major version upgrade with potential breaking changes.
**Recommendation:** Ensure `npm install` is run correctly in the CI environment so that the local `node_modules/.bin/next` is used, matching the `package.json` version.

### 3. Source Maps & Sentry
**File:** `next.config.ts`
```typescript
hideSourceMaps: true,
```
**Observation:** Source maps are hidden in client bundles (good for security/size), but `widenClientFileUpload: true` uploads them to Sentry.
**Impact:** This is a good configuration for production monitoring but increases build time due to map generation and upload.
**Optimization:** If build speed is critical in dev/staging, conditionally disable Sentry plugin or source map generation based on environment (e.g., `process.env.CI`).

## Performance Recommendations
1.  **Fix Dependencies:** ensure `next` binary is found in `node_modules` to avoid `npx` downloading a newer version.
2.  **Enable Strict Build:** Remove `ignoreBuildErrors` to catch issues early, preventing "successful" builds that fail at runtime.
3.  **Modularize Build:** If the app grows, consider Nx or Turborepo to cache build artifacts for unchanged modules (the project already uses `turbopack` for dev, which is good).
