
# Quiz Question Difficulty Alignment Report

## Summary
The Adaptive Quiz Engine (`adaptive-quiz-engine.ts`) accepts a `difficulty` parameter ('Easy', 'Medium', 'Hard') and includes it in the LLM prompt. However, there is **no post-generation validation** to ensure the generated questions actually match the requested difficulty level. This creates a risk of "Calibration Drift" where "Hard" questions might be too easy or vice versa, depending on the LLM's training data.

## Findings

### 1. Mechanism
- **Input**: The flow correctly accepts a `difficulty` enum.
- **Prompting**: The prompt explicitly asks for the difficulty: `The questions should have a difficulty of "{{difficulty}}".`
- **Validation**: **None**. The system blindly accepts the LLM's output.

### 2. Drift Risk
- **High Risk**: Without validation, the difficulty is subjective to the model (Gemini 2.0 Flash).
- **Drift Factors**:
    - **Topic Ambiguity**: "Hard" Algebra questions are different from "Hard" History questions.
    - **Model Variance**: Stochastic nature of LLMs means consistency is not guaranteed.

### 3. Missing Feedback Loop
- The current flow is stateless and does not adjust based on previous student performance within the generation step (though the *caller* might adjust the input difficulty).

## Recommendations
1.  **Implement Readability Scoring**: Use Flesch-Kincaid or similar metrics to validate the complexity of the question text.
2.  **Calibration Step**: Implement a "Calibration" flow where the LLM is asked to *rate* its own generated questions before returning them, or generate 3 options and pick the best fit.
3.  **Feedback Integration**: Store student performance on specific questions to compute an "Empirical Difficulty" score (e.g., % of students who got it wrong) and update the prompt examples accordingly (Few-Shot Prompting with real data).
