# Result: Privacy Compliance Audit

**Prompt executed:** `prompts/18-privacy-compliance-audit.md`  
**Date:** 2026-02-20  
**Script run:** `scripts/audit-privacy.ts`  
**Report generated:** `PRIVACY_COMPLIANCE_REPORT.md`

---

## Action 1 + 2: Script executed — findings by category

### Data Collection (API Layer — `src/app/api`)

| File | Line | Keyword | Context |
|------|------|---------|---------|
| `api/chaos/route.ts` | 47–48 | name, email | Hardcoded mock data: `'Chaos Student'`, `'chaos@example.com'` (test only) |
| `api/classes/create/route.ts` | 29 | name | `teacherName: teacher.name` |
| `api/student/onboard/route.ts` | 7 | name | Onboarding collects: userId, name, grade, subjects, goals, dailyStudyTime |
| `api/students/create/route.ts` | 7 | email, name | Teacher creates student with: id, name, email, grade, userId |
| `api/teacher/students/route.ts` | 19 | email, name | Selects: userId, name, email, className, grade, lastLoginDate |

### Data Storage (Persistence Layer — `src/lib`)

| File | Keyword | Context |
|------|---------|---------|
| `src/lib/db-helpers-user.ts` | name, email | Student and Teacher profile types store name + email |
| `src/lib/db-helpers.ts` | uid, email, name | Core data models include PII fields |

### Data Processing (ML Layer — `src/ml`)

No PII keywords found in ML feature extraction files — ML models operate on anonymized performance metrics (quiz scores, timestamps) not on names/emails.

---

## Action 4: Data minimization assessment

PII collected per user type:

| User type | Fields collected | Assessment |
|-----------|----------------|-----------|
| Student | name, email, grade, subjects, goals, dailyStudyTime | **Reasonable** — goals and dailyStudyTime could be optional |
| Teacher | name, email, subjects, gradeLevels, schoolName | **Reasonable** — schoolName may be unnecessary for core functionality |

---

## Action 5: Encryption at rest

Firestore security rules are in `firestore.rules` (not `src/`). No encryption-at-rest configuration found in source. Firestore provides encryption at rest by default at the Google Cloud infrastructure level.

---

## Action 6: Data deletion endpoint

Search result: No `/api/user/delete` or similar endpoint found in `src/app/api/`. 

**GDPR gap:** GDPR Article 17 ("right to erasure") requires a data deletion mechanism. No such endpoint exists in the current codebase.

---

## Summary

| GDPR/COPPA requirement | Status |
|------------------------|--------|
| Data minimization | PARTIAL — some optional fields collected |
| Encryption at rest | COMPLIANT (Firestore default encryption) |
| Right to erasure (data deletion) | MISSING — no deletion endpoint |
| Purpose limitation | COMPLIANT — PII used only for educational features |
| Parental consent (COPPA, for users <13) | NOT ASSESSED — no age verification found |

**Critical gap:** Add a `DELETE /api/user/[userId]` endpoint that removes all student data from Firestore to satisfy GDPR Article 17.
