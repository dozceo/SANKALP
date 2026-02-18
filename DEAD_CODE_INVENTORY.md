# Dead Code Inventory

Generated on: 2026-02-17T19:19:27.962Z

This report lists exported components and utilities from `src/components` and `src/lib` that do not appear to be used elsewhere in the `src` directory. **Note:** This is a heuristic analysis (string search). Manual verification is recommended before deletion.

## Potential Dead Code (49 items)

| Type | Name | File Path |
|---|---|---|
| component | `BadgeProps` | `src/components/ui/badge.tsx` |
| component | `ButtonProps` | `src/components/ui/button.tsx` |
| component | `CalendarProps` | `src/components/ui/calendar.tsx` |
| component | `ChartConfig` | `src/components/ui/chart.tsx` |
| lib | `signInWithEmail` | `src/lib/auth.ts` |
| lib | `signUpWithEmail` | `src/lib/auth.ts` |
| lib | `resetPassword` | `src/lib/auth.ts` |
| lib | `updateUserProfile` | `src/lib/auth.ts` |
| lib | `getCurrentUser` | `src/lib/auth.ts` |
| lib | `MENTOR_FALLBACKS` | `src/lib/chat-fallback.ts` |
| lib | `QuizResult` | `src/lib/db-helpers.ts` |
| lib | `MLPrediction` | `src/lib/db-helpers.ts` |
| lib | `TeacherIntervention` | `src/lib/db-helpers.ts` |
| lib | `ActivityLog` | `src/lib/db-helpers.ts` |
| lib | `ChatHistory` | `src/lib/db-helpers.ts` |
| lib | `DailySummary` | `src/lib/db-helpers.ts` |
| lib | `QuizGeneration` | `src/lib/db-helpers.ts` |
| lib | `ActionEvent` | `src/lib/eventTracker.ts` |
| lib | `useTrackedClick` | `src/lib/eventTracker.ts` |
| lib | `useTrackedSubmit` | `src/lib/eventTracker.ts` |
| lib | `useTimeTracking` | `src/lib/eventTracker.ts` |
| lib | `FirestoreDocument` | `src/lib/firestore.ts` |
| lib | `getDocument` | `src/lib/firestore.ts` |
| lib | `getDocuments` | `src/lib/firestore.ts` |
| lib | `createDocument` | `src/lib/firestore.ts` |
| lib | `setDocument` | `src/lib/firestore.ts` |
| lib | `updateDocument` | `src/lib/firestore.ts` |
| lib | `deleteDocument` | `src/lib/firestore.ts` |
| lib | `subscribeToDocument` | `src/lib/firestore.ts` |
| lib | `subscribeToCollection` | `src/lib/firestore.ts` |
| lib | `AuthenticatedRequest` | `src/lib/middleware/auth.ts` |
| lib | `withAuth` | `src/lib/middleware/auth.ts` |
| lib | `errorResponse` | `src/lib/middleware/auth.ts` |
| lib | `successResponse` | `src/lib/middleware/auth.ts` |
| lib | `SubjectProgress` | `src/lib/rewards/calculateRewards.ts` |
| lib | `ProjectionData` | `src/lib/rewards/calculateRewards.ts` |
| lib | `uploadFile` | `src/lib/storage.ts` |
| lib | `uploadFileWithProgress` | `src/lib/storage.ts` |
| lib | `deleteFile` | `src/lib/storage.ts` |
| lib | `getFileURL` | `src/lib/storage.ts` |
| lib | `listFiles` | `src/lib/storage.ts` |
| lib | `getUserUploadPath` | `src/lib/storage.ts` |
| lib | `uploadUserFile` | `src/lib/storage.ts` |
| lib | `createStorageRef` | `src/lib/storage.ts` |
| lib | `GRAPH_COLORS` | `src/lib/styles/graph-tokens.ts` |
| lib | `Trend` | `src/lib/trend-utils.ts` |
| lib | `emailSchema` | `src/lib/validations/auth.ts` |
| lib | `passwordSchema` | `src/lib/validations/auth.ts` |
| lib | `nameSchema` | `src/lib/validations/auth.ts` |
