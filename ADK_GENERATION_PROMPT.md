# ADK Decision Engine Generation Prompt

**Objective:**
Generate a production-ready, TypeScript implementation of the Adaptive Decision Kernel (ADK) Decision Engine (`src/ai/adk/decision-engine.ts`). This module translates Machine Learning (ML) signals into actionable teaching strategies.

**Context:**
The ADK acts as the "cortex" of the AI tutor. It receives raw predictions (mastery probability, forgetting curves, attention risk) and deterministic rules to output a structured `ADKDecision`. This decision dictates *what* the student should do next (e.g., revise, learn new content) and *how* the content should be presented (e.g., short-form, deep-dive).

**Requirements:**
1.  **Strict Typing:** Use the provided TypeScript interfaces (`DecisionContext`, `ADKDecision`, `DecisionAction`, etc.).
2.  **Deterministic Logic:** The output must be a pure function of the input. No side effects.
3.  **Prioritized Rules:** Implement the following decision hierarchy. Higher priority rules must be evaluated first.
4.  **Explainability:** Every decision must include a human-readable `reasoning` string.

**Input Interfaces:**
```typescript
interface MLSignals {
    mastery_probability: number; // 0.0 to 1.0
    days_until_forget?: number;
    attention_risk?: "LOW" | "HIGH";
    days_since_last_revision: number;
    attempts_count: number;
    dropout_probability?: number;
}

interface DecisionContext {
    studentId: string;
    topic: string;
    daysUntilExam?: number;
    mlSignals: MLSignals;
}
```

**Decision Logic (Priority Order):**

*   **R0: Exam Cramming (Priority: HIGH)**
    *   *Condition:* `daysUntilExam <= 3` AND `mastery_probability < 0.6`
    *   *Action:* `URGENT_REVISION`
    *   *Strategy:* `SHORT_FORM`
    *   *Reasoning:* "Exam imminent - high-yield cramming strategy"

*   **R1: Forgetting Risk (Priority: HIGH)**
    *   *Condition:* `mastery_probability < 0.4` AND `days_until_forget < 3`
    *   *Action:* `URGENT_REVISION`
    *   *Strategy:* `SHORT_FORM`
    *   *Reasoning:* "Low mastery with imminent forgetting risk"

*   **R2: Attention Risk (Priority: HIGH)**
    *   *Condition:* `mastery_probability < 0.4` AND `attention_risk == "HIGH"`
    *   *Action:* `ADAPTIVE_TEACHING`
    *   *Strategy:* `INTERACTIVE`
    *   *Reasoning:* "Low mastery with attention challenges - needs engaging format"

*   **R3: Spaced Repetition (Priority: MEDIUM)**
    *   *Condition:* `0.4 <= mastery_probability < 0.6` AND `days_since_last_revision > 7`
    *   *Action:* `SCHEDULED_REVISION`
    *   *Strategy:* `DEEP_DIVE`
    *   *Reasoning:* "Moderate mastery but needs refreshing (spaced repetition)"

*   **R4: Mastery Progress (Priority: LOW)**
    *   *Condition:* `mastery_probability >= 0.7` AND `days_since_last_revision <= 14`
    *   *Action:* `PROGRESS_ALLOWED`
    *   *Strategy:* `CHALLENGE`
    *   *Reasoning:* "Strong mastery - ready for advanced content"

*   **Default (Fallback)**
    *   *Action:* `SCHEDULED_REVISION`
    *   *Strategy:* `DEEP_DIVE`
    *   *Reasoning:* "Routine revision recommended"

**Intervention Logic (Triggered Separately):**

*   **I1: Critical Risk**
    *   *Condition:* `mastery < 0.3` AND `attention == HIGH` AND `days_inactive > 10`
    *   *Severity:* `CRITICAL`

*   **I2: Dropout Risk**
    *   *Condition:* `attention == HIGH` AND `dropout_prob > 0.6`
    *   *Severity:* `HIGH`

*   **I3: Persistent Failure**
    *   *Condition:* `mastery < 0.4` AND `attempts > 5`
    *   *Severity:* `MEDIUM`

**Output Format:**
Return the complete TypeScript file content, including imports and exports. Ensure no external dependencies other than the provided types are used.
