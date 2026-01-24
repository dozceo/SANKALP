/**
 * ADK README - Agent Decision Kit
 * 
 * The policy orchestration layer for Sankalp.
 */

# ADK (Agent Decision Kit)

## What is ADK?

ADK is the **decision brain** of Sankalp. It sits between ML predictions and LLM content generation, making policy-driven decisions about WHEN and HOW to use AI capabilities.

**Core Principle:** ML predicts → ADK decides → LLM generates

---

## Why ADK Exists

### Problem Without ADK

```typescript
// BAD: LLM decides everything
const prompt = `Look at this data and decide what to teach...`;
```

**Issues:**
- ❌ LLM hallucinates teaching strategies
- ❌ Inconsistent decisions
- ❌ No audit trail
- ❌ Can't optimize for cost/latency
- ❌ Hard to A/B test policies

### Solution With ADK

```typescript
// GOOD: ADK makes deterministic decision
const decision = makeRevisionDecision(mlSignals);
// → { action: "URGENT_REVISION", strategy: "SHORT_FORM" }

// LLM only generates content based on decision
const prompt = `You are a tutor. Explain ${topic} using ${decision.strategy}...`;
```

**Benefits:**
- ✅ Deterministic, auditable decisions
- ✅ Grounded in ML predictions
- ✅ Cost-optimized (only call LLM when needed)
- ✅ Easy to update policies without retraining
- ✅ A/B testable decision rules

---

## Architecture

```
┌─────────────────┐
│  User Activity  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Feature Extract │ (student_features.ts)
└────────┬────────┘
         │
         v
┌─────────────────┐
│ ML Inference    │ (predict_mastery.py)
└────────┬────────┘
         │
         v
┌─────────────────┐
│ 🎯 ADK Engine   │ ← THIS LAYER
└────────┬────────┘
         │
         v
┌─────────────────┐
│ LLM Generator   │ (Genkit)
└────────┬────────┘
         │
         v
┌─────────────────┐
│   UI Render     │
└─────────────────┘
```

---

## Decision Rules (v1)

### Revision Planning

| ML Signals | ADK Decision | LLM Strategy |
|------------|--------------|--------------|
| `mastery < 0.4` AND `days_until_forget < 3` | `URGENT_REVISION` | `SHORT_FORM` |
| `mastery < 0.4` AND `attention_risk HIGH` | `ADAPTIVE_TEACHING` | `INTERACTIVE` |
| `mastery 0.4-0.6` AND `days_since_revision > 7` | `SCHEDULED_REVISION` | `DEEP_DIVE` |
| `mastery > 0.7` | `PROGRESS_ALLOWED` | `CHALLENGE` |
| `days_until_exam < 3` AND `mastery < 0.6` | `URGENT_REVISION` | `SHORT_FORM` (cramming) |

### Teacher Intervention

| ML Signals | Severity | Action |
|------------|----------|--------|
| `mastery < 0.3` AND `attention HIGH` AND `inactive > 10d` | `CRITICAL` | Notify teacher immediately |
| `attention HIGH` AND `dropout_prob > 0.6` | `HIGH` | Suggest motivational intervention |
| `mastery < 0.4` AND `attempts > 5` | `MEDIUM` | Recommend teaching method change |

---

## Code Structure

```
src/ai/adk/
├── types.ts              # Type definitions
├── decision-engine.ts    # Core policy rules
└── README.md            # This file
```

### Key Functions

**`makeRevisionDecision(context: DecisionContext): ADKDecision`**
- Input: ML signals + student context
- Output: What action to take + how LLM should respond
- Used by: Smart Revision Planner

**`makeInterventionDecision(context: DecisionContext): TeacherInterventionSignal | null`**
- Input: ML signals + student context
- Output: Teacher alert or null
- Used by: Teacher Mode

**`selectContentStrategy(decision: ADKDecision): string`**
- Input: ADK decision
- Output: LLM prompt instructions
- Used by: All Genkit flows

---

## Example Usage

```typescript
import { makeRevisionDecision } from '@/ai/adk/decision-engine';

// 1. Get ML predictions
const mlSignals = await predictMastery(features);

// 2. ADK makes decision
const decision = makeRevisionDecision({
  studentId: "student_123",
  topic: "Algebra",
  currentDate: new Date(),
  mlSignals,
});

// 3. Use decision to guide LLM
const llmPrompt = `
You are a tutor explaining ${topic}.

${selectContentStrategy(decision)}

Explanation:
`;

// Result: LLM generates content optimized for student's current state
```

---

## Production Benefits

### 1. Cost Optimization
ADK can decide to skip LLM calls entirely:
```typescript
if (decision.action === DecisionAction.PROGRESS_ALLOWED) {
  return "Great job! Keep going."; // No LLM needed
}
```

### 2. Policy A/B Testing
Easy to test different decision rules:
```typescript
// Test: Should threshold be 0.4 or 0.5?
const MASTERY_THRESHOLD = 0.4; // Just change this
```

### 3. Audit Trail
Every decision is logged:
```json
{
  "timestamp": "2026-01-25T00:40:00Z",
  "studentId": "student_123",
  "decision": "URGENT_REVISION",
  "reasoning": "Low mastery with imminent forgetting risk",
  "adkFlags": ["URGENT_REVISION", "FORGETTING_RISK"]
}
```

### 4. Hallucination Prevention
LLM never decides what to teach - only how to explain it.

---

## Future Enhancements

- [ ] Machine-learned policies (replace rules with trained decision tree)
- [ ] Multi-armed bandit for strategy selection
- [ ] Real-time policy updates based on student outcomes
- [ ] Integration with more ML models (Forgetting Curve, Attention Risk)

---

## Related Documentation

- [ML System README](../ml/README.md)
- [Smart Revision Planner](../flows/smart-revision-planner.ts)
- [Teacher Analytics](./teacher-analytics.ts)
