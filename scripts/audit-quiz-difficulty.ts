
import 'dotenv/config';
import { generateQuiz } from '../src/ai/flows/adaptive-quiz-engine';
import * as fs from 'fs';

const REPORT_FILE = 'QUIZ_DIFFICULTY_REPORT.md';

async function runAudit() {
    console.log('Starting Quiz Difficulty Audit...');

    const difficulties = ['Easy', 'Medium', 'Hard'] as const;
    const results: any[] = [];

    // Mock data for analysis simulation since API call will fail
    const mockData = {
        'Easy': [
            { question: "What is 2+2?", options: ["3", "4", "5", "6"], correctAnswer: "4" },
            { question: "What color is the sky?", options: ["Red", "Blue", "Green", "Yellow"], correctAnswer: "Blue" }
        ],
        'Medium': [
            { question: "Solve for x: 2x + 5 = 15", options: ["5", "10", "15", "20"], correctAnswer: "5" },
            { question: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], correctAnswer: "Paris" }
        ],
        'Hard': [
            { question: "Explain the theory of relativity.", options: ["E=mc^2", "F=ma", "a^2+b^2=c^2", "PV=nRT"], correctAnswer: "E=mc^2" },
            { question: "Calculate the integral of x^2 dx.", options: ["x^3/3", "2x", "x^2", "x"], correctAnswer: "x^3/3" }
        ]
    };

    for (const difficulty of difficulties) {
        console.log(`Testing difficulty: ${difficulty}...`);

        let questions: any[] = [];
        let source = 'API';

        try {
            // Attempt to call the real API
            const response = await generateQuiz({
                topic: "General Knowledge",
                numQuestions: 2,
                educationLevel: "High School",
                difficulty: difficulty
            });
            questions = response.quiz;
        } catch (error: any) {
            console.warn(`API call failed for ${difficulty}: ${error.message}`);
            console.log('Using mock data for analysis demonstration.');
            questions = mockData[difficulty];
            source = 'MOCK';
        }

        // Analyze questions
        const analysis = analyzeDifficulty(questions);

        results.push({
            difficulty,
            source,
            ...analysis
        });
    }

    generateReport(results);
}

function analyzeDifficulty(questions: any[]) {
    let totalWordCount = 0;
    let totalCharCount = 0;
    let totalOptionLength = 0;

    for (const q of questions) {
        totalWordCount += q.question.split(' ').length;
        totalCharCount += q.question.length;
        for (const opt of q.options) {
            totalOptionLength += opt.length;
        }
    }

    const count = questions.length;
    return {
        avgWordCount: count > 0 ? (totalWordCount / count).toFixed(2) : 0,
        avgCharCount: count > 0 ? (totalCharCount / count).toFixed(2) : 0,
        avgOptionLength: count > 0 ? (totalOptionLength / (count * 4)).toFixed(2) : 0
    };
}

function generateReport(results: any[]) {
    let report = `# Quiz Question Difficulty Calibration Report

## Executive Summary
The quiz generation engine was audited for difficulty calibration. Due to missing API keys, the dynamic generation was simulated using mock data, but the code logic was analyzed.

## Static Code Analysis
The file \`src/ai/flows/adaptive-quiz-engine.ts\` relies entirely on the LLM prompt to determine difficulty:
\`\`\`typescript
const adaptiveQuizPrompt = ai.definePrompt({
  // ...
  prompt: \`... The questions should have a difficulty of "{{difficulty}}". ...\`,
});
\`\`\`
**Finding:** There is no mechanism to verify if the generated questions match the requested difficulty. The "Easy", "Medium", "Hard" labels are subjective to the LLM and may drift over time or vary by topic.

## Dynamic Analysis (Simulated)

| Difficulty | Source | Avg Word Count | Avg Char Count | Avg Option Length |
|------------|--------|----------------|----------------|-------------------|
`;

    for (const res of results) {
        report += `| ${res.difficulty} | ${res.source} | ${res.avgWordCount} | ${res.avgCharCount} | ${res.avgOptionLength} |\n`;
    }

    report += `
## Recommendations
1.  **Implement Few-Shot Prompting**: Provide examples of "Easy", "Medium", and "Hard" questions in the prompt to ground the model's understanding.
2.  **Post-Generation Validation**: Use a lightweight "Judge" model or heuristic (e.g., reading level score) to verify the difficulty of generated questions before showing them to the user.
3.  **Feedback Loop**: Collect student performance data (pass rates) per question to empirically calibrate difficulty labels over time.
`;

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`Report generated at ${REPORT_FILE}`);
}

runAudit().catch(err => console.error(err));
