## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2026-06-07 - JSX Loop Value Hoisting
**Learning:** To optimize repetitive calculations (like `Date.now()`) inside React JSX array mapping (`.map`), you can hoist the calculation outside the loop by wrapping the block in an explicitly invoked IIFE: `{(() => { const now = Date.now(); return items.map(...) })()}`.
**Action:** Use IIFEs in JSX to hoist calculations outside of large `.map()` loops when extracting to a parent scope or `useMemo` isn't practical.
