# Notification & Alert Copy Effectiveness Audit

**Date:** 2026-02-18T19:35:07.941Z
**Scope:** /app/src

## 1. Notification Inventory
Found 62 toast notification calls.

| File | Variant | Title | Description | Tone Analysis |
|------|---------|-------|-------------|---------------|
| `src/app/(auth)/join-class/page.tsx` | `destructive` | Authentication Required | Please sign in first to join a class. | Neutral/Info |
| `src/app/(auth)/join-class/page.tsx` | `default` | Class Joined! | Successfully joined ${result.className} | Positive/Success |
| `src/app/(auth)/join-class/page.tsx` | `destructive` | Failed to join | (Dynamic/No Description) | Negative/Error |
| `src/app/(auth)/join-class/page.tsx` | `destructive` | Error | An unexpected error occurred. Please try again. | Negative/Error |
| `src/app/(auth)/login/page.tsx` | `default` | Welcome back! | You have successfully signed in. | Positive/Success |
| `src/app/(auth)/login/page.tsx` | `destructive` | Sign in failed | (Dynamic/No Description) | Negative/Error |
| `src/app/(auth)/login/page.tsx` | `destructive` | Google Sign In Failed | (Dynamic/No Description) | Negative/Error |
| `src/app/(auth)/onboarding/page.tsx` | `default` | Onboarding complete! | Your profile has been set up successfully. | Positive/Success |
| `src/app/(auth)/onboarding/page.tsx` | `destructive` | Onboarding failed | Failed to complete onboarding. Please try again. | Negative/Error |
| `src/app/(auth)/onboarding/page.tsx` | `destructive` | Onboarding Issue | (Dynamic/No Description) | Neutral/Info |
| `src/app/(auth)/sign-up/page.tsx` | `default` | Account created! | Welcome to SANKALP. | Neutral/Info |
| `src/app/(auth)/sign-up/page.tsx` | `destructive` | Sign up failed | (Dynamic/No Description) | Negative/Error |
| `src/app/(auth)/teacher-onboarding/page.tsx` | `default` | Onboarding complete! | Your teacher profile has been set up successfully. | Positive/Success |
| `src/app/(auth)/teacher-onboarding/page.tsx` | `destructive` | Onboarding failed | Failed to complete onboarding. Please try again. | Negative/Error |
| `src/app/(auth)/teacher-onboarding/page.tsx` | `destructive` | Onboarding Issue | (Dynamic/No Description) | Neutral/Info |
| `src/app/(main)/classes/page.tsx` | `default` | Success! | You have successfully joined the class. | Positive/Success |
| `src/app/(main)/classes/page.tsx` | `destructive` | Error | (Dynamic/No Description) | Negative/Error |
| `src/app/(main)/classes/page.tsx` | `default` | Left Class | You have successfully left the classroom. | Positive/Success |
| `src/app/(main)/classes/page.tsx` | `destructive` | Error | (Dynamic/No Description) | Negative/Error |
| `src/app/(main)/quiz/page.tsx` | `destructive` | Error creating quiz | There was a problem generating your quiz. Please try again. | Negative/Error |
| `src/app/(main)/quiz/page.tsx` | `default` | Quiz results saved! | Your progress has been recorded. | Positive/Success |
| `src/app/(main)/syllabus/page.tsx` | `default` | Syllabus Saved! | Your syllabus has been added to your planner. | Positive/Success |
| `src/app/(main)/syllabus/page.tsx` | `destructive` | Error | Failed to save the syllabus. Please try again. | Negative/Error |
| `src/app/(main)/teacher/classes/[classId]/page.tsx` | `destructive` | Error | Failed to load class details | Negative/Error |
| `src/app/(main)/teacher/classes/[classId]/page.tsx` | `default` | Copied! | Class code copied to clipboard | Neutral/Info |
| `src/app/(main)/teacher/classes/[classId]/page.tsx` | `destructive` | Error | Failed to copy class code | Negative/Error |
| `src/app/(main)/teacher/classes/page.tsx` | `destructive` | Error | Failed to load classes | Negative/Error |
| `src/app/(main)/teacher/classes/page.tsx` | `default` | Success! | Class "${values.className}" created with code: ${data.class.classCode} | Positive/Success |
| `src/app/(main)/teacher/classes/page.tsx` | `destructive` | Error | (Dynamic/No Description) | Negative/Error |
| `src/app/(main)/teacher/classes/page.tsx` | `destructive` | Error | An unexpected error occurred | Negative/Error |
| `src/app/(main)/teacher/classes/page.tsx` | `default` | Copied! | Class code copied to clipboard | Neutral/Info |
| `src/app/(main)/teacher/classes/page.tsx` | `destructive` | Error | Failed to copy class code | Negative/Error |
| `src/app/(main)/teacher/page.tsx` | `destructive` | Failed to load dashboard | Could not fetch data | Negative/Error |
| `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx` | `default` | Configuration saved | The chatbot configuration has been successfully updated. | Positive/Success |
| `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx` | `destructive` | Error | Failed to save configuration. Please try again. | Negative/Error |
| `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx` | `destructive` | Error | An unexpected error occurred. | Negative/Error |
| `src/app/(main)/teacher/students/[studentId]/page.tsx` | `destructive` | Error | Student not found | Negative/Error |
| `src/app/(main)/teacher/students/[studentId]/page.tsx` | `destructive` | Error | Failed to load student details | Negative/Error |
| `src/app/(main)/teacher/students/page.tsx` | `destructive` | Error | Failed to load students | Negative/Error |
| `src/components/LogoutButton.tsx` | `default` | Signed out successfully | See you next time! | Positive/Success |
| `src/components/LogoutButton.tsx` | `destructive` | Logout failed | (Dynamic/No Description) | Negative/Error |
| `src/components/SankalpSwitch.tsx` | `destructive` | Not authenticated | Please sign in first | Neutral/Info |
| `src/components/SankalpSwitch.tsx` | `default` | SANKALP Loop Started | ${duration} minute session begun! | Neutral/Info |
| `src/components/SankalpSwitch.tsx` | `destructive` | Failed to start | (Dynamic/No Description) | Negative/Error |
| `src/components/SankalpSwitch.tsx` | `default` | SANKALP Loop Completed | Session ended. Duration: ${data.duration} minutes | Positive/Success |
| `src/components/SankalpSwitch.tsx` | `destructive` | Failed to end | (Dynamic/No Description) | Negative/Error |
| `src/components/app/audio-conversation.tsx` | `destructive` | Error | Could not process audio. Please try again. | Negative/Error |
| `src/components/app/audio-conversation.tsx` | `destructive` | Microphone Error | Could not access the microphone. Please check permissions and try again. | Negative/Error |
| `src/components/planner/AddStudyMaterial.tsx` | `destructive` | Not authenticated | Please sign in first | Neutral/Info |
| `src/components/planner/AddStudyMaterial.tsx` | `default` | Study material added! | Your notes have been saved successfully | Positive/Success |
| `src/components/planner/AddStudyMaterial.tsx` | `destructive` | Failed to add material | (Dynamic/No Description) | Negative/Error |
| `src/components/planner/AddStudyMaterial.tsx` | `default` | Converted to brain map! | Your study material is now a node in your brain map | Neutral/Info |
| `src/components/planner/AddStudyMaterial.tsx` | `destructive` | Conversion failed | (Dynamic/No Description) | Negative/Error |
| `src/components/planner/FocusTimer.tsx` | `default` | (Dynamic/No Title) | (Dynamic/No Description) | Neutral/Info |
| `src/components/planner/FocusTimer.tsx` | `destructive` | Topic Required | Please select a topic before starting the timer. | Neutral/Info |
| `src/components/settings/StudentProfileForm.tsx` | `destructive` | Error | Failed to load profile data. | Negative/Error |
| `src/components/settings/StudentProfileForm.tsx` | `default` | Profile updated | Your changes have been saved. | Positive/Success |
| `src/components/settings/StudentProfileForm.tsx` | `destructive` | Error | Failed to update profile. Please try again. | Negative/Error |
| `src/components/settings/TeacherProfileForm.tsx` | `destructive` | Error | Failed to load profile data. | Negative/Error |
| `src/components/settings/TeacherProfileForm.tsx` | `default` | Profile updated | Your changes have been saved. | Positive/Success |
| `src/components/settings/TeacherProfileForm.tsx` | `destructive` | Error | Failed to update profile. Please try again. | Negative/Error |
| `src/hooks/use-toast.ts` | `default` | (Dynamic/No Title) | (Dynamic/No Description) | Neutral/Info |

## 2. Copy Analysis Recommendations
- **Clarity:** Ensure "Error" messages explain *why* something failed.
- **Actionability:** Success messages should confirm the action taken.
- **Urgency:** Use 'destructive' variant only for critical errors.
