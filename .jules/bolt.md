## 2024-05-18 - Teacher Dashboards Loop Optimization
**Learning:** Found widespread O(N) array allocation overhead in teacher dashboard views (`StudentsPage`, `ClassesPage`) due to chained array methods (`.map().filter()`, `.filter().length`, two separate `.reduce()` calls) inside `useMemo` hooks running on relatively large datasets.
**Action:** Replace map/filter chains and multiple reductions with single-pass `for` loops to eliminate intermediate garbage collection. Hoist `Date.now()` outside of loops to prevent redundant timestamp lookups.
