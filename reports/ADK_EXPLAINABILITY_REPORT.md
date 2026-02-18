# ADK Decision Explainability Completeness Check

**Date:** 2026-02-18T19:35:53.205Z
**Scope:** ADK Engine -> API -> UI

## 1. Defined Explanations (ADK Decision Engine)
Found 6 distinct reasoning strings in `decision-engine.ts`:

- "Exam imminent - high-yield cramming strategy"
- "Low mastery with imminent forgetting risk"
- "Low mastery with attention challenges - needs engaging format"
- "Moderate mastery but needs refreshing (spaced repetition)"
- "Strong mastery - ready for advanced content"
- "Routine revision recommended"

## 2. API Propagation Check
- **File:** `src/app/api/intelligence/student/route.ts`
- **Finding:** API creates reasoning via hardcoded logic, potentially ignoring granular ADK decision reasoning.
  - **Risk:** High. The granular reasoning defined in the engine is NOT being sent to the frontend. The API constructs a generic summary instead.

## 3. UI Exposure Check
- **File:** `src/components/LearningStateCard.tsx`
- **Finding:** UI iterates over `intelligence.reasoning` array.

## 4. Gap Analysis
There is a disconnect between the **Decision Engine** and the **API Response**.
- The Engine defines specific reasons (e.g., "Exam imminent", "Stale knowledge").
- The API ignores these and generates generic messages (e.g., "Multiple topics require urgent revision").
- **Recommendation:** Update `src/app/api/intelligence/student/route.ts` to aggregate and return the actual `adkDecision.reasoning` strings from all topics.
