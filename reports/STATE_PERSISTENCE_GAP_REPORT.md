# State Persistence Gap Report

This report identifies components with local state (`useState`) that may not be persisted to `localStorage` or `sessionStorage`, potentially leading to data loss on refresh.

## Summary
- Total Files Scanned: 19
- Files with Unpersisted State: 17
- Files with Persisted State: 2

## High Risk: Unpersisted State
The following files contain state but no detected client-side persistence mechanisms.

| Filepath | State Variables |
| :--- | :--- |
| `src/app/(auth)/join-class/page.tsx` | `loading` |
| `src/app/(auth)/login/page.tsx` | `showPassword, loading` |
| `src/app/(auth)/onboarding/page.tsx` | `step, loading` |
| `src/app/(auth)/sign-up/page.tsx` | `showPassword, loading` |
| `src/app/(auth)/teacher-onboarding/page.tsx` | `step, loading` |
| `src/app/(main)/brain-map/page.tsx` | `graphData, loading, selectedNodeId` |
| `src/app/(main)/classes/page.tsx` | `classCode, joining, leaving` |
| `src/app/(main)/home/page.tsx` | `intelligence, isLoading` |
| `src/app/(main)/mentor/page.tsx` | `messages, input, isLoading` |
| `src/app/(main)/quiz/page.tsx` | `quiz, isFallback, currentQuestionIndex, selectedAnswer, isAnswered, score, isLoading, isFinished, quizStartTime, quizTopic` |
| `src/app/(main)/teacher/classes/[classId]/page.tsx` | `classDetails, students, isLoading, copiedCode, searchQuery` |
| `src/app/(main)/teacher/classes/page.tsx` | `classes, isLoading, isCreating, dialogOpen, copiedCode, searchQuery, subjectFilter, gradeFilter, sortBy` |
| `src/app/(main)/teacher/page.tsx` | `students, graphData, loading` |
| `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx` | `chatbotPersonality, customInstructions, isSaving` |
| `src/app/(main)/teacher/students/[studentId]/page.tsx` | `student, performance, isLoading` |
| `src/app/(main)/teacher/students/page.tsx` | `students, classes, isLoading, searchQuery, classFilter, performanceFilter, activityFilter, sortBy` |
| `src/app/page.tsx` | `checking` |

## Low Risk: Persisted State (or Partial)
The following files contain state and use storage APIs.

| Filepath | Storage Type |
| :--- | :--- |
| `src/app/(main)/chat/page.tsx` | localStorage |
| `src/app/(main)/syllabus/page.tsx` | sessionStorage |

## Recommendations
1. **Review High Risk Files**: Check if the identified state variables (e.g., form data, progress) should persist across reloads.
2. **Implement Persistence**: Use a custom hook like `useLocalStorage` for critical state.
3. **Database Sync**: Ensure critical data is also synced to the backend via API calls (not covered in this client-side audit).
