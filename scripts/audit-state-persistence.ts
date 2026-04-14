
import fs from 'fs';
import path from 'path';

const TARGET_DIR = path.join(process.cwd(), 'src/app');
const REPORT_FILE = path.join(process.cwd(), 'reports', 'STATE_PERSISTENCE_GAP_REPORT.md');

interface FileReport {
  filepath: string;
  states: string[];
  hasLocalStorage: boolean;
  hasSessionStorage: boolean;
}

function scanDirectory(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(scanDirectory(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

function analyzeFile(filepath: string): FileReport | null {
  const content = fs.readFileSync(filepath, 'utf-8');

  // Regex to find useState
  // const [stateName, setStateName] = useState(...)
  const stateRegex = /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState/g;
  const states: string[] = [];
  let match;
  while ((match = stateRegex.exec(content)) !== null) {
    states.push(match[1]);
  }

  if (states.length === 0) return null;

  const hasLocalStorage = content.includes('localStorage.setItem');
  const hasSessionStorage = content.includes('sessionStorage.setItem');

  return {
    filepath: path.relative(process.cwd(), filepath),
    states,
    hasLocalStorage,
    hasSessionStorage
  };
}

function generateReport(reports: FileReport[]) {
  let markdown = '# State Persistence Gap Report\n\n';
  markdown += 'This report identifies components with local state (`useState`) that may not be persisted to `localStorage` or `sessionStorage`, potentially leading to data loss on refresh.\n\n';

  const riskyFiles = reports.filter(r => !r.hasLocalStorage && !r.hasSessionStorage);
  const safeFiles = reports.filter(r => r.hasLocalStorage || r.hasSessionStorage);

  markdown += `## Summary\n`;
  markdown += `- Total Files Scanned: ${reports.length}\n`;
  markdown += `- Files with Unpersisted State: ${riskyFiles.length}\n`;
  markdown += `- Files with Persisted State: ${safeFiles.length}\n\n`;

  markdown += `## High Risk: Unpersisted State\n`;
  markdown += `The following files contain state but no detected client-side persistence mechanisms.\n\n`;

  if (riskyFiles.length === 0) {
    markdown += "_No high risk files detected._\n";
  } else {
    markdown += `| Filepath | State Variables |\n`;
    markdown += `| :--- | :--- |\n`;
    riskyFiles.forEach(r => {
      markdown += `| \`${r.filepath}\` | \`${r.states.join(', ')}\` |\n`;
    });
  }

  markdown += `\n## Low Risk: Persisted State (or Partial)\n`;
  markdown += `The following files contain state and use storage APIs.\n\n`;

  if (safeFiles.length === 0) {
    markdown += "_No persisted state detected._\n";
  } else {
    markdown += `| Filepath | Storage Type |\n`;
    markdown += `| :--- | :--- |\n`;
    safeFiles.forEach(r => {
      const types = [];
      if (r.hasLocalStorage) types.push('localStorage');
      if (r.hasSessionStorage) types.push('sessionStorage');
      markdown += `| \`${r.filepath}\` | ${types.join(', ')} |\n`;
    });
  }

  markdown += `\n## Recommendations\n`;
  markdown += `1. **Review High Risk Files**: Check if the identified state variables (e.g., form data, progress) should persist across reloads.\n`;
  markdown += `2. **Implement Persistence**: Use a custom hook like \`useLocalStorage\` for critical state.\n`;
  markdown += `3. **Database Sync**: Ensure critical data is also synced to the backend via API calls (not covered in this client-side audit).\n`;

  // Ensure directory exists
  const reportDir = path.dirname(REPORT_FILE);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(REPORT_FILE, markdown);
  console.log(`Report generated at ${REPORT_FILE}`);
}

const files = scanDirectory(TARGET_DIR);
const reports: FileReport[] = [];

files.forEach(file => {
  const report = analyzeFile(file);
  if (report) {
    reports.push(report);
  }
});

generateReport(reports);
