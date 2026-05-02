## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2025-02-28 - Timer and Iteration Overheads
**Learning:** Adding a constantly changing state like `timeLeft` to a `useEffect` dependency array that manages a `setInterval` forces the interval to be repeatedly destroyed and recreated every second. This can lead to subtle timer drifts, unnecessary function churn, and render overhead. By relying on functional state updates (`setTimeLeft(prev => prev - 1)`) and omitting the time state from dependencies, the interval remains stable.
**Action:** Ensure that timer loops and similar asynchronous interval mechanisms avoid tying their setup dependencies to the very states they modify.

**Learning:** When sorting dates, passing `new Date(string)` inside `.sort()` evaluates the date parsing algorithm on every single comparison operation (O(N log N) times), which is heavily inefficient for large arrays. Utilizing a Schwartzian transform (map-sort-map) mitigates this by pre-parsing each date to a numeric timestamp exactly once per item, creating a stable O(N) memory overhead and drastically reducing computation time.
**Action:** Always pre-process expensive parsing operations (like string-to-Date conversions) before engaging standard array sorting algorithms.
