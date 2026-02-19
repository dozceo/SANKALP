# Teacher Dashboard Cognitive Load Audit

This report evaluates the information density and complexity of the Teacher Dashboard components to identify potential cognitive overload.

## Summary
- Total Components Analyzed: 7
- Total Complexity Score: 630

## Component Complexity Ranking
| Component | Complexity Score | Interactive | Data Display | Logic (Hooks) | LOC |
|---|---|---|---|---|---|
| classes/[classId]/page.tsx | 124 | 6 | 47 | 8 | 393 |
| classes/page.tsx | 113 | 25 | 26 | 12 | 537 |
| students/page.tsx | 112 | 25 | 27 | 11 | 414 |
| student/[studentId]/StudentAnalyticsClient.tsx | 104 | 12 | 40 | 4 | 308 |
| students/[studentId]/page.tsx | 96 | 4 | 37 | 6 | 320 |
| page.tsx | 79 | 3 | 29 | 6 | 242 |
| student/[studentId]/page.tsx | 2 | 2 | 0 | 0 | 37 |

## Recommendations
Found 6 high-complexity components (Score > 50). Consider refactoring or breaking down:
- **classes/[classId]/page.tsx**: Score 124. High internal state management. Multiple data visualizations.
- **classes/page.tsx**: Score 113. High internal state management.
- **students/page.tsx**: Score 112. High internal state management.
- **student/[studentId]/StudentAnalyticsClient.tsx**: Score 104. Multiple data visualizations.
- **students/[studentId]/page.tsx**: Score 96. High internal state management. Multiple data visualizations.
- **page.tsx**: Score 79. High internal state management. Multiple data visualizations.
