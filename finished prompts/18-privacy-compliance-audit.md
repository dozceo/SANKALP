# Prompt: Privacy Compliance Audit

## Objective
Audit SANKALP's handling of Personally Identifiable Information (PII) — names, emails, UIDs — across the API layer, persistence layer, and ML layer to assess GDPR/COPPA compliance posture.

## Actions to Execute

1. **Run** `scripts/audit-privacy.ts` against `src/lib`, `src/app/api`, and `src/ml`
2. **List** every file and line where PII keywords are found (name, email, uid, phone, dob, etc.)
3. **Categorize** each finding as: Data Collection (API), Data Storage (persistence), or Data Processing (ML)
4. **Check** for data minimization: are only required fields collected and stored?
5. **Check** for encryption at rest: is PII stored with encryption in Firestore?
6. **Check** for data deletion: is there a user data deletion endpoint?

## Expected Output
A privacy compliance audit report organized by data category, with GDPR/COPPA gap assessment and recommendations.
