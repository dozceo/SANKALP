## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2024-05-19 - Mutation Bug in `student_features.ts`
**Learning:** `sort()` modifies the array in-place in JavaScript/TypeScript. The previous `lastActivity` calculation using `history.quizResults.sort(...)[0]` inadvertently reordered the main data array which can lead to unpredictable behaviors elsewhere (e.g. `quizResults` iteration order in trend calculation).
**Action:** Replace `sort()[0]` with a single `O(N)` linear pass when only the maximum/minimum item is needed, specifically preserving the original array order and avoiding unnecessary allocations from array spreads.
