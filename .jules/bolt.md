## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2024-05-23 - Array Sorting Optimizations
**Learning:** `new Date()` object instantiation inside a `.sort()` callback is highly inefficient (O(N log N) allocations). Pre-calculating sort keys (like timestamps) before sorting is significantly faster.
**Action:** When sorting arrays based on parsed values, map the array to include the parsed key, sort the mapped array, and extract the values.

## 2024-05-23 - String Allocation in React Renders
**Learning:** Chained string/array methods like `.split(' ').map(n => n[0]).join('')` allocate multiple intermediate strings/arrays, increasing GC pressure during React renders.
**Action:** Use single-pass string loops (e.g., using a `for` loop and checking for spaces) to extract initials or format strings when the logic runs frequently or during renders.
