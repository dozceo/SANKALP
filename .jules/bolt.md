## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2024-05-23 - Consolidating Chained Array Operations in Render Cycles
**Learning:** Chaining array methods like `.filter().length`, `.map().filter()`, or creating arrays from Sets (`Array.from(new Set(arr.map(...)))`) inside `useMemo` hooks or render functions creates significant temporary object allocations and Garbage Collection (GC) pressure. Even though `useMemo` caches the result, the re-evaluations during dependency changes can cause noticeable jank in lists or data-heavy dashboards.
**Action:** Always refactor chained array operations into single-pass `for...of` loops, hoist operations like `.toLowerCase()` outside the loop, and use `Date.now()` instead of `new Date().getTime()` to minimize object churn.
