
import fs from 'fs';
import path from 'path';

const PROVENANCE_PATH = path.join(process.cwd(), 'src/ml/models/provenance_report.json');
const REPORT_PATH = path.join(process.cwd(), 'reports', 'FEATURE_IMPORTANCE_REPORT.md');

function generateReport() {
    let report = `# ML Feature Importance Attribution Transparency\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;

    report += `## Executive Summary\n`;
    report += `This report extracts and visualizes the feature importance rankings from the trained Topic Mastery Prediction Model to ensure model interpretability and transparency.\n\n`;

    if (!fs.existsSync(PROVENANCE_PATH)) {
        report += `⚠️ **Critical Error:** Model provenance report not found at \`${PROVENANCE_PATH}\`.\n`;
        report += `Please run the model training script (\`src/ml/training/train_mastery_model.py\`) to generate this data.\n`;

        // Ensure directory exists
        const reportDir = path.dirname(REPORT_PATH);
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        fs.writeFileSync(REPORT_PATH, report);
        return;
    }

    const provenanceData = JSON.parse(fs.readFileSync(PROVENANCE_PATH, 'utf-8'));
    const featureImportance = provenanceData.metrics?.feature_importance || {};

    const features = Object.entries(featureImportance)
        .map(([feature, importance]) => ({ feature, importance: Number(importance) }))
        .sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance));

    report += `## Model Metadata\n`;
    report += `- **Model Name:** ${provenanceData.model_name}\n`;
    report += `- **Model Type:** ${provenanceData.parameters?.model_type}\n`;
    report += `- **Accuracy:** ${((provenanceData.metrics?.accuracy || 0) * 100).toFixed(2)}%\n`;
    report += `- **Training Timestamp:** ${provenanceData.training_timestamp}\n\n`;

    report += `## Feature Importance Rankings\n`;
    report += `The following table ranks input features by their influence on the model's prediction of topic mastery.\n`;
    report += `- **Positive Importance:** Increases likelihood of mastery.\n`;
    report += `- **Negative Importance:** Decreases likelihood of mastery.\n\n`;

    report += `| Rank | Feature Name | Coefficient (Impact) | Direction |\n`;
    report += `|------|--------------|----------------------|-----------|\n`;

    features.forEach((item, index) => {
        const direction = item.importance > 0 ? 'Positive (+)' : 'Negative (-)';
        report += `| ${index + 1} | \`${item.feature}\` | **${item.importance.toFixed(4)}** | ${direction} |\n`;
    });

    report += `\n## Interpretation Guide\n`;
    report += `1. **High Impact Features:** The top features (Rank 1-3) are the primary drivers of the model's decision. Focus on these for student interventions.\n`;
    report += `2. **Low Impact Features:** Features at the bottom have minimal effect on the outcome.\n`;
    report += `3. **Transparency:** This data allows teachers and students to understand *why* a mastery status was assigned.\n`;

    const reportDir = path.dirname(REPORT_PATH);
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`Report generated at: ${REPORT_PATH}`);
}

try {
    console.log('Starting Feature Importance Extraction...');
    generateReport();
    console.log('Extraction complete.');
} catch (error) {
    console.error('Extraction failed:', error);
    process.exit(1);
}
