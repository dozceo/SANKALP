# Loading State & Skeleton Screen Consistency Report

## Executive Summary
Audit of loading UX implementation, checking for Next.js `loading.tsx` files and component-level loading states (spinners vs skeletons).

## App Router Loading (loading.tsx)

Found 0 `loading.tsx` files.

No `loading.tsx` files found in `src/app`. Users may see blank screens during navigation.

## Component Loading States

Found 13 components with loading logic.

| Component | `isLoading` Logic | Uses Skeleton | Uses Spinner |
|---|---|---|---|
| `src/components/LogoutButton.tsx` | - | - | ✅ |
| `src/components/SankalpSwitch.tsx` | ✅ | - | ✅ |
| `src/components/StudentSelector.tsx` | ✅ | ✅ | - |
| `src/components/app/audio-conversation.tsx` | - | - | ✅ |
| `src/components/planner/AddStudyMaterial.tsx` | ✅ | - | ✅ |
| `src/components/planner/ScheduleView.tsx` | ✅ | - | ✅ |
| `src/components/profile/StudentProfile.tsx` | ✅ | ✅ | - |
| `src/components/profile/TeacherProfile.tsx` | ✅ | ✅ | - |
| `src/components/rewards/RewardsSkeleton.tsx` | - | ✅ | - |
| `src/components/settings/StudentProfileForm.tsx` | ✅ | - | ✅ |
| `src/components/settings/TeacherProfileForm.tsx` | ✅ | - | ✅ |
| `src/components/ui/sidebar.tsx` | - | ✅ | - |
| `src/components/ui/skeleton.tsx` | - | ✅ | - |

### UX Consistency Analysis

- **Skeleton Usage:** 6 components (46%)
- **Spinner Usage:** 7 components (54%)

**Observation:** Spinners are more common than skeletons. Consider migrating to skeletons for reduced layout shift and better perceived performance.

## Recommendations

1. **Implement `loading.tsx`:** Add loading UI for main route segments (e.g. `/(main)/dashboard`) to support streaming.
2. **Prefer Skeletons:** Replace full-screen spinners with Skeleton loaders that mimic the content layout.
3. **Standardize Props:** Ensure all data-fetching components accept an `isLoading` prop or handle loading internally.
