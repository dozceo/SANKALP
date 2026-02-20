
import fs from 'fs';
import path from 'path';

const FLOW_FILE = 'src/ai/flows/smart-revision-planner.ts';
const UI_FILE = 'src/components/planner/ScheduleView.tsx';

interface FlowCheck {
    name: string;
    file: string;
    description: string;
    pattern: RegExp;
    found: boolean;
    critical: boolean;
}

const CHECKS: FlowCheck[] = [
    // ML -> ADK Checks
    {
        name: "Empty Topic Check",
        file: FLOW_FILE,
        description: "Checks if flow handles empty topic lists early",
        pattern: /if\s*\(topics\.length\s*===\s*0\)\s*return\s*\[\]/,
        found: false,
        critical: true
    },
    {
        name: "ML Prediction Error Handling",
        file: FLOW_FILE,
        description: "Checks if flow catches errors during batch prediction",
        pattern: /prediction\.predicted_class\s*!==\s*['"]error['"]/,
        found: false,
        critical: true
    },
    {
        name: "Prediction Fallback",
        file: FLOW_FILE,
        description: "Checks if flow has a fallback when prediction is missing",
        pattern: /if\s*\(!prediction\)\s*\{[\s\S]*?Fallback[\s\S]*?\}/,
        found: false,
        critical: true
    },

    // ADK -> LLM Checks
    {
        name: "LLM Explanation Try/Catch",
        file: FLOW_FILE,
        description: "Checks if LLM call is wrapped in try/catch",
        pattern: /try\s*\{[\s\S]*?explanationPrompt[\s\S]*?\}\s*catch/,
        found: false,
        critical: true
    },
    {
        name: "LLM Fallback Logic",
        file: FLOW_FILE,
        description: "Checks if there is fallback text if LLM fails",
        pattern: /fallbackReason\s*=\s*['"][^'"]+['"]/,
        found: false,
        critical: true
    },

    // UI Checks
    {
        name: "UI Loading State",
        file: UI_FILE,
        description: "Checks if UI has a loading state during generation",
        pattern: /loading\s*\?\s*\(/,
        found: false,
        critical: false
    },
    {
        name: "UI Error Display",
        file: UI_FILE,
        description: "Checks if UI displays errors to the user",
        pattern: /setError\(['"][^'"]+['"]\)/,
        found: false,
        critical: true
    },
    {
        name: "UI Empty State Handling",
        file: UI_FILE,
        description: "Checks if UI handles empty revision lists",
        pattern: /plan\.revisionList\.length\s*===\s*0/,
        found: false,
        critical: true
    }
];

function auditFlow() {
    const report: string[] = [];
    report.push("# Smart Revision Planner UX Flow Integrity Check");
    report.push("");
    report.push("## Overview");
    report.push("This report validates the user flow from ML prediction -> ADK decision -> LLM explanation -> UI rendering by checking for essential error handling and state management patterns.");
    report.push("");

    // Read files once
    const flowContent = fs.existsSync(FLOW_FILE) ? fs.readFileSync(FLOW_FILE, 'utf-8') : "";
    const uiContent = fs.existsSync(UI_FILE) ? fs.readFileSync(UI_FILE, 'utf-8') : "";

    if (!flowContent) report.push(`❌ **CRITICAL**: Could not find flow file: ${FLOW_FILE}`);
    if (!uiContent) report.push(`❌ **CRITICAL**: Could not find UI file: ${UI_FILE}`);

    report.push("## Flow State Validation");

    let brokenStates = 0;

    CHECKS.forEach(check => {
        const content = check.file === FLOW_FILE ? flowContent : uiContent;
        if (content && check.pattern.test(content)) {
            check.found = true;
            report.push(`- ✅ **${check.name}**: Passed. (${check.description})`);
        } else {
            report.push(`- ❌ **${check.name}**: FAILED. (${check.description})`);
            report.push(`  - Expected pattern not found: \`${check.pattern.source}\``);
            if (check.critical) brokenStates++;
        }
    });

    report.push("");
    report.push("## Integrity Summary");
    if (brokenStates > 0) {
        report.push(`Found ${brokenStates} potential broken states or missing error handlers.`);
        report.push("Recommendation: Review the failed checks and implement missing fallbacks.");
    } else {
        report.push("Flow appears robust with fallbacks at all critical stages.");
    }

    fs.writeFileSync('SMART_REVISION_FLOW_INTEGRITY_REPORT.md', report.join('\n'));
    console.log("Report generated: SMART_REVISION_FLOW_INTEGRITY_REPORT.md");
}

auditFlow();
