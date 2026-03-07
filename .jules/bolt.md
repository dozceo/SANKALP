## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2024-05-24 - [Avoid Date.parse TypeErrors]
**Learning:** `Date.parse()` strictly expects a string argument in TypeScript. When dealing with mixed types (e.g., `Date | string` or uncertain values), using `Date.parse(dateObject)` causes build failures and is slower than `dateObject.getTime()`.
**Action:** Always check the type or cast appropriately. When replacing `new Date(val).getTime()`, use a ternary like `val instanceof Date ? val.getTime() : Date.parse(val)` to ensure type safety and performance.
