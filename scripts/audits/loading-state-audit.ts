
import fs from 'fs';
import path from 'path';

const APP_DIR = 'src/app';
const REPORT_FILE = 'reports/loading-ux-report.md';

interface PageLoadingInfo {
  path: string;
  hasLoadingFile: boolean;
  usesSuspense: boolean;
  usesSkeleton: boolean;
  isClientComponent: boolean;
}

function scanPages(dir: string, baseDir: string): PageLoadingInfo[] {
  let pages: PageLoadingInfo[] = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      pages = pages.concat(scanPages(filePath, baseDir));
    } else if (file === 'page.tsx' || file === 'page.js') {
      const loadingPath = path.join(dir, 'loading.tsx');
      const hasLoadingFile = fs.existsSync(loadingPath) || fs.existsSync(path.join(dir, 'loading.js'));

      const content = fs.readFileSync(filePath, 'utf-8');
      const usesSuspense = content.includes('<Suspense') || content.includes('Suspense');
      const usesSkeleton = content.includes('Skeleton') || content.includes('skeleton'); // heuristic
      const isClientComponent = content.includes('"use client"') || content.includes("'use client'");

      pages.push({
        path: filePath.replace(baseDir, ''),
        hasLoadingFile,
        usesSuspense,
        usesSkeleton,
        isClientComponent
      });
    }
  }
  return pages;
}

function generateReport() {
  console.log('Scanning for Loading States...');

  const pages = scanPages(APP_DIR, APP_DIR);

  let report = `# Loading UX Consistency Report\n\n**Date:** ${new Date().toISOString()}\n\n`;
  report += `Scanned **${pages.length}** pages in \`src/app\`.\n\n`;

  const withLoadingFile = pages.filter(p => p.hasLoadingFile);
  const withoutLoadingFile = pages.filter(p => !p.hasLoadingFile);
  const withInternalLoading = pages.filter(p => !p.hasLoadingFile && (p.usesSuspense || p.usesSkeleton));
  const totallyNaked = pages.filter(p => !p.hasLoadingFile && !p.usesSuspense && !p.usesSkeleton);

  report += `## Summary\n`;
  report += `- **Pages with \`loading.tsx\`:** ${withLoadingFile.length}\n`;
  report += `- **Pages with internal loading (Suspense/Skeleton) but no \`loading.tsx\`:** ${withInternalLoading.length}\n`;
  report += `- **Pages without evident loading state:** ${totallyNaked.length}\n\n`;

  if (totallyNaked.length > 0) {
      report += `## ⚠️ Pages Missing Loading UI\n`;
      report += `The following pages do not have a \`loading.tsx\` file and do not appear to use \`<Suspense>\` or \`<Skeleton>\` components internally. Use caution as these might show a blank screen during data fetching.\n\n`;
      totallyNaked.forEach(p => {
          report += `- \`${p.path}\` (${p.isClientComponent ? 'Client' : 'Server'})\n`;
      });
      report += `\n`;
  }

  if (withLoadingFile.length > 0) {
      report += `## ✅ Pages with \`loading.tsx\`\n`;
      withLoadingFile.forEach(p => report += `- \`${p.path}\`\n`);
      report += `\n`;
  }

  if (withInternalLoading.length > 0) {
      report += `## ℹ️ Pages with Internal Loading Logic\n`;
      report += `These pages lack \`loading.tsx\` but seem to handle loading internally.\n\n`;
      withInternalLoading.forEach(p => {
          report += `- \`${p.path}\` (Suspense: ${p.usesSuspense}, Skeleton: ${p.usesSkeleton})\n`;
      });
  }

  const reportsDir = path.dirname(REPORT_FILE);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated: ${REPORT_FILE}`);
}

generateReport();
