# Server Action Security Matrix

**Date:** 2026-02-19T19:07:53.270Z

**Total Actions Scanned:** 9

**High Risk Actions (Missing Auth):** 9

| File | Function | Risk Level | Auth Detected |
|---|---|---|---|
| `src/app/actions/student-configuration.ts` | `saveChatbotConfiguration` | 🔴 HIGH | No |
| `src/app/actions/ai-error.ts` | `generateFriendlyErrorMessage` | 🔴 HIGH | No |
| `src/app/(main)/syllabus/actions.ts` | `getSyllabus` | 🔴 HIGH | No |
| `src/app/(main)/quiz/actions.ts` | `createQuiz` | 🔴 HIGH | No |
| `src/app/(main)/planner/actions.ts` | `getRevisionPlan` | 🔴 HIGH | No |
| `src/app/(main)/mentor/actions.ts` | `getMotivationalAdvice` | 🔴 HIGH | No |
| `src/app/(main)/chat/actions.ts` | `audioConversation` | 🔴 HIGH | No |
| `src/app/(main)/chat/actions.ts` | `getTextToSpeech` | 🔴 HIGH | No |
| `src/app/(main)/chat/actions.ts` | `getExplanation` | 🔴 HIGH | No |


## Recommendations
1. **Add Authentication:** Ensure all High Risk actions implement `auth()` or similar checks at the beginning of the function.
2. **Validate Input:** Ensure all inputs are validated using Zod or similar libraries.
3. **CSRF Protection:** Next.js Server Actions have built-in CSRF protection, but ensure sensitive actions are not exposed via GET requests (which they shouldn't be by default).
