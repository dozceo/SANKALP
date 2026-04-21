## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.
## 2026-04-21 - Memory Thrashing in List Processing
**Learning:** React `useMemo` hooks calculating metrics (stats, unique entries) from large arrays often unintentionally compound O(N) operations and create unnecessary intermediate arrays due to chained `.map().filter().reduce()` calls.
**Action:** Always combine chained functional array methods into single-pass `for...of` loops, and use `Set` population inside the loop rather than allocating an intermediate array first via `.map()`.
