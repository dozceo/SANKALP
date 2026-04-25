## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.
\n## 2025-02-23 - Date string comparisons and array chained methods
**Learning:** When using Next.js, frontend pages frequently use Date objects inside sort callbacks or loop filtering. Constantly allocating new `Date()` objects causes GC pressure. We can safely fall back to using `Date.parse(x as unknown as string)` on properties that act as dates from the backend because they are serialized down into strings on the client.
**Action:** Hoist `toLowerCase` whenever running `array.filter`, and replace chained `array.map().filter()` operations prior to passing them into a `new Set()` with a single pass `for..of` loop.
