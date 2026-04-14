# Loading State & Skeleton Screen Consistency Audit

**Date:** 2024-05-23
**Scope:** src/components/

## Summary
Loading states are implemented inconsistently. While some areas use `Skeleton` components, complex visualizations like the Knowledge Graph lack dedicated loading states, potentially leading to layout shifts or blank areas during data fetching.

## Audit Findings

### Good Practices
-   **Skeleton Components:** `Skeleton` is correctly used in:
    -   `RewardsSkeleton.tsx` (Comprehensive)
    -   `StudentProfile.tsx`, `TeacherProfile.tsx`
    -   `StudentSelector.tsx`
    -   `Sidebar.tsx`

### Missing Loading States
1.  **Interactive Graph:**
    -   **File:** `src/components/InteractiveGraph.tsx`
    -   **Issue:** Uses `dynamic(..., { ssr: false })` but provides no `loading` component.
    -   **Result:** The component area will be blank until the JavaScript bundle loads and executes on the client.
    -   **Recommendation:** Add a skeleton or spinner to the dynamic import:
        ```typescript
        dynamic(() => import(...), {
          ssr: false,
          loading: () => <GraphSkeleton />
        })
        ```

2.  **Focus Timer:**
    -   **File:** `src/components/FocusTimer.tsx`
    -   **Issue:** No apparent loading state for `currentStudent` or `studyMaterials`. If data is delayed, it might show "No topics available" or an empty select box temporarily.

3.  **Dashboard Widgets:**
    -   Many widgets seem to rely on the parent page to handle loading (via Suspense), but without checking the specific page implementations, it's hard to guarantee consistency.

## Recommendations
1.  **Implement Graph Skeletons:** Create a placeholder for the graph that matches its dimensions and background color to prevent layout shifts.
2.  **Use Suspense Boundaries:** Ensure all async server components are wrapped in `Suspense` with appropriate `fallback` UI.
3.  **Standardize Loading UI:** Use the existing `Skeleton` component consistently across all widgets.
