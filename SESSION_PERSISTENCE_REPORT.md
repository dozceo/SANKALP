# Session Persistence & State Recovery Report

## Audit Summary
This report documents the client-side state management audit, focusing on potential data loss scenarios during page refreshes.

### Findings

#### 1. Quiz Page (`src/app/(main)/quiz/page.tsx`)
**Status: Critical Gap Identified**
- **State Management**: Uses `useState` for `quiz` (array), `score`, `currentQuestionIndex`, `selectedAnswer`, and `isAnswered`.
- **Persistence Mechanism**: **None**.
- **Risk**: If a user accidentally refreshes the page or navigates away during a quiz, all progress is lost. The quiz resets to the start screen.
- **Impact**: High user frustration, especially for longer quizzes.

#### 2. Syllabus Page (`src/app/(main)/syllabus/page.tsx`)
**Status: Secured**
- **State Management**: `useState` for `syllabus` object.
- **Persistence Mechanism**: Uses `sessionStorage` via `useEffect`.
  - loads: `sessionStorage.getItem('lastSyllabus')` on mount.
  - saves: `sessionStorage.setItem('lastSyllabus', ...)` on update.
- **Verdict**: Adequate for session-based persistence.

#### 3. Onboarding Page (`src/app/(auth)/onboarding/page.tsx`)
**Status: Secured**
- **State Management**: `useState` for `formData` and `step`.
- **Persistence Mechanism**: Uses `localStorage`.
  - loads: `localStorage.getItem('onboarding_data')` and `'onboarding_step'`.
  - saves: Updates `localStorage` on change.
  - cleans: `localStorage.removeItem` on successful submission.
- **Verdict**: Excellent implementation. Prevents drop-off if the user leaves and returns.

## Recommendations

### Immediate Actions
1. **Implement `useLocalStorage` Hook for Quiz**:
   - Create a custom hook `useLocalStorage<T>(key: string, initialValue: T)` in `src/hooks/use-local-storage.ts`.
   - Apply this hook to the critical state variables in `QuizPage`:
     - `quiz`
     - `currentQuestionIndex`
     - `score`
     - `answers` (if tracking per question)
2. **Clear Storage Strategy**:
   - Ensure storage is cleared when the quiz is completed or explicitly reset by the user.

### Long-Term Strategy
- Consider using a global state management library (like Zustand or Redux) with persistence middleware for more complex flows.
- For high-stakes assessments, consider saving progress to the server (Firestore) after every question answer to prevent data loss even across devices.
