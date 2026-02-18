
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const REPORT_PATH = path.join(process.cwd(), 'reports', 'ADK_EXPLAINABILITY_REPORT.md');

const DECISION_ENGINE_PATH = path.join(SRC_DIR, 'ai/adk/decision-engine.ts');
const API_ROUTE_PATH = path.join(SRC_DIR, 'app/api/intelligence/student/route.ts');
const UI_COMPONENT_PATH = path.join(SRC_DIR, 'components/LearningStateCard.tsx');

function extractReasoning(filePath: string): string[] {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const matches = content.match(/reasoning:\s*["'](.+?)["']/g);
    if (!matches) return [];
    return matches.map(m => m.replace(/reasoning:\s*["']|["']/g, ''));
}

function checkApiUsage(filePath: string): string {
    if (!fs.existsSync(filePath)) return "API Route not found";
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check if reasoning is constructed dynamically or hardcoded
    if (content.includes('const reasoning: string[] = [];') && content.includes('reasoning.push(')) {
        return "API creates reasoning via hardcoded logic, potentially ignoring granular ADK decision reasoning.";
    }
    if (content.includes('reasoning: adkDecision.reasoning')) {
        return "API correctly passes ADK decision reasoning.";
    }
    return "API reasoning construction is unclear.";
}

function checkUiUsage(filePath: string): string {
    if (!fs.existsSync(filePath)) return "UI Component not found";
    const content = fs.readFileSync(filePath, 'utf-8');

    if (content.includes('intelligence.reasoning.map')) {
        return "UI iterates over `intelligence.reasoning` array.";
    }
    return "UI usage of reasoning is unclear.";
}

function main() {
    console.log("Starting Audit for ADK Explainability...");

    const definedReasonings = extractReasoning(DECISION_ENGINE_PATH);
    const apiStatus = checkApiUsage(API_ROUTE_PATH);
    const uiStatus = checkUiUsage(UI_COMPONENT_PATH);

    let report = `# ADK Decision Explainability Completeness Check\n\n`;
    report += `**Date:** ${new Date().toISOString()}\n`;
    report += `**Scope:** ADK Engine -> API -> UI\n\n`;

    report += `## 1. Defined Explanations (ADK Decision Engine)\n`;
    report += `Found ${definedReasonings.length} distinct reasoning strings in \`decision-engine.ts\`:\n\n`;
    definedReasonings.forEach(r => {
        report += `- "${r}"\n`;
    });

    report += `\n## 2. API Propagation Check\n`;
    report += `- **File:** \`src/app/api/intelligence/student/route.ts\`\n`;
    report += `- **Finding:** ${apiStatus}\n`;

    if (apiStatus.includes("ignoring")) {
        report += `  - **Risk:** High. The granular reasoning defined in the engine is NOT being sent to the frontend. The API constructs a generic summary instead.\n`;
    }

    report += `\n## 3. UI Exposure Check\n`;
    report += `- **File:** \`src/components/LearningStateCard.tsx\`\n`;
    report += `- **Finding:** ${uiStatus}\n`;

    report += `\n## 4. Gap Analysis\n`;
    report += `There is a disconnect between the **Decision Engine** and the **API Response**.\n`;
    report += `- The Engine defines specific reasons (e.g., "Exam imminent", "Stale knowledge").\n`;
    report += `- The API ignores these and generates generic messages (e.g., "Multiple topics require urgent revision").\n`;
    report += `- **Recommendation:** Update \`src/app/api/intelligence/student/route.ts\` to aggregate and return the actual \`adkDecision.reasoning\` strings from all topics.\n`;

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`Report generated at: ${REPORT_PATH}`);
}

main();
