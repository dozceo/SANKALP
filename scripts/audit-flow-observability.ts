import fs from 'fs';
import path from 'path';

const FLOWS_DIR = 'src/ai/flows';
const REPORT_FILE = 'OBSERVABILITY_GAP_REPORT.md';

if (!fs.existsSync(FLOWS_DIR)) {
  console.error(`Directory not found: ${FLOWS_DIR}`);
  process.exit(1);
}

const flows = fs.readdirSync(FLOWS_DIR).filter(f => f.endsWith('.ts'));

let report = `# Observability Gap Report

Audit of Genkit Flows for logging and error handling coverage.

| Flow File | Log Count | Error Log Count | Structured Logs? | Has Try/Catch? | Status |
|---|---|---|---|---|---|
`;

flows.forEach(file => {
  const content = fs.readFileSync(path.join(FLOWS_DIR, file), 'utf-8');

  const logCount = (content.match(/console\.log/g) || []).length;
  const errorCount = (content.match(/console\.error/g) || []).length;
  const warnCount = (content.match(/console\.warn/g) || []).length;
  const infoCount = (content.match(/console\.info/g) || []).length;

  const totalLogs = logCount + errorCount + warnCount + infoCount;

  // Check for structured logging (simple heuristic: console.log(..., {...}) or JSON.stringify)
  // Also check for passing an object as second argument
  const hasStructured = /console\.\w+\(.*\s*,\s*\{/.test(content) || /JSON\.stringify/.test(content);

  // Check for try/catch
  const hasTryCatch = /try\s*\{/.test(content) && /catch\s*\(/.test(content);

  let status = '✅ Pass';
  if (totalLogs < 2) status = '⚠️ Low Logging';
  if (errorCount === 0 && hasTryCatch) status = '⚠️ Missing Error Logs';
  // If no try/catch, it might be a simple flow that relies on global handling, but usually we want it.
  if (!hasTryCatch) status = '❌ No Error Handling';

  report += `| \`${file}\` | ${totalLogs} | ${errorCount} | ${hasStructured ? 'Yes' : 'No'} | ${hasTryCatch ? 'Yes' : 'No'} | ${status} |\n`;
});

report += `
## Recommendations
- Ensure all flows have at least one \`console.log\` for entry and one for exit.
- Ensure all \`catch\` blocks log the error using \`console.error\`.
- Consider using a structured logger instead of \`console\`.
`;

fs.writeFileSync(REPORT_FILE, report);
console.log(`Report saved to ${REPORT_FILE}`);
