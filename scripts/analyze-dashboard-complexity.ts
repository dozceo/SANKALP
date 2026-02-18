import fs from 'fs';
import path from 'path';

const TARGET_DIR = 'src/app/(main)/teacher';
const REPORT_FILE = 'TEACHER_DASHBOARD_COGNITIVE_LOAD_AUDIT.md';

function scanDirectory(dir: string, fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanDirectory(filePath, fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function analyzeFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');

  const metrics = {
    buttons: (content.match(/<Button/g) || []).length,
    inputs: (content.match(/<Input/g) || []).length,
    selects: (content.match(/<Select/g) || []).length,
    links: (content.match(/<Link/g) || []).length,

    tables: (content.match(/<Table/g) || []).length,
    cards: (content.match(/<Card/g) || []).length,
    charts: (content.match(/Recharts|ChartContainer|LineChart|BarChart|PieChart/g) || []).length,
    badges: (content.match(/<Badge/g) || []).length,

    stateHooks: (content.match(/useState/g) || []).length,
    effectHooks: (content.match(/useEffect/g) || []).length,

    loc: content.split('\n').length
  };

  // Complexity score heuristic
  // Interactive elements cost 1
  // Data displays cost 2
  // Hooks cost 3 (internal logic complexity)
  const complexityScore =
    (metrics.buttons + metrics.inputs + metrics.selects + metrics.links) * 1 +
    (metrics.tables + metrics.cards + metrics.charts + metrics.badges) * 2 +
    (metrics.stateHooks + metrics.effectHooks) * 3;

  return {
    filePath,
    ...metrics,
    complexityScore
  };
}

function generateReport(results: any[]) {
  let report = '# Teacher Dashboard Cognitive Load Audit\n\n';
  report += 'This report evaluates the information density and complexity of the Teacher Dashboard components to identify potential cognitive overload.\n\n';

  // Sort by complexity score
  results.sort((a, b) => b.complexityScore - a.complexityScore);

  report += `## Summary\n`;
  report += `- Total Components Analyzed: ${results.length}\n`;
  const totalScore = results.reduce((sum, r) => sum + r.complexityScore, 0);
  report += `- Total Complexity Score: ${totalScore}\n\n`;

  report += `## Component Complexity Ranking\n`;
  report += `| Component | Complexity Score | Interactive | Data Display | Logic (Hooks) | LOC |\n`;
  report += `|---|---|---|---|---|---|\n`;

  results.forEach(r => {
    const interactive = r.buttons + r.inputs + r.selects + r.links;
    const dataDisplay = r.tables + r.cards + r.charts + r.badges;
    const logic = r.stateHooks + r.effectHooks;
    const shortPath = r.filePath.replace('src/app/(main)/teacher/', '');
    report += `| ${shortPath} | ${r.complexityScore} | ${interactive} | ${dataDisplay} | ${logic} | ${r.loc} |\n`;
  });

  report += `\n## Recommendations\n`;
  const highComplexity = results.filter(r => r.complexityScore > 50);
  if (highComplexity.length > 0) {
      report += `Found ${highComplexity.length} high-complexity components (Score > 50). Consider refactoring or breaking down:\n`;
      highComplexity.forEach(r => {
          const shortPath = r.filePath.replace('src/app/(main)/teacher/', '');
          report += `- **${shortPath}**: Score ${r.complexityScore}. `;
          if (r.stateHooks + r.effectHooks > 5) report += "High internal state management. ";
          if (r.buttons + r.inputs > 10) report += "Many interactive elements. ";
          if (r.charts + r.tables > 2) report += "Multiple data visualizations. ";
          report += '\n';
      });
  } else {
      report += "No exceptionally high complexity components found.\n";
  }

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated at ${REPORT_FILE}`);
}

const files = scanDirectory(TARGET_DIR);
const results = files.map(analyzeFile);
generateReport(results);
