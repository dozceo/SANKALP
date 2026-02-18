
import { generateQuiz, AdaptiveQuizInput } from '@/ai/flows/adaptive-quiz-engine';
import * as fs from 'fs';

const REPORT_FILE = 'QUIZ_DIFFICULTY_ALIGNMENT_REPORT.md';

// Ensure we have a key (even dummy) so genkit initializes without crashing immediately
if (!process.env.GOOGLE_GENAI_API_KEY) {
    process.env.GOOGLE_GENAI_API_KEY = 'dummy_key_for_analysis';
}

async function analyze() {
    console.log('Starting Quiz Difficulty Analysis...');
    let report = `# Quiz Difficulty Alignment Report

## Executive Summary
This report analyzes the Adaptive Quiz Engine's ability to generate questions aligned with requested difficulty levels.
It examines the prompt structure and attempts runtime verification.

## Static Analysis of Prompt Design

### 1. Difficulty Parameter Handling
The quiz generation prompt in \`src/ai/flows/adaptive-quiz-engine.ts\` explicitly includes the difficulty parameter:
\`\`\`typescript
prompt: \`You are an expert quiz generator.
...
The questions should have a difficulty of "{{difficulty}}".\`
\`\`\`
This explicit instruction is the primary mechanism for difficulty control.

### 2. Education Level Context
The prompt also includes:
\`\`\`typescript
The quiz should be suitable for a "{{educationLevel}}" level.
\`\`\`
This provides critical context (e.g., "High School" vs "University") which modulates the interpretation of "Hard" vs "Easy".

### 3. Schema Validation
The input schema enforces strict typing:
\`\`\`typescript
difficulty: z.enum(['Easy', 'Medium', 'Hard'])
educationLevel: z.string()
\`\`\`
This ensures only valid difficulty levels are passed to the prompt.

## Runtime Verification (Attempted)
`;

    try {
        const easyQuiz = await generateQuiz({
            topic: 'Algebra',
            numQuestions: 3,
            educationLevel: 'High School',
            difficulty: 'Easy'
        });
        report += `
### Runtime Success
Successfully generated a sample quiz.
**Easy Quiz Sample Question:** "${easyQuiz.quiz[0].question}"
(Analysis of complexity would follow here if consistent generation is possible).
`;
    } catch (error: any) {
        report += `
### Runtime Failure
The runtime verification failed, likely due to missing or invalid API keys in the environment.
**Error:** ${error.message}

### Implications for "Drift" Detection
Without live model access, we cannot empirically measure if the model "drifts" (i.e., generates Hard questions when asked for Easy).
However, the prompt structure is sound. Common causes of drift include:
1.  **Ambiguous Prompts**: The current prompt is direct ("difficulty of {{difficulty}}"), reducing ambiguity.
2.  **Model Bias**: Newer models (Gemini 2.0 Flash) are generally better at following constraints.
3.  **Lack of Examples**: The prompt does **not** provide few-shot examples of what "Easy" vs "Hard" looks like.
    *   *Recommendation*: Add few-shot examples to the prompt to anchor the difficulty levels.
`;
    }

    report += `
## Recommendations

1.  **Implement Few-Shot Prompting**:
    *   Add examples of Easy, Medium, and Hard questions in the prompt to ground the model's understanding.
    *   Example: "Easy: 2+2=?, Hard: Integrate x^2..."

2.  **Add Complexity Metrics**:
    *   Post-process generated questions to calculate Flesch-Kincaid readability scores.
    *   If score mismatches the target difficulty, regenerate or flag the question.

3.  **Feedback Loop**:
    *   Capture student performance data. If students consistently fail "Easy" questions, re-calibrate the difficulty prompt.
`;

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`Report generated at ${REPORT_FILE}`);
}

analyze().catch(console.error);
