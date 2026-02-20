# Prompt: Teacher Permission Boundary Audit

## Objective
Audit the teacher route protection in SANKALP. Verify that all `/teacher/*` routes are protected by middleware and local authorization checks, and identify any unprotected pages that could allow unauthorized student access to teacher data.

## Actions to Execute

1. **Run** `scripts/audit-permissions.ts`
2. **Check** whether `src/middleware.ts` exists and protects `/teacher` routes
3. **Scan** every file in `src/app/(main)/teacher/` for authorization keywords (useAuth, getServerSession, adminAuth, redirect, teacher role check)
4. **List** all potentially unprotected teacher pages
5. **Verify** the teacher onboarding flow requires role verification
6. **Check** API routes under `src/app/api/teacher/` for auth token validation

## Expected Output
A permission boundary audit report listing every teacher route, its protection status, and remediation steps for unprotected routes.
