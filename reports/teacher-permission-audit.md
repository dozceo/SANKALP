# Teacher Dashboard Permission Boundary Validation

## Executive Summary
A critical security audit of the Teacher Analytics routes (`src/app/(main)/teacher/` and `src/app/api/teacher/`) reveals **severe vulnerabilities** allowing unauthorized access to sensitive student data. The application lacks a global middleware for route protection, and the API endpoints suffer from Insecure Direct Object Reference (IDOR), allowing any user (or unauthenticated attacker) to retrieve class lists and student risk profiles by simply providing a teacher ID.

## Methodology
1.  **Static Analysis:** Used `scripts/audit-permissions.ts` to scan for authorization checks (`getServerSession`, `auth()`, `middleware.ts`).
2.  **Code Review:** Manually inspected `src/app/(main)/teacher/page.tsx` and `src/app/api/teacher/students/route.ts`.

## Critical Findings

### 1. Missing Global Protection (Middleware)
*   **Status:** **CRITICAL**
*   **Observation:** The file `src/middleware.ts` is missing.
*   **Impact:** There is no centralized mechanism to enforce authentication or role-based access control (RBAC) on `/teacher` routes.

### 2. Insecure Direct Object Reference (IDOR) in API
*   **Status:** **CRITICAL**
*   **Location:** `src/app/api/teacher/students/route.ts`
*   **Vulnerability:** The API endpoint accepts `teacherId` via query parameter:
    ```typescript
    const teacherId = searchParams.get('teacherId');
    // ... fetches data immediately without auth check
    ```
*   **Exploit:** An attacker can request `/api/teacher/students?teacherId=123` and receive full student rosters, grades, and "Dropout Risk" labels without being logged in or being that teacher.

### 3. Unprotected UI Routes
*   **Status:** **HIGH**
*   **Location:** `src/app/(main)/teacher/page.tsx`
*   **Observation:** The component checks if `user` exists in the client-side `useEffect`, but does not validate if the user has the `TEACHER` role.
    ```typescript
    if (!user?.uid) return; // Only checks existence, not role
    ```
*   **Impact:** A student account could potentially load the teacher dashboard (if they guess the URL), and if they modify the API call (or if the API logic is flawed to allow any auth user), they could see data.

## Recommendations

### Immediate Actions
1.  **Implement Middleware:** Create `src/middleware.ts` to protect `/teacher/**` routes, ensuring only users with `role: 'teacher'` can access them.
2.  **Secure API:** In `src/app/api/teacher/students/route.ts`, remove the `teacherId` query parameter reliance. Instead:
    *   Get the authenticated user from the session (e.g., `getServerSession` or `auth()`).
    *   Verify the user is a teacher.
    *   Use the session's user ID as the `teacherId`.
    *   Reject requests from non-teachers.
3.  **Role Check in UI:** Add a server-side or client-side redirect in `TeacherPage` if `user.role !== 'teacher'`.
