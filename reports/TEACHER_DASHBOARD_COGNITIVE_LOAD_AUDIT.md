# Teacher Dashboard Cognitive Load Audit

This report evaluates the information density and cognitive load of the Teacher Dashboard components based on UI element usage and data binding complexity.

## Summary
- Total Files Analyzed: 7
- Average Density Score: 38

## High Cognitive Load Areas
Files with the highest density scores, indicating complex UI with many elements and data bindings.

| Filepath | Density Score | Key Components | Data Props |
| :--- | :--- | :--- | :--- |
| `src/app/(main)/teacher/classes/page.tsx` | **65** | Card (7), Button (6), Input (4) | 23 |
| `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx` | **47** | Card (6), Button (2), ChartContainer (1) | 21 |
| `src/app/(main)/teacher/students/page.tsx` | **46** | Card (7), Select (3), Badge (2) | 16 |
| `src/app/(main)/teacher/classes/[classId]/page.tsx` | **40** | Card (7), Button (5), Badge (2) | 8 |
| `src/app/(main)/teacher/students/[studentId]/page.tsx` | **35** | Card (4), Button (4), Badge (3) | 9 |
| `src/app/(main)/teacher/page.tsx` | **26** | Card (2), Badge (2), Button (2) | 8 |
| `src/app/(main)/teacher/student/[studentId]/page.tsx` | **4** | Button (1) | 2 |

## Recommendations
1. **Simplify High-Density Views**: Break down files with scores > 50 into smaller sub-components.
2. **Progressive Disclosure**: Use accordions, tabs, or modals to hide secondary information in high-load views.
3. **Visual Hierarchy**: Ensure critical 'Alert' or 'Badge' elements are not drowned out by excessive 'Card' or 'Chart' usage.
