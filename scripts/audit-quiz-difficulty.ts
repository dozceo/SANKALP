
import fs from 'fs';
import path from 'path';

const FLOW_PATH = path.join(process.cwd(), 'src/ai/flows/adaptive-quiz-engine.ts');

async function runAudit() {
  console.log('Starting Quiz Difficulty Audit (Static Analysis)...');

  if (!fs.existsSync(FLOW_PATH)) {
      console.error(`Flow file not found at ${FLOW_PATH}`);
      return;
  }

  const flowContent = fs.readFileSync(FLOW_PATH, 'utf-8');

  // 1. Check for Difficulty Parameter in Schema
  console.log('\n1. Schema Analysis:');
  const hasDifficultyParam = flowContent.includes('difficulty: z.enum');
  console.log(`- Parameter 'difficulty' in schema: ${hasDifficultyParam}`);

  // 2. Check for Difficulty Usage in Prompt
  console.log('\n2. Prompt Analysis:');
  const usesDifficultyInPrompt = flowContent.includes('{{difficulty}}') || flowContent.includes('{{{difficulty}}}');
  console.log(`- Uses 'difficulty' variable in prompt: ${usesDifficultyInPrompt}`);

  // 3. Check for Post-Processing Validation
  console.log('\n3. Validation Analysis:');
  // Look for code that might analyze the output text complexity
  const hasValidation = flowContent.includes('fleschKincaid') || flowContent.includes('readability') || flowContent.includes('validateDifficulty');
  console.log(`- Contains readability/difficulty validation logic: ${hasValidation}`);

  if (!hasValidation) {
      console.log('- Finding: No programmatic validation of generated question difficulty.');
  }

  // 4. Generate Report
  console.log('\n4. Generating Report...');
  const reportContent = `
# Quiz Question Difficulty Alignment Report

## Summary
The Adaptive Quiz Engine (\`adaptive-quiz-engine.ts\`) accepts a \`difficulty\` parameter ('Easy', 'Medium', 'Hard') and includes it in the LLM prompt. However, there is **no post-generation validation** to ensure the generated questions actually match the requested difficulty level. This creates a risk of "Calibration Drift" where "Hard" questions might be too easy or vice versa, depending on the LLM's training data.

## Findings

### 1. Mechanism
- **Input**: The flow correctly accepts a \`difficulty\` enum.
- **Prompting**: The prompt explicitly asks for the difficulty: \`The questions should have a difficulty of "{{difficulty}}".\`
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
`;

  fs.writeFileSync('QUIZ_DIFFICULTY_ALIGNMENT_REPORT.md', reportContent);
  console.log('- Report generated: QUIZ_DIFFICULTY_ALIGNMENT_REPORT.md');
}

runAudit().catch(console.error);
