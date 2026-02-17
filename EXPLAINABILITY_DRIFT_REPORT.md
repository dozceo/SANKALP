# Explainability Drift Analysis Report

**Generated:** 2/17/2026, 7:20:33 PM

## Summary
- **ADK Decision Rules:** 6 distinct reasoning paths found.
- **UI Tooltip Explanations:** 3 distinct explanations found.
- **Status:** ⚠️ DRIFT DETECTED (3 missing explanations)

## Detailed Comparison

### ADK Decision Logic (Source of Truth)
| Condition (Simplified) | Reasoning |
|---|---|
| `typeof daysUntilExam === "number" && daysUntilExam...` | Exam imminent - high-yield cramming strategy |
| `mastery_probability < 0.4 && (mlSignals.days_until...` | Low mastery with imminent forgetting risk |
| `mastery_probability < 0.4 && attention_risk === "H...` | Low mastery with attention challenges - needs engaging format |
| `mastery_probability >= 0.4 && mastery_probability ...` | Moderate mastery but needs refreshing (spaced repetition) |
| `mastery_probability >= 0.7 && days_since_last_revi...` | Strong mastery - ready for advanced content |
| *Default / Other* | Routine revision recommended |

### UI Tooltip Logic (Implementation)
| Condition | Tooltip Text |
|---|---|
| `intelligence.attentionRisk === 'HIGH'` | High attention risk detected. Consider taking shorter, more frequent sessions. |
| `overallMastery < 0.6` | Mastery levels are below optimal. Prioritize reviewing weak topics. |
| `DEFAULT` | Based on your recent quiz performance, revision gaps, and ML predictions. |

## Drift Analysis
The following ADK concepts appear to be missing from the UI tooltips:
- **Cramming**: No tooltip text found containing keywords "cramming, exam".
- **Forgetting Risk**: No tooltip text found containing keywords "forgetting, memory".
- **Spaced Repetition**: No tooltip text found containing keywords "spaced, repetition".
- **Progress Allowed**: No tooltip text found containing keywords "progress, advanced".
- **Adaptive Teaching**: No tooltip text found containing keywords "adaptive, engaging".
- **Routine Revision**: No tooltip text found containing keywords "routine".
