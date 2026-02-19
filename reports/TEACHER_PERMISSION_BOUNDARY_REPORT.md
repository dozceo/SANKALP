# Teacher Permission Boundary Report

## Overview
This report audits the API endpoints for teacher-specific features to ensure proper Role-Based Access Control (RBAC) is enforced.

## Methodology
- Static analysis of API route handlers.
- Searching for authentication (`auth()`, `currentUser()`) and authorization (`role === 'teacher'`) checks.
- Verification of IDOR (Insecure Direct Object Reference) vulnerabilities.

## Findings

### Analysis of `src/app/api/teacher/students/route.ts`

- ❌ **CRITICAL**: No authentication check detected. The endpoint appears to be public.
- ❌ **CRITICAL**: No role validation detected. Any authenticated user (including students) might access this.
- ❌ **HIGH RISK**: IDOR Vulnerability. The endpoint uses `teacherId` from query parameters without verifying if the current user *is* that teacher.

### Analysis of `src/app/api/teacher/graph/route.ts`

- ❌ **CRITICAL**: No authentication check detected. The endpoint appears to be public.
- ❌ **CRITICAL**: No role validation detected. Any authenticated user (including students) might access this.
- ❌ **HIGH RISK**: IDOR Vulnerability. The endpoint uses `teacherId` from query parameters without verifying if the current user *is* that teacher.

## Recommendations

1.  **Implement Auth Guard**:
    - Wrap all teacher routes with an authentication check.
    ```typescript
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
    ```

2.  **Enforce RBAC**:
    - Verify the user's role.
    ```typescript
    if (session.user.role !== 'teacher') return new NextResponse('Forbidden', { status: 403 });
    ```

3.  **Prevent IDOR**:
    - Do not trust `teacherId` from the client query params for authorization.
    - Instead, use `session.user.id` as the source of truth for fetching data.
    - Or, if `teacherId` is needed (e.g. admin viewing a teacher), verify that `session.user.id === teacherId` or `session.user.role === 'admin'`.
