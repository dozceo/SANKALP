## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.
## 2024-05-24 - React useMemo Referential Equality Trap with Schwartzian Transform
**Learning:** When using the Schwartzian transform (map-sort-map) inside a `useMemo` hook to sort React component data props (like table rows), spreading the item into a new object and destructuring it back out (e.g., `return mapped.map(({ _tempTime, ...item }) => item);`) creates new object references for every item, every time the sort function runs. This entirely defeats `React.memo` on child row components, causing them to re-render even if their underlying data hasn't changed.
**Action:** When applying a Schwartzian transform to React props inside `useMemo`, strictly preserve referential equality by mapping the original objects into tuples (e.g., `[item, parseTime(item)] as const`), sorting the tuples, and then returning the original item reference (e.g., `mapped.map(tuple => tuple[0])`). Avoid object spreading or destructuring when stripping temporary sorting properties.
