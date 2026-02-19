# Server Action Security Matrix

**Date:** 2024-05-23
**Domain:** Security
**Scope:** `src/app/`, `src/ai/flows/` Server Actions

## Executive Summary
A static analysis of Server Actions revealed critical authentication and authorization gaps. Several actions that trigger costly AI operations or modify student data lack any session validation or role-based access control (RBAC).

## Security Matrix

| File Path | Function Name | Auth Check? | Role Check? | Risk Level | Description |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `src/ai/flows/adaptive-quiz-engine.ts` | `generateQuiz` | ❌ No | ❌ No | **High** | Directly calls `ai.generate`. Unauthenticated users can trigger LLM usage (DoS/Cost Attack). |
| `src/app/(main)/planner/actions.ts` | `getRevisionPlan` | ❌ No | ❌ No | **High** | Hardcoded `studentId: "user-123"`. Exposure of specific user's revision data. No session context used. |
| `src/app/actions/student-configuration.ts` | `saveChatbotConfiguration` | ❌ No | ❌ No | **Critical** | IDOR Vulnerability. Accepts `studentId` as argument without verifying it matches the authenticated user. Allows unauthorized modification of student profiles. |

## Detailed Analysis

### 1. `src/ai/flows/adaptive-quiz-engine.ts`
*   **Issue:** The `generateQuiz` function is a Server Action that invokes the Genkit AI flow. It does not import or use any authentication helpers (e.g., `getAuth`, `currentUser`).
*   **Impact:** An attacker could script calls to this endpoint to exhaust the project's AI quota or inflate costs.
*   **Remediation:**
    ```typescript
    import { getAuth } from "firebase-admin/auth";
    // ...
    const session = await getAuth().verifyIdToken(token);
    if (!session) throw new Error("Unauthorized");
    ```

### 2. `src/app/(main)/planner/actions.ts`
*   **Issue:** The `getRevisionPlan` function hardcodes `studentId` to `"user-123"`.
*   **Impact:** This exposes the learning data of "user-123" to anyone who calls the action. It also prevents the feature from working for real users.
*   **Remediation:** Remove the hardcoded ID. Retrieve the `uid` from the authenticated session context.

### 3. `src/app/actions/student-configuration.ts`
*   **Issue:** The `saveChatbotConfiguration` function accepts `studentId` as a parameter and updates the database.
*   **Impact:** Insecure Direct Object Reference (IDOR). A malicious actor can modify the chatbot personality for *any* student by guessing their ID.
*   **Remediation:** Ignore the `studentId` parameter (or validate it). Use the `uid` from the verified session token to identify the document to update.

## General Recommendations
1.  **Middleware:** Implement a higher-order function or middleware for Server Actions to enforce authentication globally.
2.  **Context:** Always derive `studentId` from the authenticated session, never trust client-provided IDs for self-modification actions.
