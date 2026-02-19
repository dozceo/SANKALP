# Result: Smart Revision Planner Analysis

**Prompt executed:** `prompts/05-smart-revision-planner.md`  
**Date:** 2026-02-19  
**Source file read:** `src/ai/flows/smart-revision-planner.ts`

---

## Action 1: Review the flow implementation

**Files read:**
- `src/ai/flows/smart-revision-planner.ts`
- `src/ai/adk/decision-engine.ts`
- `src/ai/adk/types.ts`

### Input schema (lines 31–34)

```typescript
const SmartRevisionPlannerInputSchema = z.object({
  brainMap: z.string(),    // Student's Brain Map as a JSON string
  studentId: z.string(),   // Unique identifier for the student
});
```

### Output schema (lines 36–49)

```typescript
SmartRevisionPlannerOutputSchema = z.object({
  revisionList: z.array(z.object({
    topic: z.string(),
    reason: z.string(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    masteryScore: z.number().optional(),   // 0.0 to 1.0
  })),
});
```

### Complete data flow mapped from source

```
smartRevisionPlannerFlow(input)
  1. JSON.parse(input.brainMap)            — parse brain map
  2. getStudent(studentId)                  — DB fetch
  3. getQuizResults(studentId, 100)         — DB fetch
  4. extractMasteryFeatures(topic, history) — per topic
  5. getBatchedCachedPredictions(...)       — cache lookup
  6. batchPredictMastery(uncachedTopics)    — ML model call
  7. cachePrediction(...).catch(console.error) — fire-and-forget write
  8. makeRevisionDecision(context)          — ADK policy engine
  9. logDecision(context, decision)         — analytics
  10. explanationPrompt({topicsToExplain})  — LLM explains WHY
  11. combine ML priorities + LLM reasons  — final output
```

---

## Action 2: Evaluate the ML-ADK-LLM hybrid architecture

**How does ML mastery prediction integrate with ADK decision rules?**  
ML (`batchPredictMastery`) outputs a `mastery_probability` (0–1) and `confidence` per topic. The ADK (`makeRevisionDecision`) uses these values as inputs to apply explicit policy rules — e.g., "if mastery < 0.4 AND days_until_forget < 3 → URGENT_REVISION."

**What is the ADK decision engine's role vs. the LLM's role?**

| Component | Decides | Does NOT decide |
|-----------|---------|-----------------|
| ML model | mastery probability | whether to revise |
| ADK engine | whether to revise, priority, content strategy | why in student-friendly terms |
| LLM | student-friendly explanation of why | which topics to revise |

This is a clean separation. The LLM cannot override the ML or ADK decisions.

**How are the three components decoupled?**  
ML outputs are passed as `MLSignals` struct. ADK operates on `MLSignals` and returns `ADKDecision`. LLM only receives a formatted string listing topics with their reason codes. No component has direct knowledge of the others' internals.

---

## Action 3: Assess caching and performance

**How does batch prediction caching work?**  
`getBatchedCachedPredictions(studentId, topicNames)` does a multi-key cache lookup. Topics with a cache hit skip the ML call. Only cache-miss topics are sent to `batchPredictMastery`.

**What is the cache TTL and expiration strategy?**  
Found at line ~100:
```typescript
expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour TTL
```
1-hour TTL. This is appropriate for daily revision planning.

**Are there race conditions in the async cache writes?**  
Yes. The cache write is fire-and-forget:
```typescript
cachePrediction({...}).catch(console.error);  // not awaited
```
Two simultaneous requests for the same student will both miss the cache, perform duplicate ML calls, and write conflicting results. Under normal usage this is benign; under burst load it wastes ML compute.

---

## Action 4: Analyze the fallback mechanisms

**What happens when ML prediction fails?**  
Per-topic fallback at lines ~135–145:
```typescript
if (topic.daysSinceLastRevision && topic.daysSinceLastRevision > 10) {
  decisions.push({ topic, masteryProbability: 0.5, priority: "MEDIUM", adkDecision: null });
}
```
Topics with >10 days since last revision are included with MEDIUM priority and 50% assumed mastery.

**What happens when the LLM explanation fails?**  
Hardcoded fallback reasons by action type (lines ~210–220):
```typescript
if (!decision.adkDecision) fallbackReason = 'It has been a while since you practiced this topic.';
else if (action === 'URGENT_REVISION') fallbackReason = 'Urgent: Your mastery is critically low.';
else if (action === 'SCHEDULED_REVISION') fallbackReason = 'Spaced repetition: Time to review...';
```

**Is the 10-day fallback threshold appropriate?**  
It is a reasonable heuristic for detecting stale topics, but it misses topics with low mastery that were recently studied. A combined threshold (days OR mastery < 0.4) would be more accurate.

---

## Action 5: Evaluate revision prioritization logic

**How are HIGH/MEDIUM/LOW priorities assigned?**  
Assigned by the ADK decision engine based on policy rules in `src/ai/adk/decision-engine.ts`:
- HIGH: exam imminent (≤3 days) with mastery < 0.6, OR critical mastery (< 0.4) with forgetting risk
- MEDIUM: moderate mastery (0.4–0.6) with stale knowledge (>7 days)
- LOW: other non-urgent cases

**Does the sorting logic produce optimal results?**

```typescript
decisions.sort((a, b) => {
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  if (a.priority !== b.priority) return priorityOrder[a.priority] - priorityOrder[b.priority];
  return a.masteryProbability - b.masteryProbability;  // lowest mastery first within tier
});
```

Primary sort by priority (HIGH first), secondary sort by mastery ascending (weakest first within tier). This is educationally sound.

**Is the 5-topic limit appropriate?**  
Generally yes for daily workload. However, in CRAMMING_MODE (exam ≤3 days), all HIGH priority topics should appear regardless of the limit.

---

## Action 6: Recommend improvements

No code changes were made to this file — the architecture is already strong. Improvements identified:

1. **Exam-mode bypass for the 5-topic limit**: When CRAMMING_MODE is active, do not cap the list.
2. **Cache deduplication**: Add an in-flight request tracker to prevent duplicate ML calls during concurrent requests.
3. **10-day fallback improvement**: Use `(days > 10 OR mastery < 0.4)` as the fallback condition.
4. **Surface ADK reasoning**: Optionally expose the ADK `reasoning` string in the output for teacher dashboard transparency.
