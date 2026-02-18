
import { extractMasteryFeatures, extractAttentionFeatures, type StudentHistory, type RawQuizResult, type AttentionFeatures } from '@/ml/features/student_features';
import { predictMastery } from '@/ml/inference/ml-bridge';
import { makeRevisionDecision, makeInterventionDecision } from '@/ai/adk/decision-engine';
import { type MLSignals, type DecisionContext, DecisionAction } from '@/ai/adk/types';
import fs from 'fs';
import path from 'path';

// --- Configuration ---
const TOPIC = "Algebra 101";
const STUDENT_ID_PREFIX = "student_";
const NUM_QUIZZES = 20; // Enough history to establish a pattern
const REFERENCE_DATE = new Date("2023-11-01T12:00:00Z");

// --- Types ---
type ProfileType = 'CONTROL' | 'NIGHT_OWL' | 'WEEKEND_WARRIOR' | 'FAST_GUESSER' | 'SLOW_STEADY' | 'BINGE_LEARNER';

interface SyntheticProfile {
    type: ProfileType;
    description: string;
}

const PROFILES: SyntheticProfile[] = [
    { type: 'CONTROL', description: 'Random times (9am-5pm), avg pace (45s/q), consistent' },
    { type: 'NIGHT_OWL', description: 'Activity concentrated between 10pm-2am' },
    { type: 'WEEKEND_WARRIOR', description: 'Activity only on Saturdays and Sundays' },
    { type: 'FAST_GUESSER', description: 'Time spent per question ~10s' },
    { type: 'SLOW_STEADY', description: 'Time spent per question ~300s' },
    { type: 'BINGE_LEARNER', description: 'Clustered activity (10 quizzes in 1 hour) then 2 weeks gap' },
];

// --- Data Generation ---

function generateSyntheticHistory(profileType: ProfileType): StudentHistory {
    const quizResults: RawQuizResult[] = [];

    // Work backwards from Reference Date to ensure recency is consistent (0 days ago)
    // This isolates the effect of "Pattern" from "Recency"
    let currentDate = new Date(REFERENCE_DATE);

    for (let i = 0; i < NUM_QUIZZES; i++) {
        // 1. Time & Date Logic
        let timestamp = new Date(currentDate);
        let retreatDays = 1;

        switch (profileType) {
            case 'CONTROL':
            case 'FAST_GUESSER':
            case 'SLOW_STEADY':
                // 9 AM to 5 PM
                timestamp.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));
                retreatDays = 1 + Math.floor(Math.random() * 2); // 1-2 days gap
                break;
            case 'NIGHT_OWL':
                // 10 PM to 2 AM (previous night)
                const hour = Math.random() < 0.5 ? 22 + Math.floor(Math.random() * 2) : 0 + Math.floor(Math.random() * 2);
                timestamp.setHours(hour, Math.floor(Math.random() * 60));
                if (hour < 5) timestamp.setDate(timestamp.getDate() + 1); // If 0-2 AM, it belongs to "next day" logically, so we adjust
                retreatDays = 1 + Math.floor(Math.random() * 2);
                break;
            case 'WEEKEND_WARRIOR':
                // Find previous Saturday or Sunday
                while (timestamp.getDay() !== 0 && timestamp.getDay() !== 6) {
                    timestamp.setDate(timestamp.getDate() - 1);
                }
                timestamp.setHours(10 + Math.floor(Math.random() * 6));
                // If Sunday, prev is Sat (-1). If Sat, prev is Sun (-6)
                retreatDays = timestamp.getDay() === 0 ? 1 : 6;
                break;
            case 'BINGE_LEARNER':
                // Clustered: 5 quizzes in one day, then 14 days gap
                // We'll simulate 4 clusters of 5 quizzes
                const clusterIndex = Math.floor(i / 5); // 0, 1, 2, 3
                const withinClusterIndex = i % 5; // 0..4

                // Clusters go backwards. Cluster 0 is most recent (i=0..4)
                const daysAgo = clusterIndex * 14;

                const clusterBaseDate = new Date(REFERENCE_DATE);
                clusterBaseDate.setDate(clusterBaseDate.getDate() - daysAgo);

                timestamp = new Date(clusterBaseDate);
                timestamp.setMinutes(timestamp.getMinutes() - (withinClusterIndex * 10));
                retreatDays = 0; // Handled by cluster logic
                break;
        }

        // Apply date retreat for non-clustered
        if (profileType !== 'BINGE_LEARNER') {
            currentDate.setDate(currentDate.getDate() - retreatDays);
        }

        // 2. Performance Logic (Identical Average Score ~0.7)
        // We'll add some variance but keep mean consistent
        const score = Math.max(0, Math.min(1, 0.7 + (Math.random() * 0.2 - 0.1)));

        // 3. Time Spent Logic
        let timeSpent = 45; // Default avg
        switch (profileType) {
            case 'FAST_GUESSER': timeSpent = 10 + Math.random() * 5; break;
            case 'SLOW_STEADY': timeSpent = 300 + Math.random() * 60; break;
            default: timeSpent = 45 + Math.random() * 15; break;
        }

        quizResults.push({
            topic: TOPIC,
            score,
            timestamp,
            timeSpent,
            questionsAttempted: 10
        });
    }

    return {
        studentId: `${STUDENT_ID_PREFIX}${profileType}`,
        quizResults,
        lastLoginDate: REFERENCE_DATE, // Assuming they just logged in
        registrationDate: new Date("2023-01-01"),
    };
}

// --- Logic ---

function mapAttentionRisk(f: AttentionFeatures): "LOW" | "MEDIUM" | "HIGH" {
    // Heuristic mapping
    if (f.days_inactive > 14) return "HIGH";
    if (f.performance_trend === -1) return "MEDIUM"; // Declining performance
    if (f.days_inactive > 7) return "MEDIUM";
    return "LOW";
}

// --- LLM Simulation ---

function countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
}

function calculateFleschKincaid(text: string): number {
    const words = text.trim().split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
    const syllables = text.split(/\s+/).reduce((sum, word) => sum + countSyllables(word), 0);

    if (words === 0 || sentences === 0) return 0;
    return 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
}

function simulateLLMResponse(context: any): string {
    const { strategy, difficulty, tone } = context;

    // Base complexity determined by difficulty/strategy
    if (strategy === 'SHORT_FORM' || difficulty === 'BASIC') {
        return "To solve this, add five to both sides. Then divide by two. The answer is three. Good job.";
    }

    if (strategy === 'INTERACTIVE') {
        return "Can you identify the variable? Let's try isolating x by subtracting the constant. What do you get?";
    }

    if (strategy === 'MOTIVATIONAL') {
        return "You are doing great! Algebra can be tricky, but practicing these steps will build your confidence. Keep going!";
    }

    if (difficulty === 'ADVANCED' || strategy === 'CHALLENGE') {
        return "Analyze the polynomial's discriminant to determine the nature of its roots. Verify the complex conjugate theorem applies.";
    }

    // Default (DEEP_DIVE / INTERMEDIATE)
    return "The linear equation represents a straight line on the Cartesian coordinate system. The slope indicates the rate of change between variables.";
}

async function analyze() {
    console.log("Starting Fairness & Bias Cascade Analysis...");
    console.log("Generating synthetic cohorts...");

    const results = [];

    for (const profile of PROFILES) {
        console.log(`Processing profile: ${profile.type}`);
        const history = generateSyntheticHistory(profile.type);

        // 1. Feature Extraction
        const masteryFeatures = extractMasteryFeatures(TOPIC, history, REFERENCE_DATE);
        const attentionFeatures = extractAttentionFeatures(history, REFERENCE_DATE);

        // 2. ML Prediction
        let masteryProbability = 0;
        try {
            const prediction = await predictMastery(masteryFeatures);
            masteryProbability = prediction.mastery_probability;
        } catch (e) {
            console.error(`ML Prediction failed for ${profile.type}:`, e);
        }

        // 3. ADK Decision
        const mlSignals: MLSignals = {
            mastery_probability: masteryProbability,
            confidence: 0.8, // Mock confidence
            days_since_last_revision: masteryFeatures.days_since_last_revision,
            attempts_count: masteryFeatures.attempts_per_topic,
            attention_risk: mapAttentionRisk(attentionFeatures),
            // Mock optional signals
            days_until_forget: Math.max(0, 14 - masteryFeatures.days_since_last_revision),
            dropout_probability: attentionFeatures.days_inactive > 14 ? 0.7 : 0.1,
        };

        const decisionContext: DecisionContext = {
            studentId: history.studentId!,
            topic: TOPIC,
            currentDate: REFERENCE_DATE,
            mlSignals,
            daysUntilExam: 30, // Far from exam to avoid cramming override
        };

        const revisionDecision = makeRevisionDecision(decisionContext);
        const interventionDecision = makeInterventionDecision(decisionContext);

        // Simulate LLM output and analyze readability
        const simulatedText = simulateLLMResponse(revisionDecision.llmContext);
        const gradeLevel = calculateFleschKincaid(simulatedText);

        results.push({
            profile: profile.type,
            avg_score: masteryFeatures.avg_quiz_score.toFixed(2),
            time_spent: masteryFeatures.time_spent_per_question.toFixed(1),
            days_inactive: attentionFeatures.days_inactive,
            mastery_prob: masteryProbability.toFixed(3),
            attention_risk: mlSignals.attention_risk,
            action: revisionDecision.action,
            priority: revisionDecision.priority,
            tone: revisionDecision.llmContext.tone,
            difficulty: revisionDecision.llmContext.difficulty,
            grade_level: gradeLevel.toFixed(1),
            intervention: interventionDecision ? interventionDecision.severity : "NONE"
        });
    }

    // --- Report Generation ---
    generateReport(results);
}

function generateReport(results: any[]) {
    const tableHeader = `| Profile | Avg Score | Time/Q (s) | Inactive (days) | Mastery Prob | Attn Risk | Action | Priority | Tone | Difficulty | Grade Level | Intervention |\n|---|---|---|---|---|---|---|---|---|---|---|---|`;
    const tableRows = results.map(r => `| ${r.profile} | ${r.avg_score} | ${r.time_spent} | ${r.days_inactive} | **${r.mastery_prob}** | ${r.attention_risk} | ${r.action} | ${r.priority} | ${r.tone} | ${r.difficulty} | ${r.grade_level} | ${r.intervention} |`).join('\n');

    const disparities = detectDisparities(results);

    const reportContent = `
# Fairness & Bias Cascade Report

**Date:** ${new Date().toISOString()}
**Topic:** ${TOPIC}
**Method:** Counterfactual Fairness Testing (Synthetic Cohorts)

## 1. Cohort Analysis

${tableHeader}
${tableRows}

## 2. Disparity Analysis

${disparities}

## 3. Findings & Recommendations

### ML Model Fairness
- **Mastery Prediction:** Evaluated for stability across behavioral patterns.
- **Time Sensitivity:** Checked if "Fast Guesser" or "Slow Steady" are unfairly penalized.
- **Recency Bias:** Checked if "Binge Learner" or "Night Owl" patterns affect mastery score.

### ADK Decision Logic
- **Attention Risk:** Validated if risk flags are applied consistently.
- **Intervention:** Checked if interventions are suggested equitably.

### Recommendations
1. **Model Retraining:** If significant mastery drift (>5%) exists for same-score profiles, retrain with augmented behavioral data.
2. **Feature Engineering:** Review \`time_spent_per_question\` weighting if "Slow Steady" is penalized.
3. **ADK Policy:** Ensure "Night Owls" are not flagged as "High Risk" solely due to timestamp patterns.
`;

    fs.writeFileSync('FAIRNESS_BIAS_CASCADE_REPORT.md', reportContent);
    console.log("Report generated: FAIRNESS_BIAS_CASCADE_REPORT.md");
    process.exit(0);
}

function detectDisparities(results: any[]): string {
    const control = results.find(r => r.profile === 'CONTROL');
    if (!control) return "No Control profile found.";

    let output = "";

    // Mastery Disparity
    output += "### Outcome Disparity (Mastery)\n";
    results.forEach(r => {
        const diff = Math.abs(parseFloat(r.mastery_prob) - parseFloat(control.mastery_prob));
        if (diff > 0.05) {
            output += `- **FLAG:** ${r.profile} has mastery deviation of ${(diff * 100).toFixed(1)}% vs Control.\n`;
        }
    });
    if (output === "### Outcome Disparity (Mastery)\n") output += "- No significant mastery disparities detected.\n";

    // Risk Disparity
    output += "\n### Attention Risk Disparity\n";
    results.forEach(r => {
        if (r.attention_risk !== control.attention_risk) {
            output += `- **NOTE:** ${r.profile} flagged as **${r.attention_risk}** (Control: ${control.attention_risk}). Check if justified.\n`;
        }
    });

    // Reading Level Disparity
    output += "\n### Explanation Quality Disparity\n";
    results.forEach(r => {
        const diff = Math.abs(parseFloat(r.grade_level) - parseFloat(control.grade_level));
        if (diff > 2) {
             output += `- **FLAG:** ${r.profile} receives content at Grade ${r.grade_level} (Control: Grade ${control.grade_level}). Diff: ${diff.toFixed(1)} grades.\n`;
        }
    });

    return output;
}

// Run
analyze().catch(console.error);
