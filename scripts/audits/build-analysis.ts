
import fs from 'fs';
import path from 'path';

const REPORT_FILE = 'reports/build-performance-report.md';
const BUILD_OUTPUT_FILE = 'build_output.txt';

function generateReport() {
  console.log('Generating build report from ' + BUILD_OUTPUT_FILE);

  let output = '';
  try {
    output = fs.readFileSync(BUILD_OUTPUT_FILE, 'utf-8');
  } catch (e) {
    console.error('Could not read build output file:', e);
    return;
  }

  let report = `# Build Time Optimization Report\n\n**Date:** ${new Date().toISOString()}\n\n`;

  report += `## Build Summary\n\n`;

  // Extract "Route (app)" table
  const lines = output.split('\n');
  let tableLines: string[] = [];
  let capturing = false;

  lines.forEach(line => {
    if (line.includes('Route (app)') || line.includes('First Load JS')) {
      capturing = true;
    }
    if (capturing) {
        // Stop if we hit empty lines after some content
        if (line.trim() === '' && tableLines.length > 5) {
             // check next few lines
        }
        tableLines.push(line);
    }
  });

  // Clean up table lines
  // Find where the table ends
  const endIdx = tableLines.findIndex((l, i) => i > 2 && l.trim() === '' && !tableLines[i+1]?.includes('First Load JS'));
  // The output format has a footer about chunks.
  const footerIdx = tableLines.findIndex(l => l.includes('First Load JS shared by all'));

  let displayLines = tableLines;
  if (footerIdx !== -1) {
      // Keep up to footer + some lines
      // Let's just keep everything captured until a big break
  }

  if (tableLines.length > 0) {
    report += `### Page Sizes\n\n\`\`\`\n${tableLines.join('\n')}\n\`\`\`\n\n`;
  } else {
    report += `Could not parse build output table.\n\n`;
  }

  // Check for large pages
  const largePages = lines.filter(l => l.includes('kB') && !l.includes('chunks/') && parseInt(l.match(/(\d+) kB/)?.[0] || '0') > 150 && l.includes('/'));
  // Improved regex needed because First Load JS is at the end
  // Line format: ├ ○ /                                        3.09 kB         210 kB
  // We want the last number (First Load JS)

  const reallyLargePages = lines.filter(l => {
      const parts = l.split(/\s{2,}/);
      const lastPart = parts[parts.length - 1];
      if (lastPart && lastPart.includes('kB')) {
          const size = parseInt(lastPart);
          return size > 150;
      }
      return false;
  }).map(l => l.trim());

  if (reallyLargePages.length > 0) {
    report += `### ⚠️ Large Pages Detected (>150kB First Load JS)\n\n`;
    reallyLargePages.forEach(l => report += `- \`${l}\`\n`);
    report += `\n**Recommendation:** Use dynamic imports or code splitting for these routes.\n\n`;
  }

  report += `## Recommendations\n`;
  report += `1. **Enable Build Traces:** Add \`experimental: { turbotrace: {} }\` or checks in \`next.config.ts\` for deeper analysis.\n`;
  report += `2. **Linting/Type Checking:** Currently disabled in \`next.config.ts\` (\`ignoreBuildErrors: true\`). Enabling these might catch issues early but increase build time.\n`;
  report += `3. **Caching:** Ensure \`.next/cache\` is preserved between builds in CI/CD.\n`;

  const reportsDir = path.dirname(REPORT_FILE);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated: ${REPORT_FILE}`);
}

generateReport();
