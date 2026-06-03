## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.
## 2024-05-24 - The Hidden Cost of In-Place Sorting

**Learning:** When retrieving the latest item from an array (e.g., finding the most recent activity timestamp), using `array.sort()[0]` is a critical anti-pattern. Not only is it O(N log N) instead of O(N), but it also mutates the original array in place. In `extractAttentionFeatures`, this inadvertently altered the chronological order of the shared `history.quizResults` array, which could corrupt subsequent data operations that expect chronological or insertion order.

**Action:** Always use a single O(N) iterative pass (e.g., `let max = arr[0]; for(let i=1; i<arr.length; i++) if(arr[i] > max) max = arr[i];`) to find minimums or maximums to guarantee performance and immutability.
