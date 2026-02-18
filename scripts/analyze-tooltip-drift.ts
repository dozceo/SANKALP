
import fs from 'fs';
import path from 'path';

/**
 * Explainability Drift Analysis Script
 *
 * Production-grade script to audit synchronization between ADK decision logic and UI explanations.
 *
 * Usage:
 *   npx tsx scripts/analyze-tooltip-drift.ts [options]
 *
 * Options:
 *   --adk <path>        Path to ADK decision engine file (default: src/ai/adk/decision-engine.ts)
 *   --component <path>  Path to UI component file (default: src/components/LearningStateCard.tsx)
 *   --output <path>     Path to output report file (default: EXPLAINABILITY_DRIFT_REPORT.md)
 *   --json              Output result as JSON to stdout
 *   --fail-on-drift     Exit with code 1 if drift is detected
 *   --help              Show help
 */

const DEFAULTS = {
  ADK_FILE: 'src/ai/adk/decision-engine.ts',
  COMPONENT_FILE: 'src/components/LearningStateCard.tsx',
  REPORT_FILE: 'EXPLAINABILITY_DRIFT_REPORT.md',
};

interface AdkRule {
  condition: string;
  reasoning: string;
}

interface TooltipRule {
  condition: string;
  text: string;
}

interface DriftReport {
  timestamp: string;
  adkPath: string;
  componentPath: string;
  summary: {
    adkRulesCount: number;
    tooltipRulesCount: number;
    driftCount: number;
    status: 'DRIFT_DETECTED' | 'SYNCHRONIZED';
  };
  details: {
    adkRules: AdkRule[];
    tooltipRules: TooltipRule[];
    missingConcepts: string[];
  };
}

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    adkPath: path.join(process.cwd(), DEFAULTS.ADK_FILE),
    componentPath: path.join(process.cwd(), DEFAULTS.COMPONENT_FILE),
    outputPath: path.join(process.cwd(), DEFAULTS.REPORT_FILE),
    jsonOutput: false,
    failOnDrift: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--adk':
        config.adkPath = path.resolve(args[++i]);
        break;
      case '--component':
        config.componentPath = path.resolve(args[++i]);
        break;
      case '--output':
        config.outputPath = path.resolve(args[++i]);
        break;
      case '--json':
        config.jsonOutput = true;
        break;
      case '--fail-on-drift':
        config.failOnDrift = true;
        break;
      case '--help':
        console.log(`
Usage: npx tsx scripts/analyze-tooltip-drift.ts [options]

Options:
  --adk <path>        Path to ADK decision engine file
  --component <path>  Path to UI component file
  --output <path>     Path to output report file
  --json              Output result as JSON to stdout
  --fail-on-drift     Exit with code 1 if drift is detected
        `);
        process.exit(0);
    }
  }
  return config;
}

function extractAdkRules(content: string): { rules: AdkRule[]; allReasonings: string[] } {
  const rules: AdkRule[] = [];
  // Regex to capture if conditions and reasoning returns
  const regex = /if\s*\((.*?)\)\s*\{\s*return\s*\{[\s\S]*?reasoning:\s*"(.*?)",/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    rules.push({
      condition: match[1].trim(),
      reasoning: match[2].trim(),
    });
  }

  // Extract all reasoning strings to catch defaults or switch cases
  const allReasonings: string[] = [];
  const reasonRegex = /reasoning:\s*"(.*?)",/g;
  while ((match = reasonRegex.exec(content)) !== null) {
      allReasonings.push(match[1]);
  }

  // Add reasonings not associated with an explicit 'if' (e.g., default return)
  // We identify them by exclusion
  const capturedReasonings = new Set(rules.map(r => r.reasoning));
  allReasonings.forEach(r => {
      if (!capturedReasonings.has(r)) {
          rules.push({
              condition: 'DEFAULT / FALLBACK',
              reasoning: r
          });
      }
  });

  return { rules, allReasonings };
}

function extractTooltipRules(content: string): TooltipRule[] {
  const rules: TooltipRule[] = [];
  // Target the useMemo hook where tooltip text is usually calculated
  const useMemoRegex = /const tooltipText = useMemo\(\(\) => \{([\s\S]*?)\},/g;
  const match = useMemoRegex.exec(content);

  if (match) {
    const block = match[1];

    // Capture explicit returns inside if statements
    const ifRegex = /if\s*\((.*?)\)\s*return\s*"(.*?)";/g;
    let ifMatch;
    while ((ifMatch = ifRegex.exec(block)) !== null) {
      rules.push({
        condition: ifMatch[1].trim(),
        text: ifMatch[2].trim(),
      });
    }

    // Capture fallback/default return at the end of the block
    // We look for a return statement that is NOT inside an if (simplified heuristic)
    // Or just grab all string returns and deduct
    const returnRegex = /return\s*"(.*?)";/g;
    let returnMatch;
    while ((returnMatch = returnRegex.exec(block)) !== null) {
        const text = returnMatch[1];
        // If this text wasn't already captured with an if condition, assume it's default
        if (!rules.find(r => r.text === text)) {
             rules.push({ condition: 'DEFAULT', text });
        }
    }
  }
  return rules;
}

function analyzeDrift(adkRules: AdkRule[], tooltipRules: TooltipRule[]): { missingConcepts: string[], status: 'DRIFT_DETECTED' | 'SYNCHRONIZED' } {
  const tooltipTextCombined = tooltipRules.map(r => r.text.toLowerCase()).join(' ');

  // Semantic keywords mapping ADK concepts to UI terms
  // This could be externalized to a config file
  const keywords: Record<string, string[]> = {
      "Cramming": ["cramming", "exam", "urgent"],
      "Forgetting Risk": ["forgetting", "memory", "retention"],
      "Spaced Repetition": ["spaced", "repetition", "review"],
      "Progress Allowed": ["progress", "advanced", "challenge"],
      "Adaptive Teaching": ["adaptive", "engaging", "interactive"],
      "Routine Revision": ["routine", "standard"]
  };

  const missingConcepts: string[] = [];

  Object.entries(keywords).forEach(([concept, terms]) => {
      // Check if ANY of the terms are present in the combined tooltip text
      const present = terms.some(term => tooltipTextCombined.includes(term));
      if (!present) {
          missingConcepts.push(concept);
      }
  });

  // Check numerical drift (count mismatch)
  // We expect roughly 1-to-1 or N-to-1 mapping.
  // If distinct ADK paths > distinct Tooltip explanations, information is lost.
  const uniqueAdkReasonings = new Set(adkRules.map(r => r.reasoning)).size;
  const uniqueTooltipTexts = new Set(tooltipRules.map(r => r.text)).size;

  let status: 'DRIFT_DETECTED' | 'SYNCHRONIZED' = 'SYNCHRONIZED';

  // Heuristic: If we are missing > 2 semantic concepts OR have significant count mismatch
  if (missingConcepts.length > 0 || (uniqueAdkReasonings - uniqueTooltipTexts > 2)) {
      status = 'DRIFT_DETECTED';
  }

  return { missingConcepts, status };
}

function generateMarkdownReport(report: DriftReport): string {
  let md = `# Explainability Drift Analysis Report\n\n`;
  md += `**Generated:** ${report.timestamp}\n`;
  md += `**ADK Source:** \`${path.relative(process.cwd(), report.adkPath)}\`\n`;
  md += `**UI Component:** \`${path.relative(process.cwd(), report.componentPath)}\`\n\n`;

  md += `## Summary\n`;
  md += `- **ADK Decision Rules:** ${report.summary.adkRulesCount}\n`;
  md += `- **UI Tooltip Explanations:** ${report.summary.tooltipRulesCount}\n`;

  const icon = report.summary.status === 'DRIFT_DETECTED' ? '⚠️' : '✅';
  md += `- **Status:** ${icon} ${report.summary.status.replace('_', ' ')}\n`;

  if (report.summary.driftCount > 0) {
      md += `- **Missing Concepts:** ${report.summary.driftCount}\n`;
  }

  md += `\n## Detailed Comparison\n\n`;

  md += `### ADK Decision Logic\n`;
  md += `| Condition (Simplified) | Reasoning |\n`;
  md += `|---|---|\n`;
  report.details.adkRules.forEach(r => {
      const cond = r.condition.length > 50 ? r.condition.substring(0, 47) + '...' : r.condition;
      md += `| \`${cond}\` | ${r.reasoning} |\n`;
  });

  md += `\n### UI Tooltip Logic\n`;
  md += `| Condition | Tooltip Text |\n`;
  md += `|---|---|\n`;
  report.details.tooltipRules.forEach(r => {
      md += `| \`${r.condition}\` | ${r.text} |\n`;
  });

  if (report.details.missingConcepts.length > 0) {
      md += `\n## Drift Analysis\n`;
      md += `The following ADK concepts appear to be missing from the UI tooltips:\n`;
      report.details.missingConcepts.forEach(concept => {
          md += `- **${concept}**\n`;
      });
  }

  return md;
}

function main() {
  const config = parseArgs();

  // Validate files exist
  if (!fs.existsSync(config.adkPath)) {
    console.error(`Error: ADK file not found at ${config.adkPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(config.componentPath)) {
    console.error(`Error: Component file not found at ${config.componentPath}`);
    process.exit(1);
  }

  try {
    const adkContent = fs.readFileSync(config.adkPath, 'utf-8');
    const componentContent = fs.readFileSync(config.componentPath, 'utf-8');

    const { rules: adkRules } = extractAdkRules(adkContent);
    const tooltipRules = extractTooltipRules(componentContent);

    const { missingConcepts, status } = analyzeDrift(adkRules, tooltipRules);

    const reportData: DriftReport = {
      timestamp: new Date().toLocaleString(),
      adkPath: config.adkPath,
      componentPath: config.componentPath,
      summary: {
        adkRulesCount: adkRules.length,
        tooltipRulesCount: tooltipRules.length,
        driftCount: missingConcepts.length,
        status,
      },
      details: {
        adkRules,
        tooltipRules,
        missingConcepts,
      },
    };

    if (config.jsonOutput) {
      console.log(JSON.stringify(reportData, null, 2));
    } else {
      const markdown = generateMarkdownReport(reportData);
      fs.writeFileSync(config.outputPath, markdown);
      console.log(`Report generated at ${config.outputPath}`);
    }

    if (config.failOnDrift && status === 'DRIFT_DETECTED') {
      console.error('Failure: Drift detected between ADK and UI.');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('Fatal Error:', error.message);
    process.exit(1);
  }
}

main();
