## 2024-05-22 - Performance Optimizations
**Learning:** React Context providers often trigger unnecessary re-renders when callback functions depend on state that changes frequently (like `currentStudent`). Using functional state updates (`setCurrentStudent(prev => ...)`) removes the dependency and stabilizes the callback reference, preventing context value churn.
**Action:** Always check context provider values for unstable callback references and use functional updates where possible.

**Learning:** Micro-optimizations in utility functions (like hex parsing in `lightenColor` or avoiding object allocation in `calculateTrend`) can add up in tight loops, especially when used in render cycles or data processing pipelines.
**Action:** Look for object allocation in loops and see if primitive arrays can be used instead.
## 2024-05-23 - Render Crashing IIFE Bug
**Learning:** Wrapping JSX array `.map` operations in an Immediately Invoked Function Expression (IIFE) is a common pattern to create a local scope for hoisting variables (like `Date.now()`) right before the loop. However, forgetting the trailing `()` to execute the function will not cause a syntax error but will pass the uninvoked function as a React child, completely crashing the component render with a "Functions are not valid as a React child" runtime error.
**Action:** Always ensure IIFEs inside JSX are explicitly invoked via `(() => { ... })()`.
