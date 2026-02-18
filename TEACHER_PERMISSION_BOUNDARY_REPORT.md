
# Teacher Permission Boundary Report

## Summary
The audit reveals critical Broken Object Level Authorization (BOLA) vulnerabilities in the Teacher API endpoints. The GET methods for fetching student lists and teacher profiles lack proper authorization checks, allowing any authenticated (or unauthenticated depending on middleware) user to access sensitive data by simply guessing or enumerating `teacherId`.

## Findings

### 1. Vulnerability: /api/teacher/students (GET)
- **Status**: **CRITICAL**
- **Description**: The endpoint accepts `teacherId` as a query parameter but does not verify that the requester *is* that teacher.
- **Exploit**: A student or malicious actor can call `/api/teacher/students?teacherId=TARGET_ID` to dump the entire class roster including grades and risk assessments for another teacher's class.
- **Risk**: Severe PII exposure (Student names, emails, grades, risk status).

### 2. Vulnerability: /api/teacher (GET)
- **Status**: **HIGH**
- **Description**: Similar to above, fetching teacher profile by ID is unrestricted.
- **Exploit**: Fetching `/api/teacher?teacherId=TARGET_ID` returns teacher details.
- **Risk**: Enumeration of teacher staff and their metadata.

### 3. Secure Endpoint: /api/teacher (PUT)
- **Status**: **SECURE**
- **Description**: The update method correctly verifies the token and ensures `teacherId === decodedToken.uid`. This proves the capability exists but was missed in GET routes.

## Recommendations
1.  **Enforce RBAC**: Use middleware to ensure only users with `role: 'teacher'` can access these routes.
2.  **Verify Ownership**: In all endpoints taking `teacherId`, verify:
    ```typescript
    const token = await verifyToken(req);
    if (token.uid !== teacherId) throw new ForbiddenError();
    ```
3.  **Use Context**: Instead of passing `teacherId` in query params, derive it from the authenticated session token directly.
    ```typescript
    const teacherId = session.user.id; // derived from secure cookie/token
    ```
