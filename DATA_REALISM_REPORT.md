# Synthetic Data Realism Audit

## Methodology
An audit script (`src/ml/training/audit_data.py`) was executed to generate 1000 synthetic student records using `generate_data.py`. The resulting distributions were analyzed for statistical realism and edge case coverage.

## Findings

### 1. Unrealistic Feature Separation (Data Leakage)
*   **Observation:** The separation between "Mastered" and "Not Mastered" classes is too clean, particularly for `avg_quiz_score`.
*   **Data:**
    *   Mean Score (Mastered): ~0.80
    *   Mean Score (Not Mastered): ~0.29
    *   Overlap: There were **0 students** with >80% score who were not mastered.
*   **Impact:** The ML model will likely learn a simple linear threshold on `avg_quiz_score` (e.g., `if score > 0.5 then mastered`) and ignore complex features like time spent or consistency. This defeats the purpose of a multi-feature ML model.

### 2. Time Distribution Issues
*   **Observation:** "Not Mastered" students follow a uniform distribution from 10s to 120s.
*   **Critique:** Real-world struggling students typically fall into two modes:
    1.  **Fast Guessers:** Very low time (<15s).
    2.  **Strugglers:** Very high time (>90s).
    A uniform distribution averages this out to ~66s, which misleadingly suggests they spend *more* time than masters (who average ~40s).

### 3. Lack of Feature Correlation
*   **Observation:** `attempts_per_topic` and `avg_quiz_score` are generated independently based on the class label.
*   **Critique:** In reality, these are correlated *within* the class. A struggling student who attempts 10 times should see some score improvement compared to one who attempts once. The current generator does not model this causal link.

## Recommendations

### 1. Introduce Noise and Overlap
*   Allow some "Not Mastered" students to have high scores (lucky guessers).
*   Allow some "Mastered" students to have low scores (anxiety/silly mistakes).
*   **Action:** Increase the variance of the Beta distributions and mix the parameters slightly.

### 2. Implement Bimodal Time Distribution
*   For "Not Mastered", generate time from a mixture of two distributions (e.g., 20% fast, 80% slow) rather than a single uniform range.

### 3. Causal Generation Logic
*   Generate features first, then derive the label (or use a latent variable model).
*   Example: `Mastery_Score = (0.7 * Quiz_Score) + (0.3 * Consistency) + Noise`.
*   Threshold `Mastery_Score` to get the binary label. This ensures the label is a complex function of the features, forcing the ML model to actually learn the relationship.
