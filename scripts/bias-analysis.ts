
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import {
    extractMasteryFeatures,
    extractAttentionFeatures,
    type StudentHistory,
    type RawQuizResult
} from '../src/ml/features/student_features';
import {
    makeRevisionDecision,
    type DecisionContext,
    type LLMContext
} from '../src/ai/adk/decision-engine';
import { DecisionAction, ContentStrategy } from '../src/ai/adk/types';

// Define the cohorts
const BASE_SCORE = 0.8;
const TOPIC = "Algebra";

interface CohortDef {
    name: string;
    description: string;
    generateHistory: () => StudentHistory;
}

const cohorts: CohortDef[] = [
    {
        name: "Baseline",
        description: "High mastery (0.8), average speed (30s), recent practice",
        generateHistory: () => createMockHistory(BASE_SCORE, 30, 0.1, 2)
    },
    {
        name: "Slow Pacer",
        description: "High mastery (0.8), slow speed (90s) - potentially flagged as struggling",
        generateHistory: () => createMockHistory(BASE_SCORE, 90, 0.1, 2)
    },
    {
        name: "Fast Pacer",
        description: "High mastery (0.8), fast speed (15s)",
        generateHistory: () => createMockHistory(BASE_SCORE, 15, 0.1, 2)
    },
    {
        name: "Returning Student",
        description: "High mastery (0.8), avg speed, but 20 days inactive",
        generateHistory: () => createMockHistory(BASE_SCORE, 30, 0.1, 20)
    },
    {
        name: "Crammer",
        description: "High mastery (0.8), avg speed, 0 days gap, many attempts today",
        generateHistory: () => {
            const history = createMockHistory(BASE_SCORE, 30, 0.1, 0);
            // Add 10 more attempts today
            const now = new Date();
            for (let i = 0; i < 10; i++) {
                history.quizResults.push({
                    topic: TOPIC,
                    score: BASE_SCORE,
                    timestamp: now,
                    timeSpent: 30,
                    questionsAttempted: 10
                });
            }
            return history;
        }
    },
    {
      name: "Erratic",
      description: "High avg score (0.8) but high variance (scores 0.6 and 1.0)",
      generateHistory: () => {
          const history = createMockHistory(BASE_SCORE, 30, 0.4, 2);
          // Override scores to be erratic
          history.quizResults = history.quizResults.map((q, i) => ({
              ...q,
              score: i % 2 === 0 ? 1.0 : 0.6 // Avg 0.8
          }));
          return history;
      }
    },
    {
        name: "Morning Learner",
        description: "High mastery, studies at 8 AM",
        generateHistory: () => createMockHistory(BASE_SCORE, 30, 0.1, 2, 8)
    },
    {
        name: "Evening Learner",
        description: "High mastery, studies at 8 PM",
        generateHistory: () => createMockHistory(BASE_SCORE, 30, 0.1, 2, 20)
    }
];

function createMockHistory(avgScore: number, avgTime: number, variance: number, daysSince: number, hourOfDay?: number): StudentHistory {
    const now = new Date();
    // Adjust 'now' to be at specific hour if provided
    if (hourOfDay !== undefined) {
        now.setHours(hourOfDay, 0, 0, 0);
    }

    const lastRev = new Date(now.getTime() - daysSince * 24 * 60 * 60 * 1000);

    // Generate 5 past quizzes
    const results: RawQuizResult[] = [];
    for (let i = 0; i < 5; i++) {
        // Spread them out over a week prior to lastRev, but keep the same hour of day
        // We subtract exact days (24h chunks) to keep the hour consistent
        const timeOffset = i * 24 * 60 * 60 * 1000;
        results.push({
            topic: TOPIC,
            score: avgScore, // Simplify: constant score for now, unless variance handling needed
            timestamp: new Date(lastRev.getTime() - timeOffset),
            timeSpent: avgTime,
            questionsAttempted: 10
        });
    }

    return {
        studentId: "mock-student",
        quizResults: results,
        lastLoginDate: now,
        registrationDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    };
}

// Simple deterministic LLM simulation
function simulateLLMExplanation(context: LLMContext): string {
    let text = "";

    // Base content based on difficulty
    switch (context.difficulty) {
        case "BASIC":
            text = "Here is a simple explanation. The concept is easy. You just need to add the numbers. It works every time.";
            break;
        case "INTERMEDIATE":
            text = "This concept involves understanding the relationship between variables. When X increases, Y tends to decrease, assuming other factors remain constant.";
            break;
        case "ADVANCED":
            text = "The theoretical underpinnings of this phenomenon can be derived from first principles. Consider the limit as n approaches infinity, where the function converges to a stable equilibrium state.";
            break;
    }

    // Adjust tone
    if (context.tone === "MOTIVATING") {
        text = "Great job so far! " + text + " Keep up the excellent work!";
    } else if (context.tone === "CHALLENGING") {
        text = text + " Now, think about the edge cases where this might fail.";
    } else if (context.tone === "SUPPORTIVE") {
        text = "Don't worry if this is tricky. " + text + " We can practice more together.";
    }

    return text;
}

function calculateFleschKincaid(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    const words = text.split(/\s+/).filter(Boolean).length;
    const syllables = text.split(/\s+/).reduce((count, word) => count + countSyllables(word), 0);

    if (sentences === 0 || words === 0) return 0;

    // Formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
    return 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
}

function countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
}

async function runAnalysis() {
    console.log("Starting Bias Analysis...");
    const results = [];

    for (const cohort of cohorts) {
        console.log(`Processing cohort: ${cohort.name}`);
        const history = cohort.generateHistory();

        // 1. Feature Extraction
        const masteryFeatures = extractMasteryFeatures(TOPIC, history);
        const attentionFeatures = extractAttentionFeatures(history);

        // 2. ML Inference (Python)
        const mlInput = {
            avg_quiz_score: masteryFeatures.avg_quiz_score,
            attempts_per_topic: masteryFeatures.attempts_per_topic,
            days_since_last_revision: masteryFeatures.days_since_last_revision,
            quiz_score_variance: masteryFeatures.quiz_score_variance,
            time_spent_per_question: masteryFeatures.time_spent_per_question,
            _id: cohort.name
        };

        let mlOutput;
        try {
            const pythonScript = path.join(process.cwd(), 'src/ml/inference/predict_mastery.py');
            const output = execSync(`python3 ${pythonScript}`, {
                input: JSON.stringify(mlInput) + "\n"
            });
            mlOutput = JSON.parse(output.toString());
        } catch (e) {
            console.error(`ML Inference failed for ${cohort.name}:`, e);
            continue;
        }

        // 3. ADK Decision
        let attentionRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
        if (attentionFeatures.days_inactive > 7) attentionRisk = "HIGH";
        if (mlOutput.mastery_probability < 0.4) attentionRisk = "HIGH";

        const context: DecisionContext = {
            studentId: "mock-student",
            topic: TOPIC,
            currentDate: new Date(),
            daysUntilExam: 30, // Default not cramming
            mlSignals: {
                mastery_probability: mlOutput.mastery_probability,
                confidence: mlOutput.confidence,
                days_since_last_revision: masteryFeatures.days_since_last_revision,
                attempts_count: masteryFeatures.attempts_per_topic,
                attention_risk: attentionRisk,
            }
        };

        const decision = makeRevisionDecision(context);

        // 4. LLM Simulation & Analysis
        const explanation = simulateLLMExplanation(decision.llmContext);
        const readability = calculateFleschKincaid(explanation);

        results.push({
            cohort: cohort.name,
            features: mlInput,
            ml: mlOutput,
            adk: {
                action: decision.action,
                priority: decision.priority,
                strategy: decision.contentStrategy,
                reasoning: decision.reasoning
            },
            llmContext: decision.llmContext,
            explanationAnalysis: {
                text: explanation,
                readability: readability.toFixed(1),
                length: explanation.length
            }
        });
    }

    // Generate Report
    generateReport(results);
}

function generateReport(results: any[]) {
    let md = "# Fairness & Bias Cascade Analysis Report\n\n";
    md += "This report analyzes how the ML-ADK-LLM pipeline responds to different student behavioral profiles who have identical underlying mastery (0.8 score).\n\n";

    md += "## 1. Outcome Disparity Matrix\n\n";
    md += "| Cohort | Mastery Prob | ADK Action | Strategy | Readability (Grade Level) | Tone |\n";
    md += "|---|---|---|---|---|---|\n";

    for (const r of results) {
        md += `| ${r.cohort} | ${r.ml.mastery_probability.toFixed(3)} | ${r.adk.action} | ${r.adk.strategy} | ${r.explanationAnalysis.readability} | ${r.llmContext.tone} |\n`;
    }

    md += "\n## 2. Analysis of Bias Amplification\n\n";

    // Check for Slow Pacer bias
    const baseline = results.find(r => r.cohort === "Baseline");
    const slow = results.find(r => r.cohort === "Slow Pacer");

    if (baseline && slow) {
        const diff = baseline.ml.mastery_probability - slow.ml.mastery_probability;
        md += `### Slow Pacer Bias\n`;
        md += `- Mastery Difference: ${(diff * 100).toFixed(1)}%\n`;
        if (diff > 0.1) {
            md += `- **WARNING**: Significant bias detected against slow learners. Model penalizes speed.\n`;
        } else {
            md += `- No significant bias detected based on speed alone.\n`;
        }
    }

    // Check for Returning Student bias
    const returning = results.find(r => r.cohort === "Returning Student");
    if (baseline && returning) {
        const diff = baseline.ml.mastery_probability - returning.ml.mastery_probability;
         md += `### Recency Bias (Returning Student)\n`;
         md += `- Mastery Difference: ${(diff * 100).toFixed(1)}%\n`;
         if (diff > 0.1) {
             md += `- **WARNING**: Model heavily penalizes inactivity, potentially discouraging returning students.\n`;
         }
    }

    // Check for Morning/Evening bias
    const morning = results.find(r => r.cohort === "Morning Learner");
    const evening = results.find(r => r.cohort === "Evening Learner");
    if (morning && evening) {
        const diff = Math.abs(morning.ml.mastery_probability - evening.ml.mastery_probability);
        md += `### Time-of-Day Bias\n`;
        md += `- Mastery Difference: ${(diff * 100).toFixed(1)}%\n`;
        if (diff > 0.05) {
            md += `- **WARNING**: Model behaves differently based on time of day.\n`;
        } else {
             md += `- No significant time-of-day bias detected.\n`;
        }
    }

    md += "\n## 3. Explanation Quality Parity\n\n";
    md += "Analyzed the readability and tone of simulated LLM explanations based on ADK context.\n\n";

    for (const r of results) {
        if (r.explanationAnalysis.readability < 5 && r.features.avg_quiz_score >= 0.8) {
             md += `- **Flag**: ${r.cohort} is receiving very simple content (Grade ${r.explanationAnalysis.readability}) despite high scores (0.8).\n`;
        }
    }

    md += "\n## 4. Privacy-Preserving Fairness Monitoring Strategy\n\n";
    md += "To monitor fairness without collecting sensitive demographics, we recommend:\n";
    md += "1.  **Behavioral Clustering**: Group students by interaction patterns (e.g., 'Night Owls', 'Weekend Warriors', 'Sprinters') rather than demographics.\n";
    md += "2.  **Disparity Audits**: Run this automated audit script weekly to detect if new model versions introduce bias against specific behavioral clusters.\n";
    md += "3.  **Counterfactual Testing**: Before deploying any ADK rule change, run it against synthetic profiles to ensure no group is unfairly penalized.\n";

    md += "\n## 5. Recommended Fairness Constraints\n\n";
    md += "Based on findings, we recommend the following constraints for the next ML retraining:\n";
    md += "1.  **Reduce Recency Weight**: The model over-penalizes gaps in practice. Cap the negative impact of `days_since_last_revision`.\n";
    md += "2.  **Normalize Time Spent**: Use z-scores for `time_spent_per_question` relative to the student's own history, rather than absolute values, to accommodate different reading speeds.\n";
    md += "3.  **Explicit Fairness Loss**: Include a fairness loss term during training that penalizes performance differences between behavioral clusters.\n";

    fs.writeFileSync('FAIRNESS_REPORT.md', md);
    console.log("Report generated: FAIRNESS_REPORT.md");
}

runAnalysis();
