# Typography Drift Report

## 1. Font Size Usage Frequency
Total instances found: 318

| Class Name | Frequency |
| :--- | :--- |
| `text-sm` | 128 |
| `text-xs` | 48 |
| `text-2xl` | 37 |
| `text-lg` | 32 |
| `text-3xl` | 28 |
| `text-base` | 16 |
| `text-xl` | 12 |
| `text-[10px]` | 9 |
| `text-4xl` | 4 |
| `text-5xl` | 3 |
| `text-7xl` | 1 |

## 2. Ad-hoc Font Sizes (Arbitrary Values)
These are deviations from the design system's type scale.

| File | Class |
| :--- | :--- |
| `src/app/(main)/classes/page.tsx` | `text-[10px]` |
| `src/app/(main)/classes/page.tsx` | `text-[10px]` |
| `src/app/(main)/classes/page.tsx` | `text-[10px]` |
| `src/app/(main)/classes/page.tsx` | `text-[10px]` |
| `src/app/(main)/classes/page.tsx` | `text-[10px]` |
| `src/components/PersonalKnowledgeGraph.tsx` | `text-[10px]` |
| `src/components/app/sidebar-nav.tsx` | `text-[10px]` |
| `src/components/app/teacher-sidebar-nav.tsx` | `text-[10px]` |
| `src/components/app/teacher-sidebar-nav.tsx` | `text-[10px]` |

## 3. Heading Hierarchy Consistency
Checking usage of `h1`-`h6` tags and their applied typography classes.

### H1
| File | Typography Classes |
| :--- | :--- |
| `src/app/(auth)/onboarding/page.tsx` | `text-4xl` |
| `src/app/(auth)/teacher-onboarding/page.tsx` | `text-4xl` |
| `src/app/(main)/brain-map/page.tsx` | `text-3xl` |
| `src/app/(main)/chat/page.tsx` | `text-3xl` |
| `src/app/(main)/classes/page.tsx` | `text-3xl` |
| `src/app/(main)/classes/page.tsx` | `text-3xl` |
| `src/app/(main)/home/page.tsx` | `text-3xl` |
| `src/app/(main)/mentor/page.tsx` | `text-3xl` |
| `src/app/(main)/planner/page.tsx` | `text-3xl` |
| `src/app/(main)/quiz/page.tsx` | `text-3xl` |
| `src/app/(main)/rewards/page.tsx` | `text-3xl` |
| `src/app/(main)/settings/page.tsx` | `text-3xl` |
| `src/app/(main)/syllabus/page.tsx` | `text-3xl` |
| `src/app/(main)/teacher/classes/page.tsx` | `text-3xl` |
| `src/app/(main)/teacher/page.tsx` | `text-3xl` |
| `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx` | `text-3xl` |
| `src/app/(main)/teacher/students/page.tsx` | `text-3xl` |
| `src/app/test-accessibility/page.tsx` | `text-2xl` |
| `src/app/test-charts/page.tsx` | `text-2xl` |
| `src/components/ErrorBoundary.tsx` | `text-2xl` |
| `src/components/app/header.tsx` | `text-xl` |
| `src/components/profile/StudentProfile.tsx` | `text-3xl` |
| `src/components/profile/TeacherProfile.tsx` | `text-3xl` |

### H2
| File | Typography Classes |
| :--- | :--- |
| `src/app/(auth)/onboarding/page.tsx` | `text-3xl` |
| `src/app/(auth)/onboarding/page.tsx` | `text-3xl` |
| `src/app/(auth)/onboarding/page.tsx` | `text-3xl` |
| `src/app/(auth)/teacher-onboarding/page.tsx` | `text-3xl` |
| `src/app/(auth)/teacher-onboarding/page.tsx` | `text-3xl` |
| `src/app/(main)/brain-map/page.tsx` | `text-xl` |
| `src/app/(main)/profile/page.tsx` | `text-2xl` |
| `src/app/(main)/teacher/classes/[classId]/page.tsx` | `text-2xl` |
| `src/app/(main)/teacher/student/[studentId]/page.tsx` | `text-2xl` |
| `src/app/(main)/teacher/students/[studentId]/page.tsx` | `text-2xl` |
| `src/app/test-accessibility/page.tsx` | `text-xl` |
| `src/app/test-accessibility/page.tsx` | `text-xl` |
| `src/app/test-accessibility/page.tsx` | `text-xl` |
| `src/app/test-accessibility/page.tsx` | `text-xl` |
| `src/components/app/sidebar-nav.tsx` | `text-xl` |
| `src/components/app/teacher-sidebar-nav.tsx` | `text-xl` |
| `src/components/profile/StudentProfile.tsx` | `text-2xl` |
| `src/components/profile/TeacherProfile.tsx` | `text-2xl` |

### H3
| File | Typography Classes |
| :--- | :--- |
| `src/app/(main)/brain-map/page.tsx` | `text-lg` |
| `src/app/(main)/brain-map/page.tsx` | `text-sm` |
| `src/app/(main)/classes/page.tsx` | `(inherited/default)` |
| `src/app/(main)/syllabus/page.tsx` | `text-lg` |
| `src/app/(main)/syllabus/page.tsx` | `text-lg` |
| `src/app/(main)/syllabus/page.tsx` | `text-lg` |
| `src/app/(main)/teacher/classes/[classId]/page.tsx` | `text-lg` |
| `src/app/(main)/teacher/classes/[classId]/page.tsx` | `text-lg` |
| `src/app/(main)/teacher/classes/page.tsx` | `text-xl` |
| `src/app/(main)/teacher/students/page.tsx` | `text-xl` |
| `src/components/InteractiveGraph.tsx` | `text-sm` |
| `src/components/planner/StudyLibrary.tsx` | `text-lg` |
| `src/components/profile/StudentProfile.tsx` | `text-lg` |
| `src/components/profile/TeacherProfile.tsx` | `text-lg` |

### H4
| File | Typography Classes |
| :--- | :--- |
| `src/app/(main)/brain-map/page.tsx` | `text-sm` |
| `src/app/(main)/home/page.tsx` | `(inherited/default)` |
| `src/app/(main)/home/page.tsx` | `(inherited/default)` |
| `src/app/(main)/syllabus/page.tsx` | `(inherited/default)` |
| `src/app/(main)/syllabus/page.tsx` | `(inherited/default)` |
| `src/components/planner/StudyLibrary.tsx` | `text-sm` |
| `src/components/planner/StudyLibrary.tsx` | `text-sm` |
| `src/components/profile/TeacherProfile.tsx` | `text-sm` |
| `src/components/profile/TeacherProfile.tsx` | `text-sm` |

### H5
| File | Typography Classes |
| :--- | :--- |
| `src/components/ui/alert.tsx` | `(inherited/default)` |

### H6
No `<h6>` tags found.


## Recommendations
1. **Standardize Headings**: Ensure all heading levels use consistent font sizes (e.g., `h1` -> `text-4xl`, `h2` -> `text-3xl`).
2. **Eliminate Arbitrary Values**: Replace `text-[...]` with the nearest standard Tailwind class or define a new theme token.
3. **Use Semantic Components**: Instead of `div` or `p` with large text, use appropriate heading tags.
