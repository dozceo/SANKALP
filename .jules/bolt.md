## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2024-05-24 - Avoiding Double Traversal of Objects
**Learning:** Checking `Object.keys(obj).length > 0` before mapping over `Object.entries(obj)` causes redundant full traversals of the object's properties. In React components with frequent renders (like `StudentProfile`), this leads to unnecessary overhead.
**Action:** Extract `Object.entries(obj)` into a variable first, check its `.length`, and then map over it, halving the traversal work.

## 2024-05-24 - O(N log N) Date Instantiation in Sort Loops
**Learning:** Instantiating `new Date(string).getTime()` directly inside a `.sort()` comparator creates two new Date objects for every single comparison (O(N log N) allocations). This causes immense garbage collection pressure for large arrays.
**Action:** Use `Date.parse(string)` instead of `new Date(string).getTime()` when sorting by date strings, as it operates statically and returns the timestamp without allocating a new object instance.
