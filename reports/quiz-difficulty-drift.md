# Quiz Question Difficulty Calibration Drift Report

## Executive Summary
The Adaptive Quiz Engine (`src/ai/flows/adaptive-quiz-engine.ts`) relies on a single-pass generation strategy where the desired difficulty is specified in the prompt. There is currently **no verification mechanism** to ensure the generated questions actually match the requested difficulty (Easy, Medium, Hard). This absence of calibration makes the system susceptible to "difficulty drift," where questions may become too easy or too hard over time, or fail to adapt to the student's mastery level effectively.

## Methodology
1.  **Code Analysis:** Reviewed `src/ai/flows/adaptive-quiz-engine.ts`.
2.  **Detection Script:** Developed `scripts/detect-quiz-drift.ts` to simulate a "Teacher/Judge" loop that independently evaluates the difficulty of generated questions.

## Findings

### 1. Lack of Calibration Loop
The current implementation generates questions with a simple instruction:
> "The questions should have a difficulty of '{{difficulty}}'."

There is no feedback loop. If the LLM generates an "Easy" question when "Hard" was requested, the system accepts it blindly. This is a critical gap for an *adaptive* learning system.

### 2. Proposed Detection Mechanism
The script `scripts/detect-quiz-drift.ts` implements a proposed solution:
1.  **Generate:** Create a batch of questions.
2.  **Judge:** Use a separate, specialized prompt (`difficultyJudgePrompt`) to blindly rate the questions on the same scale (Easy/Medium/Hard).
3.  **Compare:** Check if `Intended Difficulty == Annotated Difficulty`.

### 3. Simulation Results
Due to the absence of a valid `GOOGLE_GENAI_API_KEY` in the test environment, live drift statistics could not be generated. However, the script is ready to be deployed in a production-like environment to continuously monitor calibration.

## Recommendations

### Short Term (Monitoring)
1.  **Deploy Monitor:** Run the detection script periodically (e.g., nightly) against a sample of generated questions to log alignment rates.
2.  **Feedback:** Allow students/teachers to flag questions as "Too Easy" or "Too Hard" in the UI to collect ground-truth labels.

### Long Term (Auto-Calibration)
1.  **Critic Loop:** Integrate the "Judge" prompt directly into the generation flow.
    *   *Step 1:* Generate Question.
    *   *Step 2:* Judge Difficulty.
    *   *Step 3:* If mismatch, regenerate or re-label the question before saving.
2.  **Dynamic Few-Shot Prompting:** Dynamically inject examples of "Hard" questions (validated by human teachers) into the prompt to anchor the model's understanding of difficulty levels.
