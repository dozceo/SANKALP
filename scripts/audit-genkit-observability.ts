import fs from 'fs';
import path from 'path';

const FLOWS_DIR = path.join(process.cwd(), 'src/ai/flows');
const REPORT_PATH = path.join(process.cwd(), 'reports/GENKIT_OBSERVABILITY_REPORT.md');

// Ensure reports directory exists
if (!fs.existsSync(path.dirname(REPORT_PATH))) {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
}

function scanFlows() {
  const files = fs.readdirSync(FLOWS_DIR).filter(f => f.endsWith('.ts'));

  let report = `# Genkit Flow Observability & Logging Audit

**Date:** ${new Date().toISOString()}

This report identifies AI flows in \`src/ai/flows/\` that lack sufficient logging or error handling.

| Flow File | Defined Flows | Logging Detected | Error Handling (try/catch) | Status |
| :--- | :--- | :--- | :--- | :--- |
`;

  let totalFlows = 0;
  let flowsWithIssues = 0;

  files.forEach(file => {
    const content = fs.readFileSync(path.join(FLOWS_DIR, file), 'utf-8');

    // Naive regex to find flow definitions.
    // Matches ai.defineFlow(...) or export async function ...
    // This is an approximation.

    const hasDefineFlow = content.includes('ai.defineFlow');
    const hasExportAsync = content.includes('export async function');

    if (!hasDefineFlow && !hasExportAsync) return;

    const hasConsoleLog = /console\.(log|info|warn|error)/.test(content);
    const hasLogger = /logger\./.test(content);
    const hasTelemetry = /telemetry\./.test(content);
    const hasLogging = hasConsoleLog || hasLogger || hasTelemetry;

    const hasTryCatch = /try\s*{/.test(content) && /catch/.test(content);

    const flowNameMatch = content.match(/name:\s*['"]([^'"]+)['"]/);
    const flowName = flowNameMatch ? flowNameMatch[1] : (hasDefineFlow ? 'Unnamed Flow' : 'Async Function');

    let status = '✅ PASS';
    if (!hasLogging || !hasTryCatch) {
      status = '⚠️ GAP DETECTED';
      flowsWithIssues++;
    }

    totalFlows++;

    report += `| \`${file}\` | ${flowName} | ${hasLogging ? '✅' : '❌'} | ${hasTryCatch ? '✅' : '❌'} | ${status} |\n`;
  });

  report += `\n## Summary\n\n- **Total Files Scanned:** ${files.length}\n- **Total Flows Identified:** ${totalFlows}\n- **Flows with Observability Gaps:** ${flowsWithIssues}\n\n`;

  report += `## Recommendations\n\n`;
  if (flowsWithIssues > 0) {
    report += `- **Add Structured Logging:** Ensure all flows log input parameters (sanitized) and output summaries.\n`;
    report += `- **Implement Error Boundaries:** Wrap flow logic in \`try/catch\` blocks to capture and log exceptions with context.\n`;
    report += `- **Latency Tracking:** Consider adding start/end timestamps to log execution duration.\n`;
  } else {
    report += `All scanned flows appear to have basic logging and error handling. Continue monitoring for quality.\n`;
  }

  fs.writeFileSync(REPORT_PATH, report);
  console.log(`Report generated at ${REPORT_PATH}`);
}

scanFlows();
