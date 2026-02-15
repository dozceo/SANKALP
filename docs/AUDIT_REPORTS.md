# Audit Reports

This document contains audit findings and recommendations for Tasks 41, 42, 43, and 44.

## Task 41: Session Persistence & State Recovery Strategy (Domain: Engineering Core)

### 1. Scope and Objective
Audit client-side state management mechanisms to identify risks of data loss on page refresh, specifically targeting transient `useState` implementations in critical flows.

### 2. Audit Findings

#### A. Syllabus Generator (`src/app/(main)/syllabus/page.tsx`)
- **Current State:** The syllabus generation result (`syllabus` object) and the user query (`query`) are stored in local `useState`.
- **Risk:** High. If a user spends time generating a syllabus and then refreshes the page (e.g., due to network glitch or accidental refresh), the generated content is lost immediately. The "Save" feature exists but is manual and post-generation.
- **Impact:** Frustration and wasted API credits/time.

#### B. Cognitive Chatbot (`src/app/(main)/chat/page.tsx`)
- **Current State:** The chat history (`messages` array) is stored in local `useState`.
- **Risk:** High. Users lose the entire context of their conversation upon refresh.
- **Impact:** Loss of learning context and history.

#### C. Student Onboarding (`src/app/(auth)/onboarding/page.tsx`)
- **Current State:** The multi-step form data (`formData`) and current step (`step`) are stored in local `useState`.
- **Risk:** Medium. If a user refreshes during Step 3 (Goals) or Step 4, they are reset to Step 1 and lose all entered data.
- **Impact:** User drop-off during onboarding.

### 3. Recommendations

#### Short-term (Quick Wins)
1.  **Syllabus Page:** Implement `sessionStorage` to cache the last generated syllabus. On mount, check `sessionStorage` and restore if available.
    ```typescript
    // Example Strategy
    useEffect(() => {
      const cached = sessionStorage.getItem('lastSyllabus');
      if (cached) setSyllabus(JSON.parse(cached));
    }, []);
    useEffect(() => {
      if (syllabus) sessionStorage.setItem('lastSyllabus', JSON.stringify(syllabus));
    }, [syllabus]);
    ```
2.  **Chat Page:** Use `localStorage` to persist the last `N` messages of the conversation, or fetch chat history from the backend if available.
3.  **Onboarding:** Persist `step` and `formData` to `localStorage` so users can resume where they left off.

#### Long-term (Robust)
1.  **Backend Persistence:** Automatically save generated syllabi and chat history to Firestore as they are created, not just when the user clicks "Save".
2.  **URL State:** For search queries (like syllabus topic), sync the state to the URL (e.g., `?query=Calculus`) so the page can be bookmarked or refreshed without losing context.

---

## Task 42: Internationalization (i18n) Readiness Assessment (Domain: Engineering Core)

### 1. Scope and Objective
Assess the codebase for hardcoded user-facing strings and evaluate readiness for multi-language support.

### 2. Audit Findings

#### A. Hardcoded Strings
-   **Prevalence:** Extremely High. Almost 100% of user-facing text is hardcoded in JSX.
-   **Examples:**
    -   `SyllabusPage`: "Academic Syllabus", "Your AI-powered guide...", "Syllabus Finder".
    -   `TeacherPage`: "Teacher Risk Dashboard", "Class Overview", "Student Learning Network".
    -   `SignUpPage`: "Create an Account", "I am a", "Student", "Teacher".
    -   `OnboardingPage`: "Let's get started", "Tell us a bit about yourself", "What subjects are you studying?".
    -   `ChatPage`: "Multilingual Cognitive Chatbot", "Ask for an explanation...".

#### B. Infrastructure
-   **Current State:** No i18n library is installed or configured.
-   **Date/Number Formatting:** Dates are often formatted using `toLocaleDateString()` or raw strings, which is a good start but needs standardization.

### 3. Recommendations

1.  **Library Selection:** Adopt `next-intl` or `react-i18next`. `next-intl` is well-suited for Next.js App Router.
2.  **String Extraction:**
    -   Create a `locales/en.json` file.
    -   Systematically replace hardcoded strings with translation keys (e.g., `t('syllabus.title')`).
3.  **Component Refactoring:**
    -   Update components to accept `t` prop or use `useTranslations` hook.
    -   Ensure dynamic values (like "Step {step} of 4") use interpolation.

---

## Task 43: Cognitive Load Analysis of Teacher Dashboard (Domain: Design & UX)

### 1. Scope and Objective
Evaluate the "Teacher Risk Dashboard" (`src/app/(main)/teacher/page.tsx`) for information density and cognitive load.

### 2. Audit Findings

#### A. Information Density
-   **Overall:** Moderate to High (depending on class size).
-   **Key Elements:**
    1.  **Header:** Title + Export Button. (Low Load)
    2.  **Student Learning Network (Graph):**
        -   **Visuals:** Nodes (Students, Topics) + Links.
        -   **Complexity:** Can become a "hairball" with many students and topics.
        -   **Interactivity:** Click to view student. Good drill-down.
    3.  **Class Overview (Table):**
        -   **Columns:** Student, Syllabus Progress, Absentee Streak, Risk, Actions.
        -   **Badges:** "High/Medium/Low" risk badges are excellent for quick scanning.
        -   **Progress Bar:** Visual indicator of mastery is good.

#### B. Visual Hierarchy
-   The Graph takes prominent space but might offer less *immediate* actionable insight than the Table for at-risk intervention.
-   The "Risk" badges in the table are the most critical signal but are buried in the second card.

### 3. Recommendations

1.  **Prioritize Risk:** Move the "Class Overview" table *above* the Graph, or create a "High Risk Students" summary widget at the very top. Teachers need to know *who* needs help first.
2.  **Simplify Graph:**
    -   Group topics by "Subject" or "Chapter" to reduce node count.
    -   Add filters to the graph (e.g., "Show only High Risk Students").
3.  **Actionable Insights:**
    -   Change "Absentee Streak" from a generic "Low" badge to a specific number (e.g., "3 days").
    -   Add a bulk action (e.g., "Message all High Risk Students").

---

## Task 44: Student Onboarding Flow Friction Point Detection (Domain: Design & UX)

### 1. Scope and Objective
Identify friction points in the student onboarding flows (`src/app/(auth)/sign-up/page.tsx` and `src/app/(auth)/onboarding/page.tsx`).

### 2. Audit Findings

#### A. Friction Points
1.  **Open-Ended Goals (Step 3):** The "Your Learning Goals" field is a large `Textarea`.
    -   **Issue:** Cognitive effort is high. Students might stare at the blank box.
    -   **Risk:** Drop-off or low-quality input.
2.  **Optional Class Code (Step 4):**
    -   **Issue:** It's a dedicated step. Users without a code might feel they are missing something or in the wrong place. The "skip" option is present but secondary.
    -   **Risk:** Confusion / Pause.
3.  **No "Save & Exit":**
    -   **Issue:** If a user needs to leave, there is no clear way to save progress (related to Task 41).

#### B. Strengths
-   **Grade/Subject Selection:** Uses clickable buttons/chips, which is low friction.
-   **Progress Bar:** Clearly shows steps.

### 3. Recommendations

1.  **Standardize Goals:** Replace the `Textarea` with a multi-select chip group for common goals (e.g., "Improve Grades", "Prepare for Exam", "Learn a New Skill") + an "Other" option. This reduces cognitive load significantly.
2.  **Streamline Class Code:**
    -   Move "Join Class" to a post-onboarding "Home" action or the "Settings" page.
    -   Or, make it a small link "Have a class code?" on the final success screen instead of a full step.
3.  **Validation Feedback:** Ensure users know *why* the "Next" button is disabled (currently it just stays disabled until valid). Add tooltips or help text.
