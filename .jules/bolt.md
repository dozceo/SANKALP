## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2024-05-25 - Avoid O(N log N) overhead in Date sorting
**Learning:** Using `new Date(string).getTime()` or `Date.parse()` inside a sort comparison function (e.g., `array.sort((a,b) => Date.parse(a.date) - Date.parse(b.date))`) recalculates the timestamp on every single comparison, leading to O(N log N) parsing operations which becomes a hidden bottleneck on large arrays.
**Action:** Use a Schwartzian transform (`map-sort-map`) to parse dates into primitive numbers exactly once per item (O(N)) before sorting.
