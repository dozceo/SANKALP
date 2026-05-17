## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.

## 2024-05-17 - O(N log N) Sorting Mutability Risk
**Learning:** `Array.prototype.sort()` mutates the original array in place. In `src/ml/features/student_features.ts`, calling `history.quizResults.sort(...)[0]` to find the latest activity was permanently altering the shared history object passed into the feature extractor, potentially causing subtle bugs in subsequent feature calculations.
**Action:** Replace `array.sort()[0]` for min/max finding with a simple, non-mutating O(N) iterative scan to guarantee state safety and improve performance from O(N log N) to O(N).
