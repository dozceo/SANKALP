# Explainability Tooltip Content Drift Analysis

## Overview
This report compares the ADK decision logic rules with the tooltip content found in UI components to identify discrepancies or missing explanations.

### Analysis of `src/components/LearningStateCard.tsx`
**Found Tooltip/Explanation Strings:**
- "Updated:"
- "High attention risk detected. Consider taking shorter, more frequent sessions."
- "Mastery levels are below optimal. Prioritize reviewing weak topics."
- "Based on your recent quiz performance, revision gaps, and ML predictions."

**Drift Analysis against ADK Rules:**
- ⚠️ **DRIFT DETECTED**: Rule "Exam Cramming Mode" (daysUntilExam <= 3 && mastery_probability < 0.6) expects explanation like "Exam imminent", but no matching UI text was found.
- ⚠️ **DRIFT DETECTED**: Rule "Critical Mastery + Imminent Forgetting" (mastery_probability < 0.4 && days_until_forget < 3) expects explanation like "Imminent forgetting risk", but no matching UI text was found.
- ✅ Rule "Low Mastery + High Attention Risk" appears to be covered.
- ✅ Rule "Moderate Mastery + Stale Knowledge" appears to be covered.
- ✅ Rule "High Mastery + Recent Revision" appears to be covered.

### Analysis of `src/components/InteractiveGraph.tsx`
**Found Tooltip/Explanation Strings:**
- "Zoom In"
- "Zoom Out"
- "Reset View"
- "Fullscreen"

**Drift Analysis against ADK Rules:**
- ⚠️ **DRIFT DETECTED**: Rule "Exam Cramming Mode" (daysUntilExam <= 3 && mastery_probability < 0.6) expects explanation like "Exam imminent", but no matching UI text was found.
- ⚠️ **DRIFT DETECTED**: Rule "Critical Mastery + Imminent Forgetting" (mastery_probability < 0.4 && days_until_forget < 3) expects explanation like "Imminent forgetting risk", but no matching UI text was found.
- ⚠️ **DRIFT DETECTED**: Rule "Low Mastery + High Attention Risk" (mastery_probability < 0.4 && attention_risk === 'HIGH') expects explanation like "Attention challenges", but no matching UI text was found.
- ⚠️ **DRIFT DETECTED**: Rule "Moderate Mastery + Stale Knowledge" (mastery_probability >= 0.4 && mastery_probability < 0.6 && days_since_last_revision > 7) expects explanation like "Needs refreshing", but no matching UI text was found.
- ⚠️ **DRIFT DETECTED**: Rule "High Mastery + Recent Revision" (mastery_probability >= 0.7 && days_since_last_revision <= 14) expects explanation like "Strong mastery", but no matching UI text was found.

## Summary
Found 7 potential drift instances where ADK logic is not explicitly explained in the UI.
Recommendation: Update UI components to include specific conditions for Exam Cramming, Forgetting Risk, and specific Mastery levels.