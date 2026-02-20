# Prompt: State Persistence Gap Analysis

## Objective
Identify React components in SANKALP that use local `useState` or `useReducer` without any client-side persistence mechanism, creating data loss on page refresh. Distinguish intentional transient state from state that should survive navigation.

## Actions to Execute

1. **Run** `scripts/audit-state-persistence.ts` against all page and component files
2. **List** all components using `useState` or `useReducer`
3. **Classify** each as: SAFE (persistence found: localStorage/sessionStorage/URL param), RISK (no persistence found), or INTENTIONAL (auth/form state that should be transient)
4. **Identify** the top 5 highest-risk components where data loss would degrade UX
5. **Check** which features use `localStorage` vs. `sessionStorage` and assess appropriateness
6. **Recommend** a state persistence strategy for each HIGH risk component

## Expected Output
A state persistence gap report listing all state-bearing components, their persistence status, risk classification, and recommended persistence mechanism for each gap.
