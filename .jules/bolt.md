## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2024-05-22 - Array Allocation in Sets
**Learning:** Using `new Set(array.map(...))` creates an intermediate array that is immediately thrown away, putting unnecessary pressure on garbage collection.
**Action:** Replace `new Set(array.map(...))` with a `Set` initialized empty, and populated via a `for...of` loop when operating on large datasets or in frequent render cycles.
