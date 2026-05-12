## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2024-05-23 - Avoiding Array Creation in Render Loops
**Learning:** Chained array methods like \`.map().filter()\` combined with Set initializations (e.g. \`new Set(arr.map(a => a.value).filter(Boolean))\`) create multiple intermediate array allocations which adds GC pressure during React renders. Single-pass explicit loops offer measurable overhead reduction.
**Action:** When deriving unique sets or filtering data in \`useMemo\`, prefer \`for...of\` loops over chained array methods.
