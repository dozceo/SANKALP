# Student Data Privacy Compliance Audit

## Executive Summary
An audit of data handling practices across the application (`src/app/api/`, `src/lib/db-helpers.ts`, `src/ml/`) reveals significant privacy compliance gaps, particularly regarding GDPR (Right to Erasure) and COPPA (Age Gating). While the Machine Learning inference pipeline effectively anonymizes data, the core database interactions and API endpoints expose Personally Identifiable Information (PII) through insecure mechanisms (IDOR) and lack essential data lifecycle management features.

## Data Flow Map

1.  **Collection:**
    *   **Auth:** `src/app/(auth)/` collects Name, Email, Password.
    *   **Onboarding:** Collects Grade, School, Subjects.
    *   **Activity:** Collects Quiz Scores, Chat Logs, Behavioral Metrics (Time spent, clicks).

2.  **Storage (Firestore):**
    *   `users` / `students`: **PII** (Name, Email, School, Grade).
    *   `teacherInterventions`: **Sensitive PII** (Behavioral notes, "Dropout Risk").
    *   `chatHistory` / `activityLogs`: **Potential PII** (User-generated content).

3.  **Processing (ML/AI):**
    *   **Mastery ML (`src/ml/inference/`):** **SAFE**. Only aggregate statistics (scores, time, variance) are sent to the Python subprocess. No PII is transmitted.
    *   **GenAI (Gemini via Genkit):** **RISK**. User queries (`explainConcept`) are sent to Google. If a student types PII into the chat, it is transmitted to a third-party processor without explicit scrubbing.

## Compliance Gaps

### 1. GDPR: Right to Erasure (Article 17)
*   **Finding:** There is **no mechanism** to delete a student account.
*   **Evidence:** `src/lib/db-helpers.ts` contains `removeStudentFromClass` but no `deleteStudent` or `deleteUser` function that cascades to remove `quizResults`, `chatHistory`, etc.
*   **Risk:** Critical non-compliance.

### 2. GDPR: Data Portability (Article 20)
*   **Finding:** Students cannot download their data.
*   **Evidence:** Teachers have an export button (UI only, likely CSV), but students do not have a "Download My Data" feature.
*   **Risk:** Moderate non-compliance.

### 3. COPPA: Age Verification & Parental Consent
*   **Finding:** No age gating or parental consent flow found in `src/app/(auth)/`.
*   **Evidence:** Onboarding allows any user to sign up.
*   **Risk:** Critical for an EdTech platform likely to be used by under-13s in the US.

### 4. Security of Processing (GDPR Art. 32)
*   **Finding:** Insecure APIs (IDOR).
*   **Evidence:** As identified in the Permission Audit, `/api/teacher/students` allows unauthorized access to student PII.
*   **Risk:** High. Data breach risk.

## Recommendations

### Immediate (Security & Critical Compliance)
1.  **Fix IDOR:** Secure all API endpoints (see Permission Audit).
2.  **Implement Deletion:** Create a `deleteUser(userId)` cloud function or API endpoint that recursively deletes all Firestore documents linked to that `userId`.

### Short Term (Features)
1.  **Data Export:** Implement a "Download My Data" feature for students (JSON/ZIP of their history).
2.  **PII Scrubbing:** Implement a PII regex filter (for names, emails, phone numbers) before sending text to the GenAI model.

### Long Term (Policy)
1.  **Age Gate:** Add a date-of-birth field to sign-up. If <13, require a parent's email for verification/consent.
2.  **Privacy Policy:** Ensure the policy explicitly mentions Google (GenAI) as a sub-processor.
