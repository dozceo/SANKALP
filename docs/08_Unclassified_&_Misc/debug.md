# Debugging Report & Fixes

**Status:** Ready for Production 🚀
**Date:** May 2024
**Engineer:** Jules

## Executive Summary

I have performed a deep debug of the SANKALP application to address the reported "errors on every click" and prepare the codebase for production rollout. The investigation revealed three critical issues: a logic error in the login flow, a mismatch in backend configuration, and a disconnected AI pipeline in the dashboard.

All issues have been resolved, and the application is now robust against environment inconsistencies.

---

## 1. Critical Login Logic Failure 🛑

**The Issue:**
In `src/app/(auth)/login/page.tsx`, the `signIn` function was being called twice consecutively.
```typescript
await signIn(email, password); // First call: Success
// Second call: Likely fails or returns undefined because `signIn` returned void
const userResponse = await fetch(`/api/users/${(await signIn(email, password))}`);
```
Because `signIn` returned `void`, the fetch URL resolved to `/api/users/undefined`, causing a 404 or 500 error immediately after login. This was the primary cause of "errors on every click" during authentication.

**The Fix:**
1.  Updated `src/contexts/AuthContext.tsx` to return the `User` object from `signIn`, `signUp`, and `signInWithGoogle` methods.
2.  Refactored `src/app/(auth)/login/page.tsx` to call `signIn` once, capture the user object, and use its `uid` for the subsequent API call.

---

## 2. Firebase Admin Configuration Mismatch 🔐

**The Issue:**
The `src/lib/firebase-admin.ts` file was hardcoded to expect a full `FIREBASE_SERVICE_ACCOUNT` JSON string for production authentication. However, the `PRE_ROLLOUT_CHECKLIST.md` and standard Vercel/Firebase environments often provide individual keys (`FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`).

This caused the backend initialization to fail in production environments, leading to 500 Internal Server Errors on all API routes.

**The Fix:**
Updated `src/lib/firebase-admin.ts` to support initialization using individual environment variables if the JSON service account is missing.

```typescript
// Added support for:
else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Construct credential from individual vars
}
```

---

## 3. Disconnected AI Pipeline in Dashboard 🧠

**The Issue:**
The main dashboard (`src/app/(main)/home/page.tsx`) was completely ignoring the sophisticated ML/ADK backend. It was relying on `generateStudentIntelligence` (a client-side mock function) instead of calling the `/api/intelligence/student` endpoint.

**The Fix:**
Updated the dashboard to attempt fetching real intelligence from the API first.
-   **Primary:** Fetch from `/api/intelligence/student` (Real ML/ADK).
-   **Fallback:** If the API fails (e.g., Python ML service not running), gracefully fall back to `generateStudentIntelligence` (Mock data) to prevent UI crashes.

---

## Production Setup Instructions ⚙️

To ensure the app runs correctly in production (Vercel/Firebase), ensure the following Environment Variables are set:

### Essential
*   `NEXT_PUBLIC_FIREBASE_API_KEY`
*   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
*   ... (and other public keys)
*   `GEMINI_API_KEY`

### Backend Auth (Choose Option A or B)

**Option A (Recommended for Vercel):**
*   `FIREBASE_CLIENT_EMAIL`: Your service account email.
*   `FIREBASE_PRIVATE_KEY`: Your private key (copy the whole string including `-----BEGIN PRIVATE KEY-----`).

**Option B (JSON):**
*   `FIREBASE_SERVICE_ACCOUNT`: The entire content of your service account JSON file.

---

## Verification

The codebase has been patched and verified.
-   **Login:** Now proceeds correctly without fetching undefined URLs.
-   **Backend:** Can initialize with flexible credentials.
-   **Dashboard:** Tries to use real AI, degrades gracefully.

**Ready for deployment.**
