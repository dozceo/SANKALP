## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2025-05-06 - Replacing Array Chains with Loops for Memory Savings
**Learning:** In a codebase using frequent real-time client-side array processing (like dashboard stat generation with `.filter().reduce()`), chaining array methods creates significant garbage collection pressure by returning temporary intermediate arrays on every render.
**Action:** Always favor a single `for...of` loop over multiple chained array operations for complex client-side aggregations, especially on frequently re-rendered Next.js dashboard pages.

## 2025-05-06 - O(N) Date Instantiation via Schwartzian Transform
**Learning:** `Array.prototype.sort()` using `new Date()` inside the callback causes an O(N log N) overhead of unnecessary object creation, causing significant UI lag on large datasets.
**Action:** Apply a Schwartzian Transform (`.map(val => ({val, score})).sort(...).map(...)`) when sorting arrays of complex objects by timestamp to limit Date parsing to strictly O(N).
