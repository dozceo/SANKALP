import fs from 'fs';
import path from 'path';

const TARGET_DIR = path.join(process.cwd(), 'src', 'app', '(main)', 'teacher');
const OUTPUT_FILE = 'TEACHER_DASHBOARD_COGNITIVE_LOAD_AUDIT.md';

function scanDirectory(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
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

function analyzeFile(filePath: string): {
  elementCount: number,
  dataComponents: number,
  interactiveComponents: number
} {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Count total JSX opening tags
  const elementCount = (content.match(/<[A-Z][a-zA-Z]*/g) || []).length;

  // Count data-heavy components (heuristic based on names)
  const dataComponents = (content.match(/<(Chart|Graph|Table|Grid|List|Analytics|Stats|Card)/g) || []).length;

  // Count interactive components
  const interactiveComponents = (content.match(/<(Button|Input|Select|Switch|Slider|Form)/g) || []).length;

  return { elementCount, dataComponents, interactiveComponents };
}

function generateReport() {
  const files = scanDirectory(TARGET_DIR);
  let report = '# Teacher Dashboard Cognitive Load Audit\n\n';
  report += 'This report evaluates the information density and complexity of Teacher Dashboard components.\n\n';

  let highLoadCount = 0;

  files.forEach(file => {
    const analysis = analyzeFile(file);
    const relativePath = path.relative(process.cwd(), file);

    // Heuristic for high load: > 50 elements OR > 5 data components
    const isHighLoad = analysis.elementCount > 50 || analysis.dataComponents > 5;

    if (isHighLoad) {
      report += `## ${relativePath}\n`;
      report += `- **Visual Complexity**: ${analysis.elementCount} elements\n`;
      report += `- **Data Density**: ${analysis.dataComponents} data components\n`;
      report += `- **Interactivity**: ${analysis.interactiveComponents} interactive elements\n`;
      report += `- **Status**: ⚠️ High Cognitive Load\n\n`;
      highLoadCount++;
    }
  });

  if (highLoadCount === 0) {
    report += 'No high cognitive load components detected.\n';
  } else {
    report += `\n**Total High Load Components:** ${highLoadCount}\n`;
  }

  report += `\n## Optimization Recommendations
1.  **Progressive Disclosure**: Hide detailed data behind "Show More" toggles.
2.  **Dashboard Widgets**: Break complex views into smaller, reusable widget components.
3.  **Visual Hierarchy**: Ensure critical alerts (red) stand out against informational data (neutral).
`;

  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(`Report generated at ${OUTPUT_FILE}`);
}

generateReport();
