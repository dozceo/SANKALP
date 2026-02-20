# Teacher Intervention Suggestion Quality Assessment

## Executive Summary
The current teacher intervention system relies on deterministic, rule-based logic (`makeInterventionDecision` in `src/ai/adk/decision-engine.ts`) that outputs static, pre-defined suggestion strings. While functional for basic flagging, it lacks the specificity and context-awareness expected of an "AI-generated" system. This report evaluates the current quality and proposes a generative AI integration.

## Quality Evaluation

### 1. Specificity
- **Score: Low (2/5)**
- **Observation**: Suggestions are generic templates (e.g., "Immediate 1-on-1 intervention required"). They do not reference the specific topic nuances, the student's learning style, or the exact nature of the struggle (e.g., conceptual misunderstanding vs. careless errors).
- **Impact**: Teachers receive a "one-size-fits-all" advice which they may eventually ignore due to repetition.

### 2. Actionability
- **Score: Medium (3/5)**
- **Observation**: The actions suggested ("Consider individualized learning plan", "Engage student with personalized motivation") are valid pedagogical strategies but lack concrete steps.
- **Impact**: Teachers have to figure out *how* to implement the plan themselves, reducing the value of the "Assistant".

### 3. Context-Awareness
- **Score: Low (2/5)**
- **Observation**: The logic uses `mlSignals` (mastery, attention risk) to *trigger* the intervention, but the *content* of the intervention ignores these signals.
- **Impact**: A student struggling with "Algebra" gets the same message as one struggling with "History", despite different intervention strategies being appropriate.

## Technical Finding
The "AI" in the current implementation refers to the *triggering logic* (ML model predicting risk), not the *content generation*. There is no LLM usage in `makeInterventionDecision`.

```typescript
// Current Implementation (Static String)
if (mastery < 0.3) {
    return {
        suggestedAction: "Immediate 1-on-1 intervention required..."
    }
}
```

## Recommendations for Improvement

### 1. Integrate Genkit for Content Generation
- **Strategy**: Use the existing `mlSignals` and `studentHistory` as context for a Genkit prompt.
- **Prompt Example**:
  > "Student [Name] is struggling with [Topic] (Mastery: 20%). They have high attention risk and haven't logged in for 5 days. Suggest 3 specific, quick intervention steps for the teacher."

### 2. Dynamic Suggestion Structure
- **Proposed Output**:
  ```json
  {
    "summary": "Risk of dropout due to frustration with Algebra.",
    "actions": [
      "Send a supportive message acknowledging the difficulty of Quadratics.",
      "Assign a 5-minute 'basics refresher' video instead of a full quiz.",
      "Schedule a 10-minute check-in on Friday."
    ]
  }
  ```

### 3. Surface "Why"
- **Enhancement**: Include the specific data points that triggered the risk (e.g., "Failed 3 consecutive quizzes", "Time per question < 5 seconds"). This explains the *why* behind the AI's flag.
