# Secret Exposure Report

**Date:** 2026-02-20T02:19:39.540Z
**Files Scanned:** env.txt, .env.local, src/**

## Summary
Found 2 potential secrets.

## Detailed Findings

| File | Line | Type | Snippet |
|------|------|------|---------|
| `env.txt` | 1 | Google API Key | `GEMINI_API_KEY=AIz***` |
| `.env.local` | 11 | Google API Key | `GOOGLE_GENAI_API_KEY=AIz***` |

## Remediation Steps
1. **Rotate Credentials:** Immediately revoke and rotate any exposed keys.
2. **Use Environment Variables:** Move secrets to `.env` (and ensure it's gitignored).
3. **Check Git History:** Use tools like BFG Repo-Cleaner to remove secrets from history.
