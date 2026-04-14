
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CSV_PATH = 'src/ml/training/training_data.csv';
const GENERATOR_PATH = 'src/ml/training/generate_data.py';

interface StudentData {
    avg_quiz_score: number;
    attempts_per_topic: number;
    days_since_last_revision: number;
    quiz_score_variance: number;
    time_spent_per_question: number;
    mastered: number;
}

// Re-implementation of Python logic for fallback
function generateMockData(count: number): StudentData[] {
    const data: StudentData[] = [];
    for (let i = 0; i < count; i++) {
        // Ability: Beta(5, 5) approximation
        // Box-Muller transform for normal, then clip/scale for beta-like shape or just simple normal
        // Let's use simple normal centered at 0.5 clipped to 0-1
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
        let ability = num / 5.0 + 0.5; // Rescale to be around 0.5
        ability = Math.max(0, Math.min(1, ability));

        let avg_quiz_score = ability + (Math.random() * 0.2 - 0.1);
        avg_quiz_score = Math.max(0, Math.min(1, avg_quiz_score));

        let attempts_per_topic;
        if (ability < 0.3) attempts_per_topic = Math.floor(Math.random() * 4) + 1;
        else if (ability < 0.7) attempts_per_topic = Math.floor(Math.random() * 6) + 4;
        else attempts_per_topic = Math.floor(Math.random() * 3) + 1;

        let time_spent_per_question = 60 - (ability * 30) + (Math.random() * 30 - 15);
        time_spent_per_question = Math.max(10, Math.min(120, time_spent_per_question));

        let quiz_score_variance = (1 - ability) * 0.2 + (Math.random() * 0.1 - 0.05);
        quiz_score_variance = Math.max(0, Math.min(0.5, quiz_score_variance));

        const days_since_last_revision = Math.floor(Math.random() * 30);

        let mastery_prob = avg_quiz_score;
        mastery_prob -= quiz_score_variance * 0.5;
        if (days_since_last_revision > 14) mastery_prob -= 0.2;
        if (avg_quiz_score < 0.5) mastery_prob = 0;

        const mastered = mastery_prob > 0.65 ? 1 : 0;

        data.push({
            avg_quiz_score: Number(avg_quiz_score.toFixed(2)),
            attempts_per_topic,
            days_since_last_revision,
            quiz_score_variance: Number(quiz_score_variance.toFixed(2)),
            time_spent_per_question: Number(time_spent_per_question.toFixed(1)),
            mastered
        });
    }
    return data;
}

function parseCSV(content: string): StudentData[] {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',');
    const data: StudentData[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length !== headers.length) continue;

        const row: any = {};
        headers.forEach((h, idx) => {
            row[h.trim()] = Number(values[idx]);
        });
        data.push(row as StudentData);
    }
    return data;
}

function analyzeData(data: StudentData[]) {
    const total = data.length;
    const masteredCount = data.filter(d => d.mastered === 1).length;
    const notMasteredCount = total - masteredCount;

    // Detect anomalies
    // 1. High score but not mastered
    const highScoreFail = data.filter(d => d.avg_quiz_score > 0.9 && d.mastered === 0).length;
    // 2. Low score but mastered
    const lowScorePass = data.filter(d => d.avg_quiz_score < 0.5 && d.mastered === 1).length;
    // 3. Negative time (should be impossible based on logic, but good to check)
    const negativeTime = data.filter(d => d.time_spent_per_question < 0).length;

    return {
        total,
        masteredCount,
        notMasteredCount,
        masteredPct: (masteredCount / total * 100).toFixed(1),
        notMasteredPct: (notMasteredCount / total * 100).toFixed(1),
        highScoreFail,
        lowScorePass,
        negativeTime
    };
}

async function main() {
    console.log('Starting Data Realism Audit...');
    let data: StudentData[] = [];
    let source = '';

    // Try running Python script
    try {
        console.log('Attempting to run Python generator...');
        execSync(`python ${GENERATOR_PATH}`, { stdio: 'ignore' });
        if (fs.existsSync(CSV_PATH)) {
            console.log('Python script execution successful. Reading CSV...');
            const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
            data = parseCSV(csvContent);
            source = 'Python Generator (Actual)';
        } else {
            throw new Error('CSV not found after execution');
        }
    } catch (e) {
        console.warn('Python execution failed or CSV missing. Falling back to TypeScript simulation.');
        // Fallback
        data = generateMockData(2000);
        source = 'TypeScript Simulation (Fallback)';
    }

    const analysis = analyzeData(data);

    // Generate Report
    const reportPath = 'DATA_REALISM_REPORT.md';
    let reportContent = '# Synthetic Data Generation Realism Audit\n\n';
    reportContent += `**Date:** ${new Date().toISOString()}\n\n`;
    reportContent += `**Data Source:** ${source}\n`;
    reportContent += `**Sample Size:** ${analysis.total}\n\n`;

    reportContent += '## Distribution Analysis\n';
    reportContent += `- **Mastered:** ${analysis.masteredCount} (${analysis.masteredPct}%)\n`;
    reportContent += `- **Not Mastered:** ${analysis.notMasteredCount} (${analysis.notMasteredPct}%)\n`;

    // Ideal balance is roughly 50/50 or 60/40. If 90/10, model will be biased.
    const isBalanced = Math.abs(parseFloat(analysis.masteredPct) - 50) < 20;
    reportContent += `- **Balance Check:** ${isBalanced ? '✅ Balanced' : '⚠️ Imbalanced'}\n\n`;

    reportContent += '## Anomaly Detection\n';
    reportContent += `1. **High Score (>90%) but Not Mastered:** ${analysis.highScoreFail} cases.\n`;
    if (analysis.highScoreFail > 0) {
        reportContent += `   - *Insight:* This indicates that variance or time-since-revision penalties are too harsh. A student with 90% average should almost always be considered mastered.\n`;
    }

    reportContent += `2. **Low Score (<50%) but Mastered:** ${analysis.lowScorePass} cases.\n`;
    if (analysis.lowScorePass > 0) {
        reportContent += `   - *Insight:* This is a critical error. Students failing quizzes should not be marked as mastered.\n`;
    }

    reportContent += `3. **Invalid Data (Negative Time):** ${analysis.negativeTime} cases.\n\n`;

    reportContent += '## Recommendations\n';
    reportContent += '1. **Refine Mastery Logic:** Reduce the penalty for `days_since_last_revision` if the `avg_quiz_score` is very high (>0.9).\n';
    reportContent += '2. **Edge Case Coverage:** Add more "crammer" profiles (high attempts, low time, high variance) to test robustness.\n';
    reportContent += '3. **Realistic Noise:** The current variance model assumes linear correlation with ability. In reality, even high-ability students have "bad days" (outliers).\n';

    fs.writeFileSync(reportPath, reportContent);
    console.log(`Report generated at ${reportPath}`);
}

main();
