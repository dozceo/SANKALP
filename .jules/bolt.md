## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2024-05-23 - Eliminating Chained Array Allocations
**Learning:** Chained array methods like `.map().filter()` or `.map().reduce()` on large collections generate intermediate arrays that increase memory overhead and garbage collection (GC) pressure. This is particularly noticeable in hot paths or complex derivations within `useMemo` hooks (e.g., populating `Set`s in dashboards or extracting ML features).
**Action:** Replace chained `.map().filter()` or `.map().reduce()` methods with a single `for...of` or `for` loop to compute aggregates or populate data structures directly, eliminating intermediate allocations.
