# Teacher Dashboard Cognitive Load Audit

This report evaluates the information density and complexity of Teacher Dashboard components.

## src/app/(main)/teacher/classes/[classId]/page.tsx
- **Visual Complexity**: 70 elements
- **Data Density**: 45 data components
- **Interactivity**: 6 interactive elements
- **Status**: ⚠️ High Cognitive Load

## src/app/(main)/teacher/classes/page.tsx
- **Visual Complexity**: 93 elements
- **Data Density**: 25 data components
- **Interactivity**: 40 interactive elements
- **Status**: ⚠️ High Cognitive Load

## src/app/(main)/teacher/page.tsx
- **Visual Complexity**: 39 elements
- **Data Density**: 27 data components
- **Interactivity**: 2 interactive elements
- **Status**: ⚠️ High Cognitive Load

## src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx
- **Visual Complexity**: 58 elements
- **Data Density**: 30 data components
- **Interactivity**: 11 interactive elements
- **Status**: ⚠️ High Cognitive Load

## src/app/(main)/teacher/students/[studentId]/page.tsx
- **Visual Complexity**: 57 elements
- **Data Density**: 34 data components
- **Interactivity**: 4 interactive elements
- **Status**: ⚠️ High Cognitive Load

## src/app/(main)/teacher/students/page.tsx
- **Visual Complexity**: 69 elements
- **Data Density**: 25 data components
- **Interactivity**: 25 interactive elements
- **Status**: ⚠️ High Cognitive Load


**Total High Load Components:** 6

## Optimization Recommendations
1.  **Progressive Disclosure**: Hide detailed data behind "Show More" toggles.
2.  **Dashboard Widgets**: Break complex views into smaller, reusable widget components.
3.  **Visual Hierarchy**: Ensure critical alerts (red) stand out against informational data (neutral).
