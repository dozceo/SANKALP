# Explainability Drift Analysis Report

**Generated:** 2/18/2026, 5:05:47 AM
**ADK Source:** `src/ai/adk/decision-engine.ts`
**UI Component:** `src/components/LearningStateCard.tsx`

## Summary
- **ADK Decision Rules:** 6
- **UI Tooltip Explanations:** 3
- **Status:** ⚠️ DRIFT DETECTED
- **Missing Concepts:** 5

## Detailed Comparison

### ADK Decision Logic
| Condition (Simplified) | Reasoning |
|---|---|
| `typeof daysUntilExam === "number" && daysUntilE...` | Exam imminent - high-yield cramming strategy |
| `mastery_probability < 0.4 && (mlSignals.days_un...` | Low mastery with imminent forgetting risk |
| `mastery_probability < 0.4 && attention_risk ===...` | Low mastery with attention challenges - needs engaging format |
| `mastery_probability >= 0.4 && mastery_probabili...` | Moderate mastery but needs refreshing (spaced repetition) |
| `mastery_probability >= 0.7 && days_since_last_r...` | Strong mastery - ready for advanced content |
| `DEFAULT / FALLBACK` | Routine revision recommended |

### UI Tooltip Logic
| Condition | Tooltip Text |
|---|---|
| `intelligence.attentionRisk === 'HIGH'` | High attention risk detected. Consider taking shorter, more frequent sessions. |
| `overallMastery < 0.6` | Mastery levels are below optimal. Prioritize reviewing weak topics. |
| `DEFAULT` | Based on your recent quiz performance, revision gaps, and ML predictions. |

## Drift Analysis
The following ADK concepts appear to be missing from the UI tooltips:
- **Cramming**
- **Forgetting Risk**
- **Progress Allowed**
- **Adaptive Teaching**
- **Routine Revision**
