# Server Action Security Matrix

## Executive Summary
A security audit of 7 Server Action files was conducted. **100% of the audited actions lack authentication and authorization checks.** This means any user (authenticated or anonymous) can invoke these functions, leading to:
1.  **Unauthorized AI Resource Consumption:** Attackers can drain the API quota (Gemini, TTS, STT).
2.  **Data Integrity Risks:** One action (`saveChatbotConfiguration`) allows modifying student data without ownership verification (IDOR).
3.  **Financial Exposure:** High-cost operations (Audio generation, Image analysis) are exposed publicly.

## Security Matrix

| File Path | Action Name | Auth Status | Risk Level | Threat Vector |
| :--- | :--- | :--- | :--- | :--- |
| `src/app/actions/ai-error.ts` | `generateFriendlyErrorMessage` | ❌ Unprotected | High | **Resource Exhaustion**. Publicly accessible LLM endpoint. |
| `src/app/actions/student-configuration.ts` | `saveChatbotConfiguration` | ❌ Unprotected | **Critical** | **IDOR / Data Tampering**. Arbitrary modification of any student's config. |
| `src/app/(main)/planner/actions.ts` | `getRevisionPlan` | ❌ Unprotected | Medium | **Resource Exhaustion**. Calls `smartRevisionPlanner`. |
| `src/app/(main)/mentor/actions.ts` | `getMotivationalAdvice` | ❌ Unprotected | High | **Resource Exhaustion**. Calls `getMotivationalCounseling`. |
| `src/app/(main)/chat/actions.ts` | `getExplanation` | ❌ Unprotected | High | **Resource Exhaustion**. Calls `explainConcept`. |
| `src/app/(main)/chat/actions.ts` | `getTextToSpeech` | ❌ Unprotected | **Critical** | **Cost / Resource**. TTS is expensive and easily abuseable. |
| `src/app/(main)/chat/actions.ts` | `audioConversation` | ❌ Unprotected | **Critical** | **Cost / Resource**. Speech-to-Speech is very expensive. |
| `src/app/(main)/quiz/actions.ts` | `createQuiz` | ❌ Unprotected | Medium | **Resource Exhaustion**. Caching exists but unique inputs bypass it. |
| `src/app/(main)/syllabus/actions.ts` | `getSyllabus` | ❌ Unprotected | Medium | **Resource Exhaustion**. Caching exists but unique inputs bypass it. |

## Remediation Plan

1.  **Implement Authentication Middleware:**
    All Server Actions must verify the user's session at the start of the function.
    ```typescript
    import { auth } from '@/auth'; // or your auth provider
    // ...
    const session = await auth();
    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }
    ```

2.  **Implement Authorization (RBAC):**
    For `saveChatbotConfiguration`, ensure the `studentId` matches the authenticated user's ID or that the user is a Teacher/Admin.
    ```typescript
    if (session.user.id !== studentId && session.user.role !== 'teacher') {
      throw new Error("Forbidden");
    }
    ```

3.  **Rate Limiting:**
    Implement per-user rate limiting (e.g., using Upstash Redis or a simple database counter) for AI-heavy actions like `audioConversation` and `createQuiz`.

4.  **CSRF Protection:**
    Next.js Server Actions have built-in CSRF protection for form submissions, but when called via client-side JavaScript (e.g., `onClick`), ensure headers are respected. Authentication is the primary defense here.
