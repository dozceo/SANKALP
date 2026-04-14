# Loading State Consistency Report

## Next.js App Router `loading.tsx` Coverage

| Directory | Has loading.tsx | Status |
|---|---|---|
| / | False | ⚠️ Missing (uses parent or default) |
| test-accessibility | False | ⚠️ Missing (uses parent or default) |
| (auth)/sign-up | False | ⚠️ Missing (uses parent or default) |
| (auth)/login | False | ⚠️ Missing (uses parent or default) |
| (auth)/join-class | False | ⚠️ Missing (uses parent or default) |
| (auth)/onboarding | False | ⚠️ Missing (uses parent or default) |
| (auth)/teacher-onboarding | False | ⚠️ Missing (uses parent or default) |
| (main)/planner | False | ⚠️ Missing (uses parent or default) |
| (main)/home | False | ⚠️ Missing (uses parent or default) |
| (main)/teacher | False | ⚠️ Missing (uses parent or default) |
| (main)/teacher/student/[studentId] | False | ⚠️ Missing (uses parent or default) |
| (main)/teacher/classes | False | ⚠️ Missing (uses parent or default) |
| (main)/teacher/classes/[classId] | False | ⚠️ Missing (uses parent or default) |
| (main)/teacher/students | False | ⚠️ Missing (uses parent or default) |
| (main)/teacher/students/[studentId] | False | ⚠️ Missing (uses parent or default) |
| (main)/brain-map | False | ⚠️ Missing (uses parent or default) |
| (main)/mentor | False | ⚠️ Missing (uses parent or default) |
| (main)/classes | False | ⚠️ Missing (uses parent or default) |
| (main)/chat | False | ⚠️ Missing (uses parent or default) |
| (main)/rewards | False | ⚠️ Missing (uses parent or default) |
| (main)/quiz | False | ⚠️ Missing (uses parent or default) |
| (main)/profile | False | ⚠️ Missing (uses parent or default) |
| (main)/settings | False | ⚠️ Missing (uses parent or default) |
| (main)/syllabus | False | ⚠️ Missing (uses parent or default) |
| test-charts | False | ⚠️ Missing (uses parent or default) |

## Component Loading Patterns

Scanning `src/components` for `isLoading`, `loading`, `Skeleton`...

| Component | Pattern Detected |
|---|---|
| SankalpSwitch.tsx | loading var |
| StudentSelector.tsx | loading var, <Skeleton /> |
| planner/AddStudyMaterial.tsx | loading var |
| planner/ScheduleView.tsx | loading var |
| planner/StudyLibrary.tsx | loading var |
| rewards/RewardsSkeleton.tsx | <Skeleton /> |
| profile/StudentProfile.tsx | loading var, <Skeleton /> |
| profile/TeacherProfile.tsx | loading var, <Skeleton /> |
| settings/TeacherProfileForm.tsx | loading var |
| settings/StudentProfileForm.tsx | loading var |
| ui/sidebar.tsx | <Skeleton /> |
