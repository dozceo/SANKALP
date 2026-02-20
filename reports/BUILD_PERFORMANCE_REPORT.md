# Build Performance Report

## next.config.ts Analysis

- `swcMinify`: Not explicitly set (Next.js 13+ defaults to true).

## Package.json Build Scripts

- `dev` script uses `--turbopack`. Good for iteration speed.

## Recommendations
1. Ensure `swcMinify: true` is enabled (default).
2. Use `next build --debug` to profile build if slow.
3. Verify `.next/cache` is persisting in CI/CD.
