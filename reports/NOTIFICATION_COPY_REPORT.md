# Notification & Alert Copy Effectiveness Audit

**Generated:** 2026-02-19T19:12:37.505Z

## Executive Summary
This audit lists all detected user-facing notification messages (Toasts and Alerts) to facilitate a review of tone, clarity, and consistency.

## Findings (57)

| Type | File | Copy (Title / Description) | Analysis |
|------|------|----------------------------|----------|
| TOAST | `src/app/(auth)/join-class/page.tsx` | **T:** "Authentication Required"<br/>**D:** "Please sign in first to join a class." | ℹ️ Ends with period |
| TOAST | `src/app/(auth)/join-class/page.tsx` | **T:** "Failed to join"<br/>**D:** "result.error || Please verify the code and try again." | Negative sentiment<br/>ℹ️ Ends with period |
| TOAST | `src/app/(auth)/join-class/page.tsx` | **T:** "Error"<br/>**D:** "An unexpected error occurred. Please try again." | Negative sentiment<br/>ℹ️ Ends with period |
| TOAST | `src/app/(auth)/login/page.tsx` | **T:** "Welcome back!"<br/>**D:** "You have successfully signed in." | ℹ️ Exclamation used<br/>ℹ️ Ends with period |
| TOAST | `src/app/(auth)/login/page.tsx` | **T:** "Sign in failed"<br/>**D:** "error.message || Invalid email or password" |  |
| TOAST | `src/app/(auth)/login/page.tsx` | **T:** "Google Sign In Failed"<br/>**D:** "error.message" | Negative sentiment |
| TOAST | `src/app/(auth)/onboarding/page.tsx` | **T:** "Onboarding complete!"<br/>**D:** "Your profile has been set up successfully." | ℹ️ Exclamation used<br/>ℹ️ Ends with period |
| TOAST | `src/app/(auth)/onboarding/page.tsx` | **T:** "Onboarding failed"<br/>**D:** "Failed to complete onboarding. Please try again." | ℹ️ Ends with period, Negative sentiment |
| TOAST | `src/app/(auth)/onboarding/page.tsx` | **T:** "Onboarding Issue"<br/>**D:** "friendlyMessage" |  |
| TOAST | `src/app/(auth)/sign-up/page.tsx` | **T:** "Account created!"<br/>**D:** "Welcome to SANKALP." | ℹ️ Exclamation used<br/>ℹ️ Ends with period |
| TOAST | `src/app/(auth)/sign-up/page.tsx` | **T:** "Sign up failed"<br/>**D:** "error.message || Could not create account" |  |
| TOAST | `src/app/(auth)/teacher-onboarding/page.tsx` | **T:** "Onboarding complete!"<br/>**D:** "Your teacher profile has been set up successfully." | ℹ️ Exclamation used<br/>ℹ️ Ends with period |
| TOAST | `src/app/(auth)/teacher-onboarding/page.tsx` | **T:** "Onboarding failed"<br/>**D:** "Failed to complete onboarding. Please try again." | ℹ️ Ends with period, Negative sentiment |
| TOAST | `src/app/(auth)/teacher-onboarding/page.tsx` | **T:** "Onboarding Issue"<br/>**D:** "friendlyMessage" |  |
| TOAST | `src/app/(main)/classes/page.tsx` | **T:** "Success!"<br/>**D:** "You have successfully joined the class." | ℹ️ Exclamation used, Positive sentiment<br/>ℹ️ Ends with period |
| TOAST | `src/app/(main)/classes/page.tsx` | **T:** "Error"<br/>**D:** "error.message || Failed to join class. Please check the code." | Negative sentiment<br/>⚠️ Long (>60 chars), ℹ️ Ends with period, Negative sentiment |
| TOAST | `src/app/(main)/classes/page.tsx` | **T:** "Left Class"<br/>**D:** "You have successfully left the classroom." | ℹ️ Ends with period |
| TOAST | `src/app/(main)/classes/page.tsx` | **T:** "Error"<br/>**D:** "error.message || Failed to leave class." | Negative sentiment<br/>ℹ️ Ends with period, Negative sentiment |
| TOAST | `src/app/(main)/quiz/page.tsx` | **T:** "Error creating quiz"<br/>**D:** "There was a problem generating your quiz. Please try again." | Negative sentiment<br/>ℹ️ Ends with period |
| TOAST | `src/app/(main)/quiz/page.tsx` | **T:** "Quiz results saved!"<br/>**D:** "Your progress has been recorded." | ℹ️ Exclamation used<br/>ℹ️ Ends with period |
| TOAST | `src/app/(main)/syllabus/page.tsx` | **T:** "Syllabus Saved!"<br/>**D:** "Your syllabus has been added to your planner." | ℹ️ Exclamation used<br/>ℹ️ Ends with period |
| TOAST | `src/app/(main)/syllabus/page.tsx` | **T:** "Error"<br/>**D:** "Failed to save the syllabus. Please try again." | Negative sentiment<br/>ℹ️ Ends with period, Negative sentiment |
| TOAST | `src/app/(main)/teacher/classes/[classId]/page.tsx` | **T:** "Error"<br/>**D:** "Failed to load class details" | Negative sentiment<br/>Negative sentiment |
| TOAST | `src/app/(main)/teacher/classes/[classId]/page.tsx` | **T:** "Copied!"<br/>**D:** "Class code copied to clipboard" | ℹ️ Exclamation used |
| TOAST | `src/app/(main)/teacher/classes/[classId]/page.tsx` | **T:** "Error"<br/>**D:** "Failed to copy class code" | Negative sentiment<br/>Negative sentiment |
| TOAST | `src/app/(main)/teacher/classes/page.tsx` | **T:** "Error"<br/>**D:** "Failed to load classes" | Negative sentiment<br/>Negative sentiment |
| TOAST | `src/app/(main)/teacher/classes/page.tsx` | **T:** "Error"<br/>**D:** "data.error || Failed to create class" | Negative sentiment<br/>Negative sentiment |
| TOAST | `src/app/(main)/teacher/classes/page.tsx` | **T:** "Error"<br/>**D:** "An unexpected error occurred" | Negative sentiment |
| TOAST | `src/app/(main)/teacher/classes/page.tsx` | **T:** "Copied!"<br/>**D:** "Class code copied to clipboard" | ℹ️ Exclamation used |
| TOAST | `src/app/(main)/teacher/classes/page.tsx` | **T:** "Error"<br/>**D:** "Failed to copy class code" | Negative sentiment<br/>Negative sentiment |
| TOAST | `src/app/(main)/teacher/page.tsx` | **T:** "Failed to load dashboard"<br/>**D:** "Could not fetch data" | Negative sentiment |
| TOAST | `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx` | **T:** "Configuration saved"<br/>**D:** "The chatbot configuration has been successfully updated." | ℹ️ Ends with period |
| TOAST | `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx` | **T:** "Error"<br/>**D:** "Failed to save configuration. Please try again." | Negative sentiment<br/>ℹ️ Ends with period, Negative sentiment |
| TOAST | `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx` | **T:** "Error"<br/>**D:** "An unexpected error occurred." | Negative sentiment<br/>ℹ️ Ends with period |
| TOAST | `src/app/(main)/teacher/students/[studentId]/page.tsx` | **T:** "Error"<br/>**D:** "Student not found" | Negative sentiment |
| TOAST | `src/app/(main)/teacher/students/[studentId]/page.tsx` | **T:** "Error"<br/>**D:** "Failed to load student details" | Negative sentiment<br/>Negative sentiment |
| TOAST | `src/app/(main)/teacher/students/page.tsx` | **T:** "Error"<br/>**D:** "Failed to load students" | Negative sentiment<br/>Negative sentiment |
| TOAST | `src/components/LogoutButton.tsx` | **T:** "Signed out successfully"<br/>**D:** "See you next time!" | ℹ️ Exclamation used |
| TOAST | `src/components/LogoutButton.tsx` | **T:** "Logout failed"<br/>**D:** "error.message || Please try again" |  |
| TOAST | `src/components/SankalpSwitch.tsx` | **T:** "Not authenticated"<br/>**D:** "Please sign in first" |  |
| TOAST | `src/components/SankalpSwitch.tsx` | **T:** "Failed to start"<br/>**D:** "friendlyMessage" | Negative sentiment |
| TOAST | `src/components/SankalpSwitch.tsx` | **T:** "Failed to end"<br/>**D:** "error.message" | Negative sentiment |
| TOAST | `src/components/app/audio-conversation.tsx` | **T:** "Error"<br/>**D:** "Could not process audio. Please try again." | Negative sentiment<br/>ℹ️ Ends with period |
| TOAST | `src/components/app/audio-conversation.tsx` | **T:** "Microphone Error"<br/>**D:** "Could not access the microphone. Please check permissions and try again." | Negative sentiment<br/>⚠️ Long (>60 chars), ℹ️ Ends with period |
| TOAST | `src/components/planner/AddStudyMaterial.tsx` | **T:** "Not authenticated"<br/>**D:** "Please sign in first" |  |
| TOAST | `src/components/planner/AddStudyMaterial.tsx` | **T:** "Study material added!"<br/>**D:** "Your notes have been saved successfully" | ℹ️ Exclamation used |
| TOAST | `src/components/planner/AddStudyMaterial.tsx` | **T:** "Failed to add material"<br/>**D:** "error.message" | Negative sentiment |
| TOAST | `src/components/planner/AddStudyMaterial.tsx` | **T:** "Converted to brain map!"<br/>**D:** "Your study material is now a node in your brain map" | ℹ️ Exclamation used |
| TOAST | `src/components/planner/AddStudyMaterial.tsx` | **T:** "Conversion failed"<br/>**D:** "error.message" |  |
| TOAST | `src/components/planner/FocusTimer.tsx` | **T:** "title"<br/>**D:** "message" |  |
| TOAST | `src/components/planner/FocusTimer.tsx` | **T:** "Topic Required"<br/>**D:** "Please select a topic before starting the timer." | ℹ️ Ends with period |
| TOAST | `src/components/settings/StudentProfileForm.tsx` | **T:** "Error"<br/>**D:** "Failed to load profile data." | Negative sentiment<br/>ℹ️ Ends with period, Negative sentiment |
| TOAST | `src/components/settings/StudentProfileForm.tsx` | **T:** "Profile updated"<br/>**D:** "Your changes have been saved." | ℹ️ Ends with period |
| TOAST | `src/components/settings/StudentProfileForm.tsx` | **T:** "Error"<br/>**D:** "Failed to update profile. Please try again." | Negative sentiment<br/>ℹ️ Ends with period, Negative sentiment |
| TOAST | `src/components/settings/TeacherProfileForm.tsx` | **T:** "Error"<br/>**D:** "Failed to load profile data." | Negative sentiment<br/>ℹ️ Ends with period, Negative sentiment |
| TOAST | `src/components/settings/TeacherProfileForm.tsx` | **T:** "Profile updated"<br/>**D:** "Your changes have been saved." | ℹ️ Ends with period |
| TOAST | `src/components/settings/TeacherProfileForm.tsx` | **T:** "Error"<br/>**D:** "Failed to update profile. Please try again." | Negative sentiment<br/>ℹ️ Ends with period, Negative sentiment |

## Guidelines for effective copy
- **Clarity:** Messages should be concise and unambiguous.
- **Actionability:** Users should know what to do next.
- **Tone:** Errors should be helpful, not blaming. Success messages should be encouraging.
