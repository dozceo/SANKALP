## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.
## 2026-03-06 - Prevent Redundant Allocations in Loops
**Learning:** Instantiating Date objects (`new Date(string).getTime()`) and calling `.toLowerCase()` inside array iteration methods (like `.filter`) creates significant garbage collection overhead and O(N) redundant allocations.
**Action:** Always hoist string transformations like `.toLowerCase()` outside of loops and use primitive parsers like `Date.parse(string)` or `Date.now()` instead of creating new Date objects when only a numeric timestamp is needed.
