# State Persistence Gap Report

This report identifies components using `useState` without apparent `localStorage` or `sessionStorage` backup.

## src/app/(auth)/join-class/page.tsx
- **Detected States**: loading
- **Persistence Check**: ❌ No explicit storage detected.
- **Risk**: High - Data loss on refresh.

## src/app/(auth)/login/page.tsx
- **Detected States**: showPassword, loading
- **Persistence Check**: ❌ No explicit storage detected.
- **Risk**: High - Data loss on refresh.

## src/app/(auth)/onboarding/page.tsx
- **Detected States**: step, loading
- **Persistence Check**: ❌ No explicit storage detected.
- **Risk**: High - Data loss on refresh.

## src/app/(auth)/sign-up/page.tsx
- **Detected States**: showPassword, loading
- **Persistence Check**: ❌ No explicit storage detected.
- **Risk**: High - Data loss on refresh.

## src/app/(auth)/teacher-onboarding/page.tsx
- **Detected States**: step, loading
- **Persistence Check**: ❌ No explicit storage detected.
- **Risk**: High - Data loss on refresh.

## src/app/(main)/brain-map/page.tsx
- **Detected States**: graphData, loading, selectedNodeId
- **Persistence Check**: ❌ No explicit storage detected.
- **Risk**: High - Data loss on refresh.

## src/app/(main)/classes/page.tsx
- **Detected States**: classCode, joining, leaving
- **Persistence Check**: ❌ No explicit storage detected.
- **Risk**: High - Data loss on refresh.

## src/app/(main)/home/page.tsx
- **Detected States**: intelligence, isLoading
- **Persistence Check**: ❌ No explicit storage detected.
- **Risk**: High - Data loss on refresh.

## src/app/(main)/mentor/page.tsx
- **Detected States**: messages, input, isLoading
- **Persistence Check**: ❌ No explicit storage detected.
- **Risk**: High - Data loss on refresh.

## src/app/(main)/quiz/page.tsx
- **Detected States**: quiz, isFallback, currentQuestionIndex, selectedAnswer, isAnswered, score, isLoading, isFinished, quizStartTime, quizTopic
- **Persistence Check**: ❌ No explicit storage detected.
- **Risk**: High - Data loss on refresh.

## src/app/(main)/teacher/classes/[classId]/page.tsx
- **Detected States**: classDetails, students, isLoading, copiedCode, searchQuery
- **Persistence Check**: ❌ No explicit storage detected.
- **Risk**: High - Data loss on refresh.

## src/app/(main)/teacher/classes/page.tsx
- **Detected States**: classes, isLoading, isCreating, dialogOpen, copiedCode, searchQuery, subjectFilter, gradeFilter, sortBy
- **Persistence Check**: ❌ No explicit storage detected.
- **Risk**: High - Data loss on refresh.

## src/app/(main)/teacher/page.tsx
- **Detected States**: students, graphData, loading
- **Persistence Check**: ❌ No explicit storage detected.
- **Risk**: High - Data loss on refresh.

## src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx
- **Detected States**: chatbotPersonality, customInstructions, isSaving
- **Persistence Check**: ❌ No explicit storage detected.
- **Risk**: High - Data loss on refresh.

## src/app/(main)/teacher/students/[studentId]/page.tsx
- **Detected States**: student, performance, isLoading
- **Persistence Check**: ❌ No explicit storage detected.
- **Risk**: High - Data loss on refresh.

## src/app/(main)/teacher/students/page.tsx
- **Detected States**: students, classes, isLoading, searchQuery, classFilter, performanceFilter, activityFilter, sortBy
- **Persistence Check**: ❌ No explicit storage detected.
- **Risk**: High - Data loss on refresh.

## src/app/page.tsx
- **Detected States**: checking
- **Persistence Check**: ❌ No explicit storage detected.
- **Risk**: High - Data loss on refresh.


**Total Components with Persistence Gaps:** 17

## Recommended Recovery Strategies
1.  **LocalStorage Sync**: For non-sensitive preferences (e.g., UI toggles), use a custom hook like `useLocalStorage`.
2.  **SessionStorage**: For form data that should persist during a session but clear on close.
3.  **URL Parameters**: For filter/sort state, lift state to the URL query parameters.
4.  **Server-Side State**: For critical data, ensure frequent auto-saving to the backend.
