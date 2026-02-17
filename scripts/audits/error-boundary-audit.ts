
import fs from 'fs';
import path from 'path';

const APP_DIR = 'src/app';
const REPORT_FILE = 'reports/error-boundary-coverage.md';

interface PageInfo {
  path: string;
  hasErrorBoundary: boolean;
  boundaryPath?: string;
}

function findErrorBoundary(dir: string, baseDir: string): string | null {
  // Check current dir
  if (fs.existsSync(path.join(dir, 'error.tsx')) || fs.existsSync(path.join(dir, 'error.js'))) {
    return path.join(dir, 'error.tsx'); // Simplified return
  }
  // Check parent until baseDir
  const parent = path.dirname(dir);
  if (parent.length >= baseDir.length && parent.startsWith(baseDir)) {
      if (fs.existsSync(path.join(parent, 'error.tsx')) || fs.existsSync(path.join(parent, 'error.js'))) {
          return path.join(parent, 'error.tsx');
      }
      // Continue up
      return findErrorBoundary(parent, baseDir);
  }
  // Check for global-error only at root app dir
  if (dir === baseDir) {
       if (fs.existsSync(path.join(dir, 'global-error.tsx')) || fs.existsSync(path.join(dir, 'global-error.js'))) {
          return path.join(dir, 'global-error.tsx');
      }
  }
  return null;
}

function scanPages(dir: string, baseDir: string): PageInfo[] {
  let pages: PageInfo[] = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      pages = pages.concat(scanPages(filePath, baseDir));
    } else if (file === 'page.tsx' || file === 'page.js') {
      const boundary = findErrorBoundary(dir, baseDir);
      pages.push({
        path: filePath.replace(baseDir, ''),
        hasErrorBoundary: !!boundary,
        boundaryPath: boundary ? boundary.replace(baseDir, '') : undefined
      });
    }
  }
  return pages;
}

function generateReport() {
  console.log('Scanning for Error Boundaries...');

  const pages = scanPages(APP_DIR, APP_DIR);

  let report = `# Error Boundary Coverage Report\n\n**Date:** ${new Date().toISOString()}\n\n`;
  report += `Scanned **${pages.length}** pages in \`src/app\`.\n\n`;

  const covered = pages.filter(p => p.hasErrorBoundary);
  const uncovered = pages.filter(p => !p.hasErrorBoundary);

  const coveragePercent = ((covered.length / pages.length) * 100).toFixed(1);

  report += `## Summary\n`;
  report += `- **Coverage:** ${coveragePercent}%\n`;
  report += `- **Protected Pages:** ${covered.length}\n`;
  report += `- **Unprotected Pages:** ${uncovered.length}\n\n`;

  if (uncovered.length > 0) {
      report += `## ⚠️ Unprotected Pages\n`;
      report += `The following pages do not have a specific \`error.tsx\` in their directory or parent directory (excluding global error handlers if not found via standard traversal).\n\n`;
      uncovered.forEach(p => {
          report += `- \`${p.path}\`\n`;
      });
      report += `\n**Recommendation:** Add \`error.tsx\` to these routes or their parent layouts to handle runtime errors gracefully.\n`;
  } else {
      report += `## ✅ All pages are covered by Error Boundaries!\n`;
  }

  if (covered.length > 0) {
      report += `\n## Protected Pages (Sample)\n`;
      covered.slice(0, 10).forEach(p => {
          report += `- \`${p.path}\` (covered by \`${p.boundaryPath}\`)\n`;
      });
      if (covered.length > 10) report += `... and ${covered.length - 10} more.\n`;
  }

  const reportsDir = path.dirname(REPORT_FILE);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated: ${REPORT_FILE}`);
}

generateReport();
