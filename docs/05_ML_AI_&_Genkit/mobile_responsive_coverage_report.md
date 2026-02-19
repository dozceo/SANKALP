# Mobile Responsive Breakpoint Coverage Audit (Task 16)

## Overview
This report lists components and pages that use fixed desktop-centric layout classes without appropriate responsive modifiers, potentially causing layout breaks on mobile devices.

## Findings

### Grid Layouts Lacking Responsive Modifiers
These components use `grid-cols-X` directly, which forces a multi-column layout even on small screens where a single column is typically required.

| File Location | Issue | Recommendation |
|---|---|---|
| `src/app/(main)/teacher/students/[studentId]/page.tsx` | `grid-cols-3` | Change to `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |
| `src/app/(main)/planner/page.tsx` | `grid-cols-4` (Tabs) | Change to `grid-cols-2 sm:grid-cols-4` or allow horizontal scroll |
| `src/app/(main)/teacher/classes/[classId]/page.tsx` | `grid-cols-2` | Change to `grid-cols-1 md:grid-cols-2` |
| `src/app/(main)/teacher/students/page.tsx` | `grid-cols-2` | Change to `grid-cols-1 md:grid-cols-2` |
| `src/app/(main)/quiz/page.tsx` | `grid-cols-2` | Change to `grid-cols-1 md:grid-cols-2` |
| `src/components/planner/AddStudyMaterial.tsx` | `grid-cols-2` | Change to `grid-cols-1 sm:grid-cols-2` |
| `src/app/(main)/syllabus/page.tsx` | `grid-cols-2` (Tabs) | Change to `grid-cols-1 sm:grid-cols-2` |

### Fixed Width Constraints
These components use fixed pixel widths (e.g., `w-[200px]`, `w-96`) without `min-w` or responsive overrides, which may cause overflow or truncation on narrow screens.

| File Location | Issue | Recommendation |
|---|---|---|
| `src/components/planner/StudyLibrary.tsx` | `w-[200px]` (Select) | Use `w-full sm:w-[200px]` |
| `src/app/(main)/chat/page.tsx` | `w-[180px]` (Select) | Use `w-full sm:w-[180px]` |
| `src/app/(main)/settings/page.tsx` | `w-[180px]` (Select) | Use `w-full sm:w-[180px]` |
| `src/app/(main)/teacher/page.tsx` | `w-[100px]` (Table Head) | Ensure table allows horizontal scroll |

## Conclusion
Several key layouts, particularly in the Teacher dashboard and Planner tabs, are hardcoded to multi-column grids. This will result in broken or severely squeezed content on mobile viewports (< 640px). A systematic update to use `grid-cols-1` as the default and add `md:grid-cols-X` is recommended.
