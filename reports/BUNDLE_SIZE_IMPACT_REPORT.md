# Client-Side Bundle Size Impact Analysis

**Date:** 2026-02-19T19:05:57.107Z

This report identifies usage of potentially large dependencies in client-side components and checks for lazy-loading opportunities.

| File | Heavy Dependency | Import Type | Lazy Loaded? | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `src/app/(auth)/join-class/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(auth)/login/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(auth)/onboarding/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(auth)/sign-up/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(auth)/teacher-onboarding/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(main)/brain-map/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(main)/chat/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(main)/classes/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(main)/home/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(main)/mentor/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(main)/quiz/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(main)/rewards/page.tsx` | `recharts` | Client | ❌ No | ⚠️ Consider `next/dynamic` |
| `src/app/(main)/rewards/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(main)/settings/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(main)/syllabus/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(main)/teacher/classes/[classId]/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(main)/teacher/classes/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(main)/teacher/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx` | `recharts` | Client | ❌ No | ⚠️ Consider `next/dynamic` |
| `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(main)/teacher/students/[studentId]/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/(main)/teacher/students/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/app/page.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/ErrorBoundary.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/InteractiveGraph.tsx` | `react-force-graph-2d` | Client | ❌ No | ⚠️ Consider `next/dynamic` |
| `src/components/InteractiveGraph.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/LearningStateCard.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/LogoutButton.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/PersonalKnowledgeGraph.tsx` | `react-force-graph-2d` | Client | ❌ No | ⚠️ Consider `next/dynamic` |
| `src/components/PersonalKnowledgeGraph.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/SankalpSwitch.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/TopicMasteryGrid.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/app/audio-conversation.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/app/header.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/app/sidebar-nav.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/app/teacher-sidebar-nav.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/planner/AddStudyMaterial.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/planner/FocusTimer.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/planner/ScheduleView.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/planner/StudyLibrary.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/profile/StudentProfile.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/profile/TeacherProfile.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/settings/StudentProfileForm.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/settings/TeacherProfileForm.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/theme-toggle.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/ui/accordion.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/ui/calendar.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/ui/carousel.tsx` | `embla-carousel-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/ui/carousel.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/ui/chart.tsx` | `recharts` | Client | ❌ No | ⚠️ Consider `next/dynamic` |
| `src/components/ui/checkbox.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/ui/dialog.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/ui/dropdown-menu.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/ui/menubar.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/ui/radio-group.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/ui/select.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/ui/sheet.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/ui/sidebar.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |
| `src/components/ui/toast.tsx` | `lucide-react` | Client | ❌ No | ℹ️ Verify usage |

## Summary

- **Files Scanned:** 187
- **Potential Optimization Opportunities:** 5

## Recommendations

1. **Lazy Load Charts & Graphs:** Components using `recharts` or `react-force-graph-2d` should typically be loaded with `next/dynamic` to save initial bundle size.
2. **Firebase Tree Shaking:** Ensure imports are from `firebase/firestore`, `firebase/auth`, etc., rather than the root `firebase` package.
3. **Analyze 'use client':** Minimize the amount of code in client components. Move logic to server components where possible.
