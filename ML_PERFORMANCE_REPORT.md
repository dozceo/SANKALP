# ML Model Performance Report

**Date:** 2026-02-17T19:06:17.391321
**Status:** ✅ PASS

## Summary
The model was evaluated on a fixed holdout test set (`src/ml/training/test_set.csv`).

| Metric | Value | Threshold | Status |
|---|---|---|---|
| **Accuracy** | **92.60%** | 80% | ✅ PASS |
| Precision | 49.28% | - | - |
| Recall | 94.44% | - | - |
| F1 Score | 64.76% | - | - |

## Confusion Matrix
| | Predicted Negative | Predicted Positive |
|---|---|---|
| **Actual Negative** | 429 (TN) | 35 (FP) |
| **Actual Positive** | 2 (FN) | 34 (TP) |

## Regression Analysis

✅ Model performance is stable and meets the required accuracy threshold.