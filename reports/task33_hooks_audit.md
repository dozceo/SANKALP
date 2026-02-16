# React Hook Dependency Array Correctness Audit

**Date:** 2024-05-23
**Scope:** src/components, src/app

## Summary
A static analysis of React hooks (useEffect, useCallback, useMemo) identified potential issues with dependency arrays that could lead to performance bottlenecks or stale closures.

## Findings

### Critical Issues

#### 1. Inefficient Timer Implementation
**File:** `src/components/planner/FocusTimer.tsx`
**Hook:** `useEffect` (Timer logic)
```typescript
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => ...);
            }, 1000);
        }
        return () => { ... clearInterval ... };
    }, [isRunning, timeLeft]); // <--- Problem
```
**Issue:** Including `timeLeft` in the dependency array causes the effect to re-run **every second**. This means the interval is set, fires once, component re-renders, effect cleans up old interval, and sets a new one.
**Impact:** Unnecessary processing overhead and potential timing drift.
**Fix:** Remove `timeLeft` from dependencies. The `setTimeLeft` updater function correctly handles the state update without needing the value in scope.

### Potential Risks

#### 1. Complex Memoization in Graph Components
**File:** `src/components/InteractiveGraph.tsx`
**Hook:** `useCallback` (nodeCanvasObject)
```typescript
  const nodeCanvasObject = useCallback((..., globalScale) => {
    // ... uses highlightedNodeRef.current
  }, []); // Dependencies removed
```
**Observation:** The dependency array is empty `[]`, but the function uses `globalScale` (argument) and `highlightedNodeRef` (ref).
**Analysis:** This is intentional and correct for `react-force-graph` performance. The function is stable, and it reads the latest state via refs. Adding dependencies would cause the graph to re-render unnecessarily.
**Status:** **Safe (Intentional Pattern)**.

#### 2. Effect Dependencies in Switch
**File:** `src/components/SankalpSwitch.tsx`
**Hook:** `useEffect`
**Observation:** `useEffect` depends on `[isActive, session]`.
**Status:** **Correct**.

## Recommendations
1.  **Fix FocusTimer:** Refactor the timer `useEffect` to remove `timeLeft` from dependencies.
2.  **Linting:** Enable `eslint-plugin-react-hooks` with `exhaustive-deps` rule to catch these issues automatically during development.
