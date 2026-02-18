import fs from 'fs';
import path from 'path';

const TARGET_DIR = path.join(process.cwd(), 'src', 'app');
const OUTPUT_FILE = 'STATE_PERSISTENCE_GAP_REPORT.md';

function scanDirectory(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(scanDirectory(filePath));
    } else if (file.endsWith('.tsx')) {
      results.push(filePath);
    }
  });
  return results;
}

function analyzeFile(filePath: string): { hasState: boolean, hasPersistence: boolean, states: string[] } {
  const content = fs.readFileSync(filePath, 'utf-8');

  // improved regex to capture state variable names
  const stateRegex = /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState/g;
  const states: string[] = [];
  let match;
  while ((match = stateRegex.exec(content)) !== null) {
    states.push(match[1]);
  }

  const hasState = states.length > 0;
  const hasPersistence = /localStorage\.|sessionStorage\./.test(content);

  return { hasState, hasPersistence, states };
}

function generateReport() {
  const files = scanDirectory(TARGET_DIR);
  let report = '# State Persistence Gap Report\n\n';
  report += 'This report identifies components using `useState` without apparent `localStorage` or `sessionStorage` backup.\n\n';

  let gapCount = 0;

  files.forEach(file => {
    const analysis = analyzeFile(file);
    if (analysis.hasState && !analysis.hasPersistence) {
      const relativePath = path.relative(process.cwd(), file);
      report += `## ${relativePath}\n`;
      report += `- **Detected States**: ${analysis.states.join(', ')}\n`;
      report += `- **Persistence Check**: ❌ No explicit storage detected.\n`;
      report += `- **Risk**: High - Data loss on refresh.\n\n`;
      gapCount++;
    }
  });

  if (gapCount === 0) {
    report += 'No state persistence gaps detected (or all components use storage).\n';
  } else {
    report += `\n**Total Components with Persistence Gaps:** ${gapCount}\n`;
  }

  report += `\n## Recommended Recovery Strategies
1.  **LocalStorage Sync**: For non-sensitive preferences (e.g., UI toggles), use a custom hook like \`useLocalStorage\`.
2.  **SessionStorage**: For form data that should persist during a session but clear on close.
3.  **URL Parameters**: For filter/sort state, lift state to the URL query parameters.
4.  **Server-Side State**: For critical data, ensure frequent auto-saving to the backend.
`;

  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(`Report generated at ${OUTPUT_FILE}`);
}

generateReport();
