# Synthetic Data Realism Audit

**Date:** 2024-05-23
**Domain:** Data & APIs
**Scope:** `src/ml/training/generate_data.py`

## Executive Summary
An audit of the synthetic data generation logic reveals that while the data provides basic separation for training, it lacks the complexity and noise inherent in real student behavior. The strict conditional generation based on the binary `mastered` label creates artificial clusters that may lead to model overfitting and poor generalization to real-world edge cases.

## Methodology
*   **Script:** `scripts/audit_data_realism.py`
*   **Sample Size:** 1000 generated records
*   **Analysis:** Statistical distribution comparison, outlier detection, and overlap analysis.

## Key Findings

### 1. Simplistic Bimodal Distributions
The generator uses a strict `if/else` block based on the ground truth label to sample features.
*   **Mastered:** High scores, low variance, fast answers.
*   **Not Mastered:** Low scores, high variance, slow answers.
*   **Impact:** The model learns to separate these two clean clusters easily but may fail on "mixed" profiles (e.g., a student who knows the material but answers slowly due to reading difficulties).

### 2. Lack of Behavioral Nuance
*   **Guessing:** Only 0.8% of samples resembled "guessers" (Low Score + Low Time). In reality, this behavior is common.
*   **Cramming:** Only 2.2% of samples resembled "crammers" (High Attempts + Low Interval).
*   **Score Overlap:** While there is a 40% overlap range in scores, the correlation between `time_spent` and `score` is likely artificially high because they are sampled from distinct distributions conditional on `mastered`.

### 3. Missing Temporal Dynamics
The `days_since_last_revision` feature is sampled from `0-7` (mastered) vs `5-30` (not mastered).
*   **Issue:** This implies that *any* student who hasn't revised in >7 days is likely "not mastered", which enforces a steep forgetting curve assumption that might not hold for all topics.

## Recommendations

### 1. Introduce Noise and Mixed Profiles
Modify the generator to include probabilistic mixing.
```python
# Instead of strict if/else:
is_fast_learner = np.random.random() < 0.2
if is_fast_learner:
    time_spent = np.random.uniform(10, 30) # Fast regardless of mastery
```

### 2. Simulate User Personas
Explicitly model distinct behaviors:
*   **The Guesser:** Low Time, High Variance, Random Score.
*   **The Perfectionist:** High Time, High Score, Low Variance.
*   **The Struggling Student:** High Time, Low Score.

### 3. Continuous Mastery Latent Variable
Instead of binary `mastered` driving generation, sample a continuous `competence` (0.0 to 1.0) and generate features and the binary label from that. This creates realistic "borderline" cases.

### 4. Improve `days_since_last_revision`
Allow "Mastered" students to have long gaps (retention) to train the model to recognize long-term mastery.
