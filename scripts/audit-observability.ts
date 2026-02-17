import fs from 'fs';
import path from 'path';

const FLOWS_DIR = 'src/ai/flows';
const REPORT_PATH = 'OBSERVABILITY_GAP_REPORT.md';

function auditFlows() {
  console.log('🔍 Starting Genkit Flow Observability Audit...');

  if (!fs.existsSync(FLOWS_DIR)) {
    console.error(`❌ Flows directory not found: ${FLOWS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(FLOWS_DIR).filter(f => f.endsWith('.ts'));

  let reportContent = `# Observability Gap Report\n\n**Date:** ${new Date().toISOString()}\n\nAudit of Genkit Flows for logging and error handling coverage.\n\n| Flow File | Log Count | Error Log Count | Try/Catch Blocks | Status |\n|---|---|---|---|---|\n`;

  let totalFlows = 0;
  let flowsWithLogs = 0;
  let flowsWithErrors = 0;

  files.forEach(file => {
    const filePath = path.join(FLOWS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Naive regex counting
    const logCount = (content.match(/console\.(log|info|debug)/g) || []).length;
    const errorCount = (content.match(/console\.(error|warn)/g) || []).length;
    const tryCatchCount = (content.match(/try\s*\{/g) || []).length;

    // Check for structured logging (e.g., logger.info)
    const structuredLogCount = (content.match(/logger\./g) || []).length;
    const effectiveLogCount = logCount + structuredLogCount;

    let status = '✅ Pass';
    if (effectiveLogCount === 0 && errorCount === 0) {
      status = '❌ No Logging';
    } else if (tryCatchCount === 0 && errorCount === 0) {
      status = '⚠️ No Error Handling Logs';
    }

    reportContent += `| \`${file}\` | ${effectiveLogCount} | ${errorCount} | ${tryCatchCount} | ${status} |\n`;

    totalFlows++;
    if (effectiveLogCount > 0) flowsWithLogs++;
    if (errorCount > 0) flowsWithErrors++;
  });

  reportContent += `\n## Summary\n- **Total Flows:** ${totalFlows}\n- **Flows with Logs:** ${flowsWithLogs}\n- **Flows with Error Logs:** ${flowsWithErrors}\n\n## Recommendations\n- Ensure all flows have at least one entry/exit log.\n- Use structured logging where possible.\n- Ensure \`catch\` blocks log the error.\n`;

  fs.writeFileSync(REPORT_PATH, reportContent);
  console.log(`✅ Report generated: ${REPORT_PATH}`);
}

auditFlows();
