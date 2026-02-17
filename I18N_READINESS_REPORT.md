# Internationalization (i18n) Readiness Report

## Readiness Assessment
This report outlines the current state of internationalization (i18n) within the application and identifies key areas requiring remediation.

### Current Status
- **Framework**: `next-intl` is installed and partially used.
- **Coverage**: **Low (<20%)**.
  - `src/app/(auth)/onboarding/page.tsx`: Uses `t('Onboarding')` and `t('Common')`.
  - `src/app/(main)/syllabus/page.tsx`: Uses `t('Syllabus')`.
- **Gaps**: Significant portions of the application rely on hardcoded English strings.

### Findings

#### 1. Hardcoded Strings
**Severity: High**
- `src/app/(main)/quiz/page.tsx`:
  - UI Text: "Quiz Complete!", "Create a Quiz", "Topic", "Educational Level", "Difficulty".
  - Zod Schema Messages: "Topic must be at least 2 characters.", "Please enter at least 1 question."
  - Action Feedback: "Quiz results saved!", "Error creating quiz".
- `src/app/(main)/teacher/page.tsx`:
  - Headers: "Dashboard", "Class Overview", "Student Learning Network".
  - Labels: "Syllabus Progress", "Absentee Streak", "Predicted Dropout Risk".
  - Risk Badges: "High", "Medium", "Low".
- `src/app/(main)/teacher/classes/page.tsx`:
  - Headers: "My Classes", "Create New Class".
  - Labels: "Class Name", "Subject", "Grade/Level".
- `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx`:
  - Section Headers: "Student Analytics", "Subject Performance", "Chatbot Customization".
  - Chart Labels: "Progress".
  - Lists: "Strengths", "Weaknesses".

#### 2. Dynamic Content Issues
**Severity: Medium**
- **Date Formatting**: `new Date().toLocaleDateString()` is used without locale context.
- **Number Formatting**: Percentages and large numbers are formatted manually or implicitly.

### Recommendations

#### Immediate Actions
1. **Extract Strings**: Move all hardcoded strings into `messages/en.json` (or equivalent structure).
2. **Standardize Keys**: Adopt a namespace convention (e.g., `Quiz.title`, `Teacher.Dashboard.title`).
3. **Zod Integration**: Implement `zod-i18n-map` to localize validation error messages.

#### Long-Term Strategy
- **Translation Workflow**: Set up a process for managing translation files (e.g., Crowdin integration).
- **Date/Number Formatting**: Use `next-intl`'s `useFormatter` hook for consistent locale-aware formatting.
- **RTL Support**: Evaluate layout components for Right-to-Left language compatibility.

### Estimated Effort
- **String Extraction**: ~500+ unique strings across ~20 components.
- **Estimated Time**: 2-3 developer days for full extraction and replacement.
