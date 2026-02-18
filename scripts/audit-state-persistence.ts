import fs from 'fs';
import path from 'path';

const TARGET_DIR = 'src/app';
const REPORT_FILE = 'STATE_PERSISTENCE_GAP_REPORT.md';

function scanDirectory(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanDirectory(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function analyzeFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const hasUseState = content.includes('useState');
  const hasUseReducer = content.includes('useReducer');

  if (!hasUseState && !hasUseReducer) return null;

  const hasLocalStorage = content.includes('localStorage');
  const hasSessionStorage = content.includes('sessionStorage');
  const hasIndexedDB = content.includes('indexedDB');
  const hasCookie = content.includes('cookie');

  // Basic heuristic: if state is used but no storage mechanism is found in the same file, it's a potential gap.
  // This is a naive check but sufficient for an initial audit.
  const isPersisted = hasLocalStorage || hasSessionStorage || hasIndexedDB || hasCookie;

  return {
    filePath,
    hasUseState,
    hasUseReducer,
    isPersisted,
    persistenceMethods: [
        hasLocalStorage ? 'localStorage' : '',
        hasSessionStorage ? 'sessionStorage' : '',
        hasIndexedDB ? 'indexedDB' : '',
        hasCookie ? 'cookie' : ''
    ].filter(Boolean)
  };
}

function generateReport(results: any[], totalFilesScanned: number) {
  let report = '# State Persistence Gap Report\n\n';
  report += 'This report identifies components using local state (`useState`, `useReducer`) without obvious client-side persistence mechanisms (`localStorage`, `sessionStorage`, etc.).\n\n';

  const riskyFiles = results.filter(r => (r.hasUseState || r.hasUseReducer) && !r.isPersisted);

  report += `## Summary\n`;
  report += `- Total Files Scanned: ${totalFilesScanned}\n`;
  report += `- Files with State: ${results.length}\n`;
  report += `- Potential Persistence Gaps: ${riskyFiles.length}\n\n`;

  report += `## High Risk Components (State without Persistence)\n`;
  if (riskyFiles.length === 0) {
      report += "No obvious gaps found.\n";
  } else {
      riskyFiles.forEach(file => {
        report += `- **${file.filePath}**\n`;
        if (file.hasUseState) report += `  - Uses \`useState\`\n`;
        if (file.hasUseReducer) report += `  - Uses \`useReducer\`\n`;
      });
  }

  report += `\n## Components with Persistence\n`;
  const persistedFiles = results.filter(r => r.isPersisted);
   if (persistedFiles.length === 0) {
      report += "No client-side persistence found in stateful components.\n";
  } else {
      persistedFiles.forEach(file => {
        report += `- **${file.filePath}** (${file.persistenceMethods.join(', ')})\n`;
      });
  }

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated at ${REPORT_FILE}`);
}

const files = scanDirectory(TARGET_DIR);
const results = files.map(analyzeFile).filter(Boolean);
generateReport(results, files.length);
