# Genkit Dev Server Security Assessment

Generated on: 2026-02-17T19:19:35.188Z

## Environment Guards

⚠️ Issues Found:
- ⚠️ No explicit environment guard found in `src/ai/dev.ts`. Ensure it is not bundled in production.

## Production Code Exposure

✅ No production code imports `src/ai/dev.ts`.
