
# Student Data Privacy Compliance Report

## Summary
The audit reveals significant compliance gaps regarding GDPR and COPPA. The most critical issue is the lack of a mechanism for users to delete their accounts and associated data (Right to Erasure). Additionally, PII is stored in plaintext within the database, and while Firestore provides encryption at rest, additional application-level safeguards for sensitive student data are recommended.

## Findings

### 1. Right to Erasure (GDPR Art. 17 / COPPA)
- **Status**: **NON-COMPLIANT**
- **Issue**: No `DELETE` endpoint exists in `/api/users` or `/api/students`.
- **Impact**: Users cannot exercise their right to be forgotten. This is a major regulatory risk.

### 2. Data Storage & Encryption
- **Status**: **PARTIALLY COMPLIANT**
- **Issue**: Student names and emails are stored as plaintext fields in Firestore.
- **Mitigation**: Firestore encrypts data at rest, but application-level encryption for PII is a best practice for "Defense in Depth", especially for minors' data.

### 3. Data Minimization
- **Status**: **COMPLIANT**
- **Observation**: The system appears to collect only necessary data (Name, Email, Grade, Performance). No extraneous sensitive data (e.g., biometric, location) was found in the schema.

### 4. Logging
- **Status**: **Needs Review**
- **Issue**: Static analysis flagged potential logging of student objects in API routes. Ensure production logs mask PII.

## Recommendations
1.  **Implement Account Deletion**: Create a `DELETE /api/users/[userId]` endpoint that recursively deletes:
    - User document
    - Student profile
    - Quiz results
    - Planner data
    - Brain map nodes
    - Chat history
2.  **Audit Logs**: Configure the logger to scrub emails and names from output.
3.  **Privacy Policy**: Ensure the frontend links to a privacy policy detailing data usage.
