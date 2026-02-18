# Cross-System Causal Integrity Report

## Visual DAG of Data Flow
```mermaid
graph TD
    A[User Quiz] -->|Raw Scores| B[Feature Extraction]
    B -->|Feature Vector| C[ML Prediction (Python)]
    C -->|Mastery Probability| D[ADK Decision Engine]
    D -->|Strategy & Context| E[LLM Prompt Construction]
    E -->|Generated Text| F[UI Rendering]
    C -.->|Silent Failure?| F
```

## Semantic Coherence Matrix

| Scenario | ML Signal | ADK Decision | UI Alert Level | Coherence Violations |
|----------|-----------|--------------|----------------|----------------------|
| Baseline High Mastery | 95% | PROGRESS_ALLOWED | LOW | ✅ Consistent |
| Baseline Low Mastery | 2% | ADAPTIVE_TEACHING | HIGH | ✅ Consistent |
| Edge Case: Exam Cramming | 4% | URGENT_REVISION | HIGH | ✅ Consistent |
| Fault Injection: Valid Mastery but Garbage Time | 96% | PROGRESS_ALLOWED | LOW | ✅ Consistent |
| Silent Corruption: High Mastery Signal but Zero Score | 95% | PROGRESS_ALLOWED | LOW | ✅ Consistent |

## Silent Failure Cascades

### Silent Corruption: High Mastery Signal but Zero Score
- ⚠️ **Cascade Detected**: Feature-Model Divergence: Model hallucinated mastery, ADK trusted it blindly.

**Blast Radius**: LOW: Minor UI inconsistency.

## Recommendations
1. **Cross-Check ML with Heuristics**: ADK should not solely rely on ML probability if raw quiz scores are available (e.g. if avg_score < 0.3 but ML > 0.8, flag error).
2. **Circuit Breakers**: Implement bounds checking on Feature Extraction (e.g. time_spent cannot be negative).
3. **Explanation Verification**: Add a post-generation validation step to ensure LLM explanations match the numerical data shown in UI.
