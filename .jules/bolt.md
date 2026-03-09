## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2024-05-19 - Avoid Date instantiation in loops and useMemo
**Learning:** Found multiple instances where `new Date().getTime()` or `new Date(string).getTime()` were heavily used inside React render loops (`.map()`) and `useMemo` hooks (like `filteredStudents` and `studentStats` calculations). This causes significant, unnecessary garbage collection overhead because a new Date object is instantiated and immediately discarded repeatedly.
**Action:** Replace `new Date().getTime()` with `Date.now()` when getting the current timestamp. If comparing against a stored date, verify if it's already a Date object (`instanceof Date`) before calling `.getTime()`, or use `new Date(stored).getTime()` only if necessary. Hoist `Date.now()` calculations outside of `map` or `filter` loops whenever possible to perform the calculation exactly once per render phase.

## 2024-05-19 - Hoist string operations out of O(N) loops
**Learning:** Common pattern: `students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))`. Calling `.toLowerCase()` on the stable `searchQuery` inside the O(N) filter loop forces the engine to re-allocate a lowercase string on every iteration.
**Action:** Always hoist transformations of static or closure-level variables (like `searchQuery.toLowerCase()`) outside of `.map()` or `.filter()` loops to execute them O(1) times instead of O(N) times.
