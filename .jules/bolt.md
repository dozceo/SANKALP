## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.
## 2025-02-23 - Date Parsing Optimization
**Learning:** `new Date(string).getTime()` creates a Date object which causes pressure on the garbage collector, specifically inside map iterations or sort functions over hundreds of elements. `Date.parse(string)` skips object creation and strictly returns a number, which can be ~2-10x faster.
**Action:** Prefer `Date.parse()` over `new Date().getTime()` whenever the sole purpose is to retrieve a numeric timestamp from a string.
