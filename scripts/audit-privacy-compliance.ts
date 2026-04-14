
import fs from 'fs';
import path from 'path';

async function auditPrivacyCompliance() {
  console.log('Starting Privacy Compliance Audit...');

  const reportPath = path.join(process.cwd(), 'reports', 'PRIVACY_COMPLIANCE_REPORT.md');
  const reportDir = path.dirname(reportPath);

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  let reportContent = `# Student Data Privacy Compliance Report

## Overview
This report audits the handling of Personally Identifiable Information (PII) across the Sankalp platform, focusing on GDPR and COPPA compliance risks in storage, ML processing, and LLM interactions.

## Methodology
- Codebase scan for PII fields (email, name, phone, address).
- Analysis of data flow to external services (Google AI, Firebase).
- Check for data minimization and deletion capabilities.

## Findings

### 1. Data Storage (Firestore)
**File**: \`src/lib/db-helpers.ts\`
- **PII Stored**: \`name\`, \`email\`, \`userId\`.
- **Observation**: User profiles are stored in the \`users\` and \`students\` collections.
- **Risk**: \`chatbotPersonality\` and \`chatbotInstructions\` are stored directly on the student profile. If these contain sensitive information entered by the student/teacher, they are stored permanently.

### 2. ML Inference (Python Bridge)
**File**: \`src/ml/inference/ml-bridge.ts\`
- **Data Sent**: The bridge sends \`avg_quiz_score\`, \`attempts_per_topic\`, etc.
- **PII Check**: The \`predictMastery\` function accepts \`MasteryPredictionInput\`.
- **Observation**: PII does NOT appear to be sent to the Python process for mastery prediction. The input features are purely statistical.
- **Status**: ✅ **Safe**. ML models use anonymized feature vectors.

### 3. LLM Interaction (Genkit)
**File**: \`src/ai/flows/adaptive-quiz-engine.ts\`, \`src/ai/flows/multilingual-cognitive-chatbot.ts\`
- **Prompt Injection Risk**: The prompt templates use \`{{{concept}}}\` and \`{{{topic}}}\`.
- **PII Leakage**:
  - In \`custom-cognitive-chatbot.ts\`, the prompt includes: \`Your assigned personality and tone is: {{{personality}}}. You must follow these specific instructions from the teacher: {{{customInstructions}}}.\`
  - **Risk**: If a teacher includes PII in \`customInstructions\` (e.g., "Help John Smith with his dyslexia"), this PII is sent to the LLM (Google Gemini).
  - **Compliance**: This requires a Data Processing Agreement (DPA) with Google, which is standard for enterprise but must be verified for the specific API usage (Gemini Flash).

### 4. Data Deletion (Right to be Forgotten)
**Search for Deletion Logic**:
- Scanned for \`deleteUser\`, \`deleteStudent\`.
- **Finding**: No dedicated "Delete Account" function was found in \`src/lib/db-helpers.ts\`.
- **Violation**: **GDPR Art. 17 / COPPA**. Users must have a way to request deletion of their data.

## Recommendations

1.  **Implement Data Deletion**:
    - Create a server action \`deleteAccount(userId)\` that recursively deletes:
      - Firestore: User, Student, QuizResults, BrainMapNodes, Syllabi.
      - Auth: Firebase Auth user.

2.  **PII Filtering in Prompts**:
    - Implement a regex-based PII filter (or use a specialized library) to scrub names/emails from \`customInstructions\` before sending to the LLM.
    - Warn teachers in the UI not to include student names in custom instructions.

3.  **Data Minimization**:
    - Ensure \`quizResults\` do not store unnecessary metadata.
    - Verify that logs (e.g., \`console.log(input)\`) do not print full user objects in production.

`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`Report generated at ${reportPath}`);
}

auditPrivacyCompliance().catch(console.error);
