
import fs from 'fs';
import path from 'path';

const ADK_RULES = [
    {
        name: "Exam Cramming Mode",
        condition: "daysUntilExam <= 3 && mastery_probability < 0.6",
        tooltipExpectation: "Exam imminent",
        priority: "HIGH"
    },
    {
        name: "Critical Mastery + Imminent Forgetting",
        condition: "mastery_probability < 0.4 && days_until_forget < 3",
        tooltipExpectation: "Imminent forgetting risk",
        priority: "HIGH"
    },
    {
        name: "Low Mastery + High Attention Risk",
        condition: "mastery_probability < 0.4 && attention_risk === 'HIGH'",
        tooltipExpectation: "Attention challenges",
        priority: "HIGH"
    },
    {
        name: "Moderate Mastery + Stale Knowledge",
        condition: "mastery_probability >= 0.4 && mastery_probability < 0.6 && days_since_last_revision > 7",
        tooltipExpectation: "Needs refreshing",
        priority: "MEDIUM"
    },
    {
        name: "High Mastery + Recent Revision",
        condition: "mastery_probability >= 0.7 && days_since_last_revision <= 14",
        tooltipExpectation: "Strong mastery",
        priority: "LOW"
    }
];

const UI_COMPONENTS = [
    'src/components/LearningStateCard.tsx',
    'src/components/InteractiveGraph.tsx'
];

function analyzeDrift() {
    const report: string[] = [];
    report.push("# Explainability Tooltip Content Drift Analysis");
    report.push("");
    report.push("## Overview");
    report.push("This report compares the ADK decision logic rules with the tooltip content found in UI components to identify discrepancies or missing explanations.");
    report.push("");

    let totalDrift = 0;

    UI_COMPONENTS.forEach(filePath => {
        const fullPath = path.join(process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) {
            console.warn(`File not found: ${filePath}`);
            return;
        }

        const content = fs.readFileSync(fullPath, 'utf-8');
        report.push(`### Analysis of \`${filePath}\``);

        // Extract tooltip text using a simple regex (looks for strings inside TooltipContent or similar)
        // This is a heuristic approach.
        // IMPROVED: Strict start tag matching to avoid matching component names like ChartTooltipContent
        const tooltipRegex = /<TooltipContent[^>]*>([\s\S]*?)<\/TooltipContent>/g;
        let match;
        const tooltips: string[] = [];

        // Also look for return strings in useMemo hooks that might feed into tooltips
        const useMemoRegex = /return\s+["']([^"']+)["'];/g;

        while ((match = tooltipRegex.exec(content)) !== null) {
            // Clean up the match
            let cleanText = match[1].replace(/<[^>]+>/g, '').trim();
            // Remove code blocks (anything inside {})
            cleanText = cleanText.replace(/\{[^}]+\}/g, '').trim();

            // Filter out empty or too long captures (likely false positives or huge code dumps)
            if (cleanText && cleanText.length < 300 && !cleanText.includes("import ")) {
                tooltips.push(cleanText);
            }
        }

        while ((match = useMemoRegex.exec(content)) !== null) {
             if (match[1].length > 10) { // Filter out short strings
                 tooltips.push(match[1]);
             }
        }

        report.push(`**Found Tooltip/Explanation Strings:**`);
        if (tooltips.length === 0) {
            report.push("- *No tooltips found or extraction failed.*");
        } else {
            tooltips.forEach(t => report.push(`- "${t}"`));
        }
        report.push("");

        report.push(`**Drift Analysis against ADK Rules:**`);

        ADK_RULES.forEach(rule => {
            const relevant = tooltips.some(t =>
                t.toLowerCase().includes(rule.tooltipExpectation.toLowerCase()) ||
                // Semantic check approximations
                (rule.tooltipExpectation === "Exam imminent" && t.toLowerCase().includes("exam")) ||
                (rule.tooltipExpectation === "Imminent forgetting risk" && t.toLowerCase().includes("forget")) ||
                (rule.tooltipExpectation === "Attention challenges" && t.toLowerCase().includes("attention")) ||
                (rule.tooltipExpectation === "Needs refreshing" && t.toLowerCase().includes("review")) ||
                (rule.tooltipExpectation === "Strong mastery" && t.toLowerCase().includes("mastery"))
            );

            if (!relevant) {
                report.push(`- ⚠️ **DRIFT DETECTED**: Rule "${rule.name}" (${rule.condition}) expects explanation like "${rule.tooltipExpectation}", but no matching UI text was found.`);
                totalDrift++;
            } else {
                report.push(`- ✅ Rule "${rule.name}" appears to be covered.`);
            }
        });
        report.push("");
    });

    report.push("## Summary");
    if (totalDrift > 0) {
        report.push(`Found ${totalDrift} potential drift instances where ADK logic is not explicitly explained in the UI.`);
        report.push("Recommendation: Update UI components to include specific conditions for Exam Cramming, Forgetting Risk, and specific Mastery levels.");
    } else {
        report.push("No significant drift detected.");
    }

    fs.writeFileSync('EXPLAINABILITY_DRIFT_REPORT.md', report.join('\n'));
    console.log("Report generated: EXPLAINABILITY_DRIFT_REPORT.md");
}

analyzeDrift();
