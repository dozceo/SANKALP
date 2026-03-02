## 2024-05-24 - Array and String Allocation Optimizations
**Learning:** In React components that filter lists of items based on search terms, calling `.toLowerCase()` on the search term *inside* the `.filter()` callback causes O(N) redundant string allocations, which can cause micro-stutters during rapid typing.
**Action:** Always hoist `searchTerm.toLowerCase()` outside of the filter loop to ensure O(1) string allocation.

**Learning:** Creating intermediate arrays via `.map().filter()` just to populate a `Set` (e.g., extracting unique values from a list of objects) causes unnecessary memory pressure and garbage collection overhead on every render when used inside `useMemo`.
**Action:** Replace `.map().filter()` chains with a single `for...of` loop that adds values directly to the `Set` when extracting unique values for derived state.