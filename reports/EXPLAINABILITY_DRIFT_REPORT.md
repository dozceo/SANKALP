# Explainability Tooltip Content Drift Analysis

**Date:** 2026-02-19T19:21:00.413Z

## 1. Tooltip Logic (UI)
Extracted logic from `src/components/LearningStateCard.tsx`:
- `if (intelligence.attentionRisk === 'HIGH') return "High attention risk detected. Consider taking shorter, more frequent sessions.";`
- `if (overallMastery < 0.6) return "Mastery levels are below optimal. Prioritize reviewing weak topics.";`
- `return "Based on your recent quiz performance, revision gaps, and ML predictions.";`

## 2. ADK Decision Rules (Backend)
Extracted rules from `src/ai/adk/decision-engine.ts`:
- **Rule 0**: Exam Cramming Mode (< 3 days to exam) - HIGHEST PRIORITY
- **Rule 1**: Critical Mastery + Imminent Forgetting
- **Rule 2**: Low Mastery + High Attention Risk
- **Rule 3**: Moderate Mastery + Stale Knowledge
- **Rule 4**: High Mastery + Recent Revision

### Mastery Thresholds in ADK
- `mastery_probability < 0.6`
- `mastery_probability < 0.4`
- `mastery_probability >= 0.4`
- `mastery_probability >= 0.7`
- `mastery_probability < 0.3`

## 3. Drift Analysis
### 🔴 Critical Granularity Loss Detected
- **Observation**: The UI tooltip simplifies logic to a single check (`< 0.6`) for "below optimal".
- **Reality**: The ADK distinguishes between **CRITICAL** (`< 0.4`) and **SCHEDULED** (`0.4 - 0.6`).
- **Impact**: Students with critical mastery gaps (< 0.4) receive the same generic "below optimal" message as those needing routine practice.
- **Recommendation**: Update `LearningStateCard.tsx` to include a specific case for `< 0.4` (Urgent Revision).
### ⚠️ Explanation Depth Gap
- **Observation**: The tooltip text appears static ("Based on your recent quiz performance...").
- **Reality**: The ADK generates dynamic `reasoning` strings (e.g., "Exam imminent", "Low mastery with attention challenges").
- **Impact**: Users miss out on the specific "Why" behind the AI's assessment.
- **Recommendation**: Inject the `intelligence.reasoning` or `intelligence.adkDecision` directly into the tooltip content.
