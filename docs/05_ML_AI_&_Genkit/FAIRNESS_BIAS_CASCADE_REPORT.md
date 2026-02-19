# Fairness & Bias Cascade Report

## 1. Outcome Disparity Matrix
Analysis of how different behavioral profiles with identical quiz scores (0.55) are treated.

| Profile | Time/Q | Variance | Attempts | ML Prediction | ADK Action | Strategy | Tone |
|---------|--------|----------|----------|---------------|------------|----------|------|
| Baseline Student | 45s | 0.1 | 3 | 0.367 | SCHEDULED_REVISION | DEEP_DIVE | NEUTRAL |
| The Fast Guesser | 15s | 0.25 | 2 | 0.285 | SCHEDULED_REVISION | DEEP_DIVE | NEUTRAL |
| The Deep Thinker | 90s | 0.05 | 2 | 0.491 | SCHEDULED_REVISION | DEEP_DIVE | NEUTRAL |
| The Grinder | 45s | 0.1 | 8 | 0.349 | SCHEDULED_REVISION | DEEP_DIVE | NEUTRAL |
| The Anxious Reviser | 50s | 0.15 | 4 | 0.603 | SCHEDULED_REVISION | DEEP_DIVE | NEUTRAL |
| The Returning Student | 45s | 0.1 | 2 | 0.028 | SCHEDULED_REVISION | DEEP_DIVE | NEUTRAL |

## 2. Explanation Quality Parity
Inferred from Content Strategy and Tone assignment.

**Success:** All profiles received consistent explanation quality parameters.

## 3. Intervention Suggestion Disparity
Did any profile trigger an intervention falsely?

| Profile | Intervention Triggered | Reason |
|---------|------------------------|--------|
| Baseline Student | No | - |
| The Fast Guesser | No | - |
| The Deep Thinker | No | - |
| The Grinder | **YES** | Repeated attempts without improvement |
| The Anxious Reviser | No | - |
| The Returning Student | No | - |

## 4. ADK Decision Logic Audit
Direct unit tests of decision rules.

| Case | Result | Details |
|------|--------|---------|
| High Mastery (0.9) (Simulating Slow Timing via outcome) | PASS | PROGRESS_ALLOWED |
| Attention Risk Amplification (Low vs High) | BIAS DETECTED | Low Risk -> SCHEDULED_REVISION (DEEP_DIVE), High Risk -> ADAPTIVE_TEACHING (INTERACTIVE) |

## 5. Privacy-Preserving Fairness Strategy
This report was generated using **counterfactual testing** with synthetic profiles. No real student data or demographics were used.
