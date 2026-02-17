
import fs from 'fs';
import path from 'path';

const ADK_FILE = path.join(process.cwd(), 'src/ai/adk/decision-engine.ts');
const COMPONENT_FILE = path.join(process.cwd(), 'src/components/LearningStateCard.tsx');
const REPORT_FILE = path.join(process.cwd(), 'EXPLAINABILITY_DRIFT_REPORT.md');

function extractAdkRules(content: string) {
  const rules = [];
  const regex = /if\s*\((.*?)\)\s*\{\s*return\s*\{[\s\S]*?reasoning:\s*"(.*?)",/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    rules.push({
      condition: match[1].trim(),
      reasoning: match[2].trim(),
    });
  }
  // Extract default return
  const defaultRegex = /return\s*\{[\s\S]*?reasoning:\s*"(.*?)",/g;
  while ((match = defaultRegex.exec(content)) !== null) {
      // Check if this is already captured (it might capture the returns inside ifs if the regex is greedy, but non-greedy .*? should prevent that)
      // Actually the previous regex captures the 'if' block. The default return is at the end.
      // Let's just look for the last return
  }

  // A simpler way to get all reasonings
  const allReasonings = [];
  const reasonRegex = /reasoning:\s*"(.*?)",/g;
  while ((match = reasonRegex.exec(content)) !== null) {
      allReasonings.push(match[1]);
  }

  return { rules, allReasonings };
}

function extractTooltipRules(content: string) {
  const rules = [];
  // Find the useMemo block
  const useMemoRegex = /const tooltipText = useMemo\(\(\) => \{([\s\S]*?)\},/g;
  const match = useMemoRegex.exec(content);

  if (match) {
    const block = match[1];
    const ifRegex = /if\s*\((.*?)\)\s*return\s*"(.*?)";/g;
    let ifMatch;
    while ((ifMatch = ifRegex.exec(block)) !== null) {
      rules.push({
        condition: ifMatch[1].trim(),
        text: ifMatch[2].trim(),
      });
    }
    // Default return
    const returnRegex = /return\s*"(.*?)";/g;
    let returnMatch;
    while ((returnMatch = returnRegex.exec(block)) !== null) {
        // The last return is likely the default one if it's not inside an if
        // But the previous regex might catch returns inside ifs if they are not one-liners?
        // The code has one-liners.
        // Let's just capture all string returns in the block
        if (!rules.find(r => r.text === returnMatch![1])) {
             rules.push({ condition: 'DEFAULT', text: returnMatch![1] });
        }
    }
  }
  return rules;
}

function generateReport(adkData: { rules: any[], allReasonings: string[] }, tooltipRules: any[]) {
  let report = `# Explainability Drift Analysis Report\n\n`;
  report += `**Generated:** ${new Date().toLocaleString()}\n\n`;

  report += `## Summary\n`;
  report += `- **ADK Decision Rules:** ${adkData.allReasonings.length} distinct reasoning paths found.\n`;
  report += `- **UI Tooltip Explanations:** ${tooltipRules.length} distinct explanations found.\n`;

  const drift = adkData.allReasonings.length - tooltipRules.length;
  if (drift > 0) {
      report += `- **Status:** ⚠️ DRIFT DETECTED (${drift} missing explanations)\n\n`;
  } else {
      report += `- **Status:** ✅ SYNCHRONIZED (Counts match, check semantics below)\n\n`;
  }

  report += `## Detailed Comparison\n\n`;

  report += `### ADK Decision Logic (Source of Truth)\n`;
  report += `| Condition (Simplified) | Reasoning |\n`;
  report += `|---|---|\n`;
  adkData.rules.forEach(r => {
      report += `| \`${r.condition.substring(0, 50)}...\` | ${r.reasoning} |\n`;
  });
  // Add reasonings that might not have been captured by the 'if' regex (e.g. default)
  const capturedReasonings = adkData.rules.map(r => r.reasoning);
  const uncaptured = adkData.allReasonings.filter(r => !capturedReasonings.includes(r));
  uncaptured.forEach(r => {
      report += `| *Default / Other* | ${r} |\n`;
  });

  report += `\n### UI Tooltip Logic (Implementation)\n`;
  report += `| Condition | Tooltip Text |\n`;
  report += `|---|---|\n`;
  tooltipRules.forEach(r => {
      report += `| \`${r.condition}\` | ${r.text} |\n`;
  });

  report += `\n## Drift Analysis\n`;
  report += `The following ADK concepts appear to be missing from the UI tooltips:\n`;

  const tooltipTextCombined = tooltipRules.map(r => r.text.toLowerCase()).join(' ');

  const keywords = {
      "Cramming": ["cramming", "exam"],
      "Forgetting Risk": ["forgetting", "memory"],
      "Spaced Repetition": ["spaced", "repetition"],
      "Progress Allowed": ["progress", "advanced"],
      "Adaptive Teaching": ["adaptive", "engaging"],
      "Routine Revision": ["routine"]
  };

  Object.entries(keywords).forEach(([concept, terms]) => {
      const present = terms.some(term => tooltipTextCombined.includes(term));
      if (!present) {
          report += `- **${concept}**: No tooltip text found containing keywords "${terms.join(', ')}".\n`;
      }
  });

  return report;
}

function main() {
  if (!fs.existsSync(ADK_FILE) || !fs.existsSync(COMPONENT_FILE)) {
    console.error("Files not found.");
    process.exit(1);
  }

  const adkContent = fs.readFileSync(ADK_FILE, 'utf-8');
  const componentContent = fs.readFileSync(COMPONENT_FILE, 'utf-8');

  const adkData = extractAdkRules(adkContent);
  const tooltipRules = extractTooltipRules(componentContent);

  const report = generateReport(adkData, tooltipRules);
  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated at ${REPORT_FILE}`);
}

main();
