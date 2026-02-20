
import * as fs from 'fs';
import * as path from 'path';

const APP_DIR = 'src/app';
const COMPONENTS_DIR = 'src/components';
const REPORT_FILE = 'LOADING_STATE_CONSISTENCY.md';

interface LoadingFeature {
  file: string;
  hasLoadingProp: boolean;
  hasSkeleton: boolean;
  hasLoaderIcon: boolean;
}

function scanAppLoading(dir: string): string[] {
  let loadingFiles: string[] = [];
  if (!fs.existsSync(dir)) return loadingFiles;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      loadingFiles = loadingFiles.concat(scanAppLoading(fullPath));
    } else if (entry.name === 'loading.tsx' || entry.name === 'loading.js') {
      loadingFiles.push(fullPath);
    }
  }
  return loadingFiles;
}

function scanComponents(dir: string): LoadingFeature[] {
  let features: LoadingFeature[] = [];
  if (!fs.existsSync(dir)) return features;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      features = features.concat(scanComponents(fullPath));
    } else if (entry.name.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const hasLoadingProp = /isLoading|isSubmitting|loading/.test(content);
      const hasSkeleton = /Skeleton/.test(content);
      const hasLoaderIcon = /Loader2|Spinner/.test(content);

      if (hasLoadingProp || hasSkeleton || hasLoaderIcon) {
        features.push({
          file: fullPath,
          hasLoadingProp,
          hasSkeleton,
          hasLoaderIcon
        });
      }
    }
  }
  return features;
}

function generateReport() {
  console.log('Scanning for loading states...');

  const loadingFiles = scanAppLoading(APP_DIR);
  const componentFeatures = scanComponents(COMPONENTS_DIR);

  let reportContent = `# Loading State & Skeleton Screen Consistency Report

## Executive Summary
Audit of loading UX implementation, checking for Next.js \`loading.tsx\` files and component-level loading states (spinners vs skeletons).

## App Router Loading (loading.tsx)

Found ${loadingFiles.length} \`loading.tsx\` files.

`;

  if (loadingFiles.length === 0) {
    reportContent += "No `loading.tsx` files found in `src/app`. Users may see blank screens during navigation.\n";
  } else {
    loadingFiles.forEach(file => {
      reportContent += `- \`${path.relative(process.cwd(), file)}\`\n`;
    });
  }

  reportContent += `\n## Component Loading States

Found ${componentFeatures.length} components with loading logic.

| Component | \`isLoading\` Logic | Uses Skeleton | Uses Spinner |
|---|---|---|---|
`;

  componentFeatures.forEach(feat => {
    const relativeFile = path.relative(process.cwd(), feat.file);
    reportContent += `| \`${relativeFile}\` | ${feat.hasLoadingProp ? '✅' : '-'} | ${feat.hasSkeleton ? '✅' : '-'} | ${feat.hasLoaderIcon ? '✅' : '-'} |\n`;
  });

  // Analysis
  const skeletonCount = componentFeatures.filter(f => f.hasSkeleton).length;
  const spinnerCount = componentFeatures.filter(f => f.hasLoaderIcon).length;

  reportContent += `\n### UX Consistency Analysis

- **Skeleton Usage:** ${skeletonCount} components (${Math.round(skeletonCount / componentFeatures.length * 100)}%)
- **Spinner Usage:** ${spinnerCount} components (${Math.round(spinnerCount / componentFeatures.length * 100)}%)

`;

  if (skeletonCount < spinnerCount) {
    reportContent += "**Observation:** Spinners are more common than skeletons. Consider migrating to skeletons for reduced layout shift and better perceived performance.\n";
  }

  reportContent += `\n## Recommendations

1. **Implement \`loading.tsx\`:** Add loading UI for main route segments (e.g. \`/(main)/dashboard\`) to support streaming.
2. **Prefer Skeletons:** Replace full-screen spinners with Skeleton loaders that mimic the content layout.
3. **Standardize Props:** Ensure all data-fetching components accept an \`isLoading\` prop or handle loading internally.
`;

  fs.writeFileSync(REPORT_FILE, reportContent);
  console.log(`Report generated: ${REPORT_FILE}`);
}

generateReport();
