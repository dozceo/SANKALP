## 2023-10-27 - O(N log N) Array mutations masquerading as getters
**Learning:** In `student_features.ts`, the code `const lastActivity = history.quizResults.sort(...)[0]` was silently mutating the original `quizResults` array in place while extracting a max value. This caused O(N log N) GC pressure and potential state corruption in downstream logic that expected chronologically unsorted history.
**Action:** Always scan for `array.sort()[0]` usage when refactoring analytical components. Replace them with single-pass O(N) loops that maintain array purity and drastically reduce allocation overhead.

