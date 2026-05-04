## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.
## 2024-05-04 - Minimize Array Operations During Mapping and Filtering
**Learning:** Re-evaluating properties that are identical per item during loops (`new Date().getTime()`, `toLowerCase()`) causes redundant overhead. Chaining `array.map().filter()` or calling `Array.from(new Set(array.map(...)))` creates intermediate arrays and forces multiple full passes, needlessly increasing GC pressure. Using a Schwartzian transform (map-sort-map) reduces computational complexity for sorts.
**Action:** Lift static transformations (like string `.toLowerCase()` on the query, or `Date.now()`) outside of tight iteration loops. Utilize single `for...of` loops to compute derived sets instead of chaining array utilities. Pre-compute sort criteria values within the initial map stage of a sort process instead of recalculating during the sort comparisons.
