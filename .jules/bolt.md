## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2023-10-27 - [Array Mutation in ML Features]
**Learning:** The previous implementation of `extractAttentionFeatures` mutated the `history.quizResults` array in place using `.sort()[0]`. This is a dangerous pattern in JS that can cause subtle side-effects elsewhere. Replacing it with an O(N) loop not only improved performance from O(N log N) to O(N) but also fixed this mutation bug.
**Action:** When finding the max/min of an array in JS, always prefer a single O(N) pass to avoid the O(N log N) overhead of sorting, and *especially* to avoid accidental in-place mutation of shared reference arrays.

## 2023-10-27 - [Schwartzian Transform for React Sorting]
**Learning:** When sorting complex objects based on derived properties (like parsing dates) in React `useMemo`, calculating those properties *inside* the sort comparator causes them to be recalculated O(N log N) times.
**Action:** Use a Schwartzian Transform (map -> sort -> map) to derive the sort key exactly once per item (O(N)), sort based on the primitive key, and then map back to the original objects.
