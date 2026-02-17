# Secret Exposure Report

**Date:** 2024-05-23
**Domain:** Security
**Scope:** `env.txt`, `.env.local`, `src/`, Git History

## Executive Summary
A scan of the codebase and git history revealed multiple instances of hardcoded secrets and insecure environment variable management. Critical API keys (Gemini, Firebase) are exposed in plain text in version-controlled files.

## Findings

### 1. Hardcoded Secrets in Files
*   **File:** `env.txt`
    *   **Secret:** `GEMINI_API_KEY` (starts with `AIzaSy...`)
    *   **Risk:** Critical. This file is tracked in git and exposes the AI service key.
*   **File:** `.env.local`
    *   **Secret:** `GEMINI_API_KEY`, `GOOGLE_GENAI_API_KEY`, `NEXT_PUBLIC_FIREBASE_API_KEY`
    *   **Risk:** Critical. `.env.local` is typically ignored, but it was found in the git history (Commit `00ceb11`).
*   **File:** `apphosting.yaml`
    *   **Secret:** `NEXT_PUBLIC_FIREBASE_API_KEY`
    *   **Risk:** Moderate. Firebase API keys are generally public, but hardcoding them in configuration files makes rotation difficult and can expose project IDs to scraping.

### 2. Git History Exposure
*   **Commit:** `00ceb116a844d4a1930cebee9118dcdd3f9803a1`
*   **Author:** dozceo <dozschizo@gmail.com>
*   **Date:** Mon Feb 16 19:21:04 2026 +0530
*   **Description:** Added `.env.local`, `env.txt`, and `apphosting.yaml` with raw secrets.

### 3. Source Code Scan
*   **File:** `src/lib/firebase.ts`
    *   **Status:** Safe. Uses `process.env` correctly.
*   **File:** `src/ai/genkit.ts`
    *   **Status:** Safe. Uses `process.env` correctly, though it logs the presence of keys (boolean only).

## Remediation Steps

1.  **Immediate Credential Rotation:**
    *   Revoke the exposed `GEMINI_API_KEY` and `GOOGLE_GENAI_API_KEY` in the Google Cloud Console.
    *   Generate new keys.

2.  **Git Cleanup:**
    *   Remove `env.txt` and `.env.local` from the repository:
        ```bash
        git rm --cached env.txt .env.local
        ```
    *   Add them to `.gitignore`.
    *   Use `git-filter-repo` or BFG Repo-Cleaner to scrub the history (if this is a private repo; if public, assume keys are compromised forever).

3.  **Configuration Management:**
    *   Update `apphosting.yaml` to use secret references (e.g., `secret: GOOGLE_GENAI_API_KEY`) instead of raw values for sensitive keys.
    *   For Firebase public keys, use environment variables injected at build time rather than hardcoding in YAML if possible, though they are technically public.

4.  **Prevention:**
    *   Install a pre-commit hook (e.g., `git-secrets` or `trufflehog`) to prevent future commits of secrets.
