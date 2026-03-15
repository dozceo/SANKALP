## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.
## 2026-03-15 - [Bolt: Eliminating Intermediate Arrays]\n**Learning:** Chained array methods (.filter().map().reduce()) in Next.js useMemo blocks allocate intermediate arrays and cause CPU overhead on large datasets (like classes or students). Replacing them with a single-pass loop or combined filter prevents GC pressure.\n**Action:** When calculating multiple stats from an array (e.g., total, average, max), use a single for-loop instead of multiple .reduce() calls.
