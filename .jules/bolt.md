## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.
## 2024-05-15 - Array Methods for Sets & Date Parsing
**Learning:** Chaining `.map().filter(Boolean)` to construct a `Set` leads to intermediate array allocations and GC overhead. Also, within an O(N log N) `Array.prototype.sort()` pass, instantiating new `Date()` objects from ISO strings creates significant memory churn compared to directly using `Date.parse(string)`, which returns the unix timestamp primitive immediately.
**Action:** Replace `.map().filter()` chains with a single `for...of` loop when extracting unique values into a `Set`. Always use `Date.parse()` in sorts when comparing string timestamps, and hoist `Date.now()` outside rendering loops to avoid redundant calls.
