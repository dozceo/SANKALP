# Teacher Dashboard Permission Boundary Audit Report

## Executive Summary
The teacher dashboard API routes were audited for Role-Based Access Control (RBAC) enforcement.
**Finding:** Critical permissions gap identified. Teacher-only data endpoints are accessible without authentication.

## Vulnerability Details
### Endpoint: `GET /api/teacher/students`
- **Location:** `src/app/api/teacher/students/route.ts`
- **Issue:** The handler retrieves the `teacherId` from query parameters and immediately fetches sensitive student data (PII, grades, risk assessments) using `getTeacherStudents`.
- **Missing Check:** There is no validation of the `Authorization` header, nor any verification that the requester owns the `teacherId`.
- **Impact:** An attacker can enumerate `teacherId`s (or guess them) and dump the entire student roster, including grades and dropout risk scores, for any class.

### Code Snippet (Vulnerable)
```typescript
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get('teacherId'); // <--- User input

        if (!teacherId) { ... }

        // <--- MISSING AUTHENTICATION CHECK HERE

        // Database call executes immediately
        const students = await getTeacherStudents(teacherId, { ... });
```

### Endpoint: `GET /api/teacher`
- **Location:** `src/app/api/teacher/route.ts`
- **Issue:** Similar to the students endpoint, this route returns teacher profile information based solely on the `teacherId` query parameter without auth checks.
- **Note:** The `PUT` method in the same file *does* implement proper token verification (`auth.verifyIdToken`) and ownership checks.

## Recommendations
1.  **Implement Middleware:** Apply a global middleware or per-route check to verify the `Authorization: Bearer <token>` header.
2.  **Verify Ownership:** Ensure that the `uid` in the verified token matches the `teacherId` requested.
    ```typescript
    const authHeader = req.headers.get('Authorization');
    // ... verify token ...
    if (decodedToken.uid !== teacherId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    ```
3.  **Audit All Teacher Routes:** Review all files in `src/app/api/teacher/` for similar patterns.

## Simulation Status
Static analysis was performed to verify the vulnerability. A simulation script was attempted but faced environment configuration issues; however, the code structure definitively proves the absence of security controls.
