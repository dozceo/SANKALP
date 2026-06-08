## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.
## 2025-03-08 - Garbage Collection and Array Allocation Optimizations
**Learning:** Chained array methods like `.filter().map().reduce()` and full `.sort()` on large arrays (like student histories) create significant intermediate allocations that trigger aggressive garbage collection and spike memory usage, slowing down the Node.js event loop during heavy ML feature extraction pipelines.
**Action:** Replace `O(N log N)` `.sort()` operations used for top-K extraction with a single `O(N)` pass using a sliding insertion window. Flatten chained functional array methods into a single `for` loop that computes all required metrics simultaneously without creating new array instances in memory.
