
import fs from 'fs';
import path from 'path';

const TARGET_DIR = path.join(process.cwd(), 'src/app/(main)/teacher');
const REPORT_FILE = path.join(process.cwd(), 'reports', 'TEACHER_DASHBOARD_COGNITIVE_LOAD_AUDIT.md');

interface FileReport {
  filepath: string;
  componentCounts: Record<string, number>;
  dataPropCount: number;
  densityScore: number;
}

const UI_COMPONENTS = [
  'Card', 'ChartContainer', 'Progress', 'Badge', 'Avatar',
  'Button', 'Table', 'List', 'Input', 'Select', 'Tabs',
  'Dialog', 'Sheet', 'Sidebar'
];

function scanDirectory(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return [];
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

  const componentCounts: Record<string, number> = {};
  let totalComponents = 0;

  UI_COMPONENTS.forEach(comp => {
    // Regex for <Component
    const regex = new RegExp(`<${comp}\\b`, 'g');
    const matches = content.match(regex);
    if (matches) {
      componentCounts[comp] = matches.length;
      totalComponents += matches.length;
    }
  });

  // Count data props: prop={value}
  // This is a rough heuristic
  const dataPropRegex = /\w+=\{[^}]+\}/g;
  const dataProps = content.match(dataPropRegex);
  const dataPropCount = dataProps ? dataProps.length : 0;

  // Simple density formula
  const densityScore = (totalComponents * 2) + dataPropCount;

  if (densityScore === 0) return null;

  return {
    filepath: path.relative(process.cwd(), filepath),
    componentCounts,
    dataPropCount,
    densityScore
  };
}

function generateReport(reports: FileReport[]) {
  // Sort by density descending
  reports.sort((a, b) => b.densityScore - a.densityScore);

  let markdown = '# Teacher Dashboard Cognitive Load Audit\n\n';
  markdown += 'This report evaluates the information density and cognitive load of the Teacher Dashboard components based on UI element usage and data binding complexity.\n\n';

  markdown += `## Summary\n`;
  markdown += `- Total Files Analyzed: ${reports.length}\n`;
  markdown += `- Average Density Score: ${Math.round(reports.reduce((acc, r) => acc + r.densityScore, 0) / reports.length)}\n\n`;

  markdown += `## High Cognitive Load Areas\n`;
  markdown += `Files with the highest density scores, indicating complex UI with many elements and data bindings.\n\n`;

  markdown += `| Filepath | Density Score | Key Components | Data Props |\n`;
  markdown += `| :--- | :--- | :--- | :--- |\n`;

  reports.forEach(r => {
    const topComponents = Object.entries(r.componentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => `${name} (${count})`)
      .join(', ');

    markdown += `| \`${r.filepath}\` | **${r.densityScore}** | ${topComponents} | ${r.dataPropCount} |\n`;
  });

  markdown += `\n## Recommendations\n`;
  markdown += `1. **Simplify High-Density Views**: Break down files with scores > 50 into smaller sub-components.\n`;
  markdown += `2. **Progressive Disclosure**: Use accordions, tabs, or modals to hide secondary information in high-load views.\n`;
  markdown += `3. **Visual Hierarchy**: Ensure critical 'Alert' or 'Badge' elements are not drowned out by excessive 'Card' or 'Chart' usage.\n`;

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
