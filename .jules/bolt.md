## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2026-05-09 - Array Mutation and Chained Loops
**Learning:** In JavaScript, using `.sort()` on a shared array mutates it in place, causing unpredictable side effects in other parts of the application that depend on that array. Additionally, using `array.sort()[0]` to find a maximum value is O(N log N), which is inefficient compared to a single O(N) pass. Furthermore, chained array operations like `.map().filter()` create intermediate arrays that increase garbage collection pressure, especially when generating unique Sets.
**Action:** Always use a single O(N) iterative pass to find maximum/minimum values instead of sorting. When populating Sets or calculating aggregations, replace chained `.map().filter().reduce()` calls with unified `for` loops to eliminate intermediate allocations.
