## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2025-05-19 - Fast React Hooks Calculations
**Learning:** Chained `.filter().length` and `.reduce()` inside `useMemo` hooks are extremely common in Next.js/React dashboards and cause a huge amount of array memory allocations, particularly with non-trivial datasets.
**Action:** When working on performance, actively identify `useMemo` hooks calculating analytics/stats using array methods and flatten them into a single `for` loop with multiple accumulators, keeping any pre-calculations outside the loop.
