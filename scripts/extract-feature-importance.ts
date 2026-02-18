
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const REPORT_PATH = path.join(process.cwd(), 'reports', 'FEATURE_IMPORTANCE_REPORT.md');
const PROVENANCE_PATH = path.join(SRC_DIR, 'ml/models/provenance_report.json');

function main() {
    console.log("Starting Extraction of Feature Importance...");

    if (!fs.existsSync(PROVENANCE_PATH)) {
        console.error(`Provenance report not found at ${PROVENANCE_PATH}`);
        fs.writeFileSync(REPORT_PATH, `# ML Feature Importance Report\n\n**Error:** Model provenance report missing. Train the model first.`);
        return;
    }

    const provenance = JSON.parse(fs.readFileSync(PROVENANCE_PATH, 'utf-8'));
    const importance = provenance.metrics?.feature_importance;

    if (!importance) {
        console.error("Feature importance data missing in provenance report.");
        return;
    }

    // Sort features by absolute importance
    const sortedFeatures = Object.entries(importance)
        .sort(([, a], [, b]) => Math.abs(b as number) - Math.abs(a as number));

    let report = `# ML Feature Importance Attribution Transparency\n\n`;
    report += `**Date:** ${new Date().toISOString()}\n`;
    report += `**Model Version:** ${provenance.version}\n`;
    report += `**Training Timestamp:** ${provenance.training_timestamp}\n\n`;

    report += `## 1. Feature Ranking\n`;
    report += `The following table ranks the input features used by the Topic Mastery Model based on their impact on the prediction (Logistic Regression Coefficients).\n\n`;

    report += `| Rank | Feature Name | Coefficient | Impact Direction | Interpretation |\n`;
    report += `|------|--------------|-------------|------------------|----------------|\n`;

    sortedFeatures.forEach(([feature, coef], index) => {
        const val = coef as number;
        const direction = val > 0 ? "Positive (+)" : "Negative (-)";
        const impact = val > 0 ? "Increases Mastery Probability" : "Decreases Mastery Probability";

        let interpretation = "";
        switch(feature) {
            case "avg_quiz_score": interpretation = "Higher quiz scores strongly indicate mastery."; break;
            case "quiz_score_variance": interpretation = "Consistency matters; erratic performance reduces confidence."; break;
            case "days_since_last_revision": interpretation = "Recent practice is better; long gaps reduce mastery."; break;
            case "attempts_per_topic": interpretation = "More attempts without high scores might indicate struggle."; break;
            case "time_spent_per_question": interpretation = "Very fast or very slow answers can be negative signals."; break;
            default: interpretation = "Standard behavioral metric.";
        }

        report += `| ${index + 1} | \`${feature}\` | \`${val.toFixed(4)}\` | ${direction} | ${interpretation} |\n`;
    });

    report += `\n## 2. Model Introspection\n`;
    report += `- **Top Predictor:** \`${sortedFeatures[0][0]}\` (Coef: ${(sortedFeatures[0][1] as number).toFixed(2)}) is the dominant factor.\n`;
    if (sortedFeatures.length > 1) {
        report += `- **Secondary Factor:** \`${sortedFeatures[1][0]}\` also plays a significant role.\n`;
    }

    report += `\n## 3. Transparency Statement\n`;
    report += `This model uses a linear architecture (Logistic Regression), making these coefficients directly interpretable as the change in log-odds of mastery for a unit increase in the feature value.\n`;

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`Report generated at: ${REPORT_PATH}`);
}

main();
