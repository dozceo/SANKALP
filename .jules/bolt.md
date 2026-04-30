## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2024-05-22 - Search Query Normalization Hoisting
**Learning:** In multiple places across the codebase (`StudyLibrary`, `teacher/students/page`, `teacher/classes/page`, `teacher/classes/[classId]/page`), text search filtering was calling `searchTerm.toLowerCase()` or `searchQuery.toLowerCase()` *inside* the `.filter()` callback. This causes redundant string allocation and lowering for every single item in the array during every render where the filter is evaluated.
**Action:** Always hoist invariant transformations like `.toLowerCase()` on the search string *outside* of the filter loop.

## 2024-05-22 - `getInitials` Allocation Optimization
**Learning:** `getInitials` was using a `name.split(' ').map(n => n[0]).join('').toUpperCase()` chain, which creates an intermediate array of words and an intermediate array of initials on every invocation. In `StudentAnalyticsClient.tsx`, this was replaced with a single-pass string loop.
**Action:** When working with short string manipulations in render paths, favor single-pass loops over chained array methods to reduce GC pressure.
