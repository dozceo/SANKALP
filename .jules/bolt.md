## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2025-05-03 - [Consolidating Array Traversals]
**Learning:** Chained array methods (`.filter().reduce()`) and single-purpose `.reduce()` calls on the same dataset in complex React `useMemo` hooks (like Teacher Stats) create multiple intermediate array allocations and redundant iterations, amplifying garbage collection pressure on large datasets.
**Action:** Combine multi-pass filtering, aggregation, and max-finding into single O(N) `for` loops within `useMemo` hooks when performance is a priority.

## 2025-05-03 - [Array Mutation via Sort]
**Learning:** Using `array.sort()[0]` to find a maximum value not only performs an O(N log N) operation unnecessarily but mutates the underlying array in-place, which can cause severe side-effects in ML feature extraction or React state.
**Action:** Always replace `.sort()[0]` with a single O(N) max-finding loop, especially in data extraction utilities.
