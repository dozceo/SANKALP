## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2024-05-23 - Avoiding O(N log N) Date Object Allocations in Sorting
**Learning:** When sorting arrays of objects based on a property that requires parsing (like a date string or timestamp), using `new Date(a.prop) - new Date(b.prop)` inside the `.sort()` comparator creates two Date objects for every comparison. Since V8 sorting is `O(N log N)`, this results in unnecessary memory allocations and garbage collection pressure that scales exponentially worse with list size compared to linear processing.
**Action:** Use a Schwartzian transform (map-sort-map). Map the array once to extract/parse the sort key into a primitive number (e.g. `{ item, time: new Date(item.prop).getTime() }`), sort the mapped objects (`a.time - b.time`), and then map back to the original items. This guarantees exactly `O(N)` Date object allocations instead of `O(N log N)`.
