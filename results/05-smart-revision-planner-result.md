# Result: Smart Revision Planner Analysis

**Prompt Source:** `prompts/05-smart-revision-planner.md`  
**Execution Date:** 2026-02-19  
**Flow File:** `src/ai/flows/smart-revision-planner.ts`

---

## 1. Flow Implementation Review

### Input Schema (`SmartRevisionPlannerInputSchema`)

| Field | Type | Description |
|-------|------|-------------|
| `brainMap` | `string` | Student's Brain Map data as a JSON string |
| `studentId` | `string` | Unique identifier for the student |

### Output Schema (`SmartRevisionPlannerOutputSchema`)

| Field | Type | Description |
|-------|------|-------------|
| `revisionList` | `array` | Up to 5 prioritized topics for revision |
| `revisionList[].topic` | `string` | Topic name |
| `revisionList[].reason` | `string` | Student-friendly explanation of why to revise |
| `revisionList[].priority` | `enum` | `'HIGH' | 'MEDIUM' | 'LOW'` |
| `revisionList[].masteryScore` | `number?` | Predicted mastery probability (0–1) |

### Complete Data Flow Architecture

```
Student Request
     │
     ▼
[DB Layer] getStudent() + getQuizResults()
     │
     ▼
[Feature Extraction] extractMasteryFeatures() per topic
     │
     ▼
[Cache Check] getBatchedCachedPredictions()
     │
     ├─── Cache HIT ────────────────────────────────►┐
     │                                                │
     └─── Cache MISS ──► [ML Layer] batchPredictMastery()
                              │
                              ▼
                         cachePrediction() [async, fire-and-forget]
                              │
                              ▼
                    [ADK Decision Engine] makeRevisionDecision()
                              │
                              ▼
                    [LLM Layer] explanationPrompt()
                              │
                              ▼
                    Combined revisionList output
```

---

## 2. ML-ADK-LLM Hybrid Architecture Evaluation

### Architecture Design Assessment

This flow demonstrates the most sophisticated architecture in the SANKALP platform:

| Component | Role | Responsibility |
|-----------|------|----------------|
| **ML Model** | `batchPredictMastery()` | Predict mastery probability per topic |
| **ADK Engine** | `makeRevisionDecision()` | Apply policy rules (urgency, spaced repetition, exam mode) |
| **LLM** | `explanationPrompt()` | Generate motivating, student-friendly explanations |

**Strength**: Clear separation of concerns — ML decides "what mastery level," ADK decides "should we revise," LLM decides "how to explain it." This prevents the LLM from making grading or scheduling decisions.

### ADK Decision Rules Implemented

From `src/ai/adk/decision-engine.ts`:

| Rule | Trigger Condition | Action | Priority |
|------|------------------|--------|---------|
| Exam Cramming | daysUntilExam ≤ 3 AND mastery < 0.6 | URGENT_REVISION | HIGH |
| Critical Mastery | mastery < 0.4 AND days_until_forget < 3 | URGENT_REVISION | HIGH |
| Attention Risk | mastery < 0.4 AND attention_risk = HIGH | ADAPTIVE_TEACHING | HIGH |
| Stale Knowledge | 0.4 ≤ mastery < 0.6 AND days_since_revision > 7 | SCHEDULED_REVISION | MEDIUM |

### LLM Role (Appropriately Limited)

The LLM is only asked to explain **why** to revise topics already selected by the ADK. The prompt template is:

```
Topics to explain: {{{topicsToExplain}}}
For each topic, use the reason_code (URGENT_REVISION, SCHEDULED_REVISION, FALLBACK)
to tailor the explanation (1-2 sentences)...
```

This is an excellent design: the LLM cannot override ML/ADK decisions, only humanize them.

---

## 3. Caching and Performance Assessment

### Cache Implementation

```typescript
cachePrediction({
  studentId, topic, masteryProbability, confidence,
  daysSinceRevision, createdAt,
  expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour TTL
}).catch(console.error);  // Fire-and-forget
```

| Cache Property | Value | Assessment |
|---------------|-------|------------|
| TTL | 1 hour | Reasonable for daily revision planning |
| Cache scope | Per-student, per-topic | Correct granularity |
| Write strategy | Fire-and-forget async | Risk: Cache may not complete before next request |
| Batch lookup | `getBatchedCachedPredictions()` | Efficient multi-key lookup |

### Race Condition Risk

The fire-and-forget cache write (`cachePrediction().catch(console.error)`) means that if two revision plan requests arrive simultaneously for the same student, both will perform ML predictions (cache miss) and attempt to write the same predictions, causing a race condition. Under normal usage this is benign, but under load it wastes ML compute.

---

## 4. Fallback Mechanisms Analysis

### Fallback Chain

```
ML Prediction fails
        │
        ▼
Is daysSinceLastRevision > 10?
        │
    YES │              NO
        ▼               ▼
  Add with         Skip topic
  MEDIUM priority,
  mastery=0.5
```

### Fallback Assessment

| Scenario | Fallback Behavior | Assessment |
|----------|------------------|------------|
| ML prediction error | 10-day threshold fallback | **Adequate** |
| Student not found in DB | Uses brainMap.quizResults | **Good** |
| LLM explanation fails | Hardcoded fallback reasons | **Good** |
| All topics have predictions | No fallback needed | N/A |
| brainMap JSON parse fails | Returns `{ revisionList: [] }` | **Acceptable** |

**Gap**: When the entire ML batch prediction fails (e.g., ML service down), the fallback applies a simple 10-day heuristic. This could result in missing topics with low mastery but recent revision.

---

## 5. Revision Prioritization Logic

### Sorting Algorithm

```typescript
decisions.sort((a, b) => {
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  if (a.priority !== b.priority) return priorityOrder[a.priority] - priorityOrder[b.priority];
  return a.masteryProbability - b.masteryProbability;
});
```

**Primary sort**: Priority (HIGH → MEDIUM → LOW)  
**Secondary sort**: Mastery probability ascending (lowest mastery first within same priority)

### Assessment

- The secondary sort (lowest mastery first) is educationally sound: within the same urgency tier, focus on the weakest topics.
- The 5-topic limit (`mlDecisions.slice(0, 5)`) is appropriate for daily revision workload management.
- **Gap**: Exam-mode topics (cramming) should always appear regardless of the 5-topic limit.

---

## 6. Recommendations

### High Priority
1. **Add exam-mode bypass for 5-topic limit**: When `CRAMMING_MODE` is active, do not cap the revision list — include all critical topics.
2. **Add cache deduplication lock**: Implement an in-flight request tracker to prevent duplicate ML predictions during concurrent requests for the same student.
3. **Improve ML service down fallback**: When batch ML fails entirely, use exponential backoff retry rather than immediately falling back to heuristic.

### Medium Priority
4. **Add `examDate` to output**: Surface the detected exam urgency in the `revisionList` output so the UI can show countdown messages.
5. **Add teacher intervention status**: Include `teacherAlertTriggered: boolean` in output to notify the UI when a teacher has been alerted.
6. **Parse brainMap input more robustly**: Add Zod schema validation for the brainMap JSON string before processing.

### Low Priority
7. **Add revision session duration estimate**: Include an estimated time per topic based on the ADK's `targetDuration` setting.
8. **Surface ADK reasoning in output**: Optionally include the ADK `reasoning` string for transparency to teachers in the dashboard.

---

## Summary

The Smart Revision Planner is the architecturally strongest flow in SANKALP, demonstrating excellent separation of concerns between ML prediction, ADK policy-based decisions, and LLM humanization. The caching strategy is efficient and the fallback chain is comprehensive. Key improvements include handling exam-mode edge cases, preventing cache race conditions under load, and surfacing more ADK metadata in the output for teacher dashboard transparency.
