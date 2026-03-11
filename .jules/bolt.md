## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2024-05-23 - Performance Optimizations
**Learning:** Frequent array iteration methods (`filter`, `map`) inside React component render loops or `useMemo` blocks often re-calculate stable values unnecessarily. For example, executing `searchQuery.toLowerCase()` inside a `.filter` callback allocates a new string for every single item in the array (O(N) operations) when it should only be allocated once (O(1) operation).
**Action:** Always hoist stable value calculations (like query transformations, regular expression compiling, and date parsing) outside of array iteration callbacks to prevent redundant processing and object allocation.
