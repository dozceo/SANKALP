
import * as fs from 'fs';
import * as path from 'path';

const APP_DIR = 'src/app';
const COMPONENTS_DIR = 'src/components';
const REPORT_FILE = 'ERROR_BOUNDARY_COVERAGE.md';

interface RouteSegment {
  path: string;
  hasErrorFile: boolean;
  hasLayoutFile: boolean;
  hasPageFile: boolean;
  children: RouteSegment[];
}

function scanAppDir(dir: string, basePath: string = ''): RouteSegment {
  const segment: RouteSegment = {
    path: basePath || '/',
    hasErrorFile: false,
    hasLayoutFile: false,
    hasPageFile: false,
    children: []
  };

  if (!fs.existsSync(dir)) return segment;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && !entry.name.startsWith('_')) { // Skip hidden/private folders
        const childPath = path.join(dir, entry.name);
        // Determine if it's a route segment (contains page.tsx, layout.tsx, or error.tsx)
        // Actually recursive scan is better.
        const childSegment = scanAppDir(childPath, path.join(basePath, entry.name));
        if (childSegment.hasPageFile || childSegment.hasLayoutFile || childSegment.children.length > 0) {
          segment.children.push(childSegment);
        }
      }
    } else {
      if (entry.name === 'error.tsx' || entry.name === 'error.js') segment.hasErrorFile = true;
      if (entry.name === 'layout.tsx' || entry.name === 'layout.js') segment.hasLayoutFile = true;
      if (entry.name === 'page.tsx' || entry.name === 'page.js') segment.hasPageFile = true;
    }
  }

  return segment;
}

function findErrorBoundaryUsage(dir: string): string[] {
  let usages: string[] = [];

  if (!fs.existsSync(dir)) return usages;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      usages = usages.concat(findErrorBoundaryUsage(fullPath));
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('<ErrorBoundary') || content.includes('ErrorBoundary')) {
        usages.push(fullPath);
      }
    }
  }
  return usages;
}

function generateReport() {
  console.log('Scanning for Error Boundaries...');

  const rootSegment = scanAppDir(APP_DIR);
  const componentUsages = findErrorBoundaryUsage(COMPONENTS_DIR);

  let reportContent = `# Error Boundary Coverage Report

## Executive Summary
Audit of error handling coverage using Next.js \`error.tsx\` files and React \`<ErrorBoundary>\` components.

## App Router Coverage (error.tsx)

| Route Segment | Has error.tsx | Effective Coverage |
|---|---|---|
`;

  // Flatten segments for table
  function traverse(seg: RouteSegment, parentHasError: boolean) {
    const isCovered = seg.hasErrorFile || parentHasError;
    // Only list segments that have a page or layout
    if (seg.hasPageFile || seg.hasLayoutFile) {
       reportContent += `| \`${seg.path}\` | ${seg.hasErrorFile ? '✅' : '❌'} | ${isCovered ? '✅' : '❌'} |\n`;
    }

    seg.children.forEach(child => traverse(child, isCovered));
  }

  traverse(rootSegment, false);

  reportContent += `\n## Component-Level Usage (<ErrorBoundary>)

Found ${componentUsages.length} usages in components:

`;

  if (componentUsages.length === 0) {
    reportContent += "No usage of `<ErrorBoundary>` found in components.\n";
  } else {
    componentUsages.forEach(file => {
      reportContent += `- \`${path.relative(process.cwd(), file)}\`\n`;
    });
  }

  reportContent += `\n## Recommendations

1. **Add Global Error Boundary:** Ensure the root \`src/app/error.tsx\` or \`src/app/global-error.tsx\` exists to catch root layout errors.
2. **Segment-Level Handling:** Add \`error.tsx\` to critical feature roots (e.g. \`/(main)\` or \`/dashboard\`) to isolate failures.
3. **Component Wrappers:** Wrap unstable widgets (like charts or AI outputs) in local \`<ErrorBoundary>\` to prevent page crashes.
`;

  fs.writeFileSync(REPORT_FILE, reportContent);
  console.log(`Report generated: ${REPORT_FILE}`);
}

generateReport();
