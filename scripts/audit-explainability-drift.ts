
import fs from 'fs';
import path from 'path';

const LEARNING_STATE_CARD_PATH = 'src/components/LearningStateCard.tsx';
const DECISION_ENGINE_PATH = 'src/ai/adk/decision-engine.ts';
const REPORT_PATH = 'reports/EXPLAINABILITY_DRIFT_REPORT.md';

function extractTooltipLogic(content: string) {
    const tooltipMatches = [];
    const tooltipRegex = /tooltipText\s*=\s*useMemo\(\(\)\s*=>\s*{([\s\S]*?)},/g;
    let match;
    while ((match = tooltipRegex.exec(content)) !== null) {
        const body = match[1];
        // naive extraction of strings and conditions
        const lines = body.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        tooltipMatches.push(...lines);
    }
    return tooltipMatches;
}

function extractADKRules(content: string) {
    const rules = [];
    // Match comments starting with POLICY RULE
    const ruleRegex = /\/\/\s*POLICY RULE\s*(\d+):\s*(.*)/g;
    let match;
    while ((match = ruleRegex.exec(content)) !== null) {
        rules.push({
            id: match[1],
            description: match[2],
            // naive check for next line condition
            // In a real parser we'd look for the `if` statement following the comment
        });
    }

    // Also extract raw mastery checks
    const masteryRegex = /mastery_probability\s*([<>=]+)\s*([\d.]+)/g;
    const masteryChecks = [];
    while ((match = masteryRegex.exec(content)) !== null) {
        masteryChecks.push(`${match[1]} ${match[2]}`);
    }

    return { rules, masteryChecks };
}

async function auditExplainabilityDrift() {
    console.log('Starting Explainability Drift Audit...');

    if (!fs.existsSync(LEARNING_STATE_CARD_PATH) || !fs.existsSync(DECISION_ENGINE_PATH)) {
        console.error('Required files not found.');
        return;
    }

    const cardContent = fs.readFileSync(LEARNING_STATE_CARD_PATH, 'utf-8');
    const adkContent = fs.readFileSync(DECISION_ENGINE_PATH, 'utf-8');

    const tooltipLogic = extractTooltipLogic(cardContent);
    const adkData = extractADKRules(adkContent);

    let report = `# Explainability Tooltip Content Drift Analysis\n\n`;
    report += `**Date:** ${new Date().toISOString()}\n\n`;

    report += `## 1. Tooltip Logic (UI)\n`;
    report += `Extracted logic from \`${LEARNING_STATE_CARD_PATH}\`:\n`;
    tooltipLogic.forEach(line => {
        report += `- \`${line}\`\n`;
    });
    report += `\n`;

    report += `## 2. ADK Decision Rules (Backend)\n`;
    report += `Extracted rules from \`${DECISION_ENGINE_PATH}\`:\n`;
    adkData.rules.forEach(rule => {
        report += `- **Rule ${rule.id}**: ${rule.description}\n`;
    });
    report += `\n`;

    report += `### Mastery Thresholds in ADK\n`;
    const uniqueChecks = [...new Set(adkData.masteryChecks)];
    uniqueChecks.forEach(check => {
        report += `- \`mastery_probability ${check}\`\n`;
    });
    report += `\n`;

    report += `## 3. Drift Analysis\n`;

    // Automatic Drift Detection
    const has06inUI = tooltipLogic.some(l => l.includes('0.6'));
    const has04inADK = adkData.masteryChecks.some(c => c.includes('0.4'));

    if (has06inUI && has04inADK) {
         report += `### 🔴 Critical Granularity Loss Detected\n`;
         report += `- **Observation**: The UI tooltip simplifies logic to a single check (\`< 0.6\`) for "below optimal".\n`;
         report += `- **Reality**: The ADK distinguishes between **CRITICAL** (\`< 0.4\`) and **SCHEDULED** (\`0.4 - 0.6\`).\n`;
         report += `- **Impact**: Students with critical mastery gaps (< 0.4) receive the same generic "below optimal" message as those needing routine practice.\n`;
         report += `- **Recommendation**: Update \`LearningStateCard.tsx\` to include a specific case for \`< 0.4\` (Urgent Revision).\n`;
    } else {
        report += `- No major threshold drift detected (heuristic check).\n`;
    }

    // Check for "Reasoning" drift
    const uiMentionsReasoning = tooltipLogic.some(l => l.toLowerCase().includes('reasoning') || l.toLowerCase().includes('adk'));
    if (!uiMentionsReasoning) {
         report += `### ⚠️ Explanation Depth Gap\n`;
         report += `- **Observation**: The tooltip text appears static ("Based on your recent quiz performance...").\n`;
         report += `- **Reality**: The ADK generates dynamic \`reasoning\` strings (e.g., "Exam imminent", "Low mastery with attention challenges").\n`;
         report += `- **Impact**: Users miss out on the specific "Why" behind the AI's assessment.\n`;
         report += `- **Recommendation**: Inject the \`intelligence.reasoning\` or \`intelligence.adkDecision\` directly into the tooltip content.\n`;
    }

    // Ensure reports directory exists
    if (!fs.existsSync('reports')) {
        fs.mkdirSync('reports');
    }

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`Report generated at ${REPORT_PATH}`);
}

auditExplainabilityDrift();
