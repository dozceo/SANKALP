# Secret Exposure Report

**Date:** 2026-02-19T19:12:48.715Z

**Total Findings:** 8

| File | Line | Type | Snippet (Redacted) |
|---|---|---|---|
| `env.txt` | 1 | Google API Key | `GEMINI_API_KEY=REDACTED` |
| `env.txt` | 1 | Firebase API Key | `GEMINI_API_KEY=REDACTED` |
| `.env.local` | 1 | Google API Key | `GEMINI_API_KEY=REDACTED` |
| `.env.local` | 1 | Firebase API Key | `GEMINI_API_KEY=REDACTED` |
| `.env.local` | 4 | Google API Key | `NEXT_PUBLIC_FIREBASE_API_KEY=REDACTED` |
| `.env.local` | 4 | Firebase API Key | `NEXT_PUBLIC_FIREBASE_API_KEY=REDACTED` |
| `.env.local` | 11 | Google API Key | `GOOGLE_GENAI_API_KEY=REDACTED` |
| `.env.local` | 11 | Firebase API Key | `GOOGLE_GENAI_API_KEY=REDACTED` |


## Remediation Steps
1. **Rotate Compromised Keys:** Any key found in this report should be considered compromised. Revoke it immediately and generate a new one.
2. **Remove from History:** Use tools like `git filter-repo` or BFG Repo-Cleaner to remove the sensitive file from git history.
3. **Use Environment Variables:** Store secrets in `.env.local` (which is gitignored) and access them via `process.env`.
4. **Check .gitignore:** Ensure `env.txt`, `.env`, and similar files are added to `.gitignore`.
