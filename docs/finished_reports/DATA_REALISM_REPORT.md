# Synthetic Data Generation Realism Audit

**Date:** 2026-02-19T19:10:34.934Z

**Data Source:** TypeScript Simulation (Fallback)
**Sample Size:** 2000

## Distribution Analysis
- **Mastered:** 238 (11.9%)
- **Not Mastered:** 1762 (88.1%)
- **Balance Check:** ⚠️ Imbalanced

## Anomaly Detection
1. **High Score (>90%) but Not Mastered:** 0 cases.
2. **Low Score (<50%) but Mastered:** 0 cases.
3. **Invalid Data (Negative Time):** 0 cases.

## Recommendations
1. **Refine Mastery Logic:** Reduce the penalty for `days_since_last_revision` if the `avg_quiz_score` is very high (>0.9).
2. **Edge Case Coverage:** Add more "crammer" profiles (high attempts, low time, high variance) to test robustness.
3. **Realistic Noise:** The current variance model assumes linear correlation with ability. In reality, even high-ability students have "bad days" (outliers).
