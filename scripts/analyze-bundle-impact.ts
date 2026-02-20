import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');
const REPORT_PATH = path.join(ROOT_DIR, 'reports/BUNDLE_SIZE_IMPACT_REPORT.md');

// List of known heavy libraries to monitor
const HEAVY_LIBS = [
  'framer-motion',
  'recharts',
  'firebase',
  'three',
  '@genkit-ai', // AI SDKs can be large
  'react-force-graph-2d', // Visualization
  'embla-carousel-react',
  'lucide-react'
];

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

function analyzeBundle() {
  const allFiles = getAllFiles(SRC_DIR, []);

  let report = `# Client-Side Bundle Size Impact Analysis

**Date:** ${new Date().toISOString()}

This report identifies usage of potentially large dependencies in client-side components and checks for lazy-loading opportunities.

| File | Heavy Dependency | Import Type | Lazy Loaded? | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
`;

  let issuesFound = 0;

  allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const isClientComponent = content.includes("'use client'") || content.includes('"use client"');

    // Only strictly care about client components for bundle size, though server components import cost affects build time/server load.
    // However, if a server component imports a heavy lib and passes it to a client component, or if the heavy lib is used in a shared way, it matters.
    // For this audit, we focus on where the import happens.

    HEAVY_LIBS.forEach(lib => {
      if (content.includes(`from '${lib}'`) || content.includes(`from "${lib}"`)) {

        // Check if dynamic import is used
        const isDynamic = content.includes(`dynamic(() => import('${lib}'))`) ||
                          content.includes(`dynamic(() => import("${lib}"))`);

        let recommendation = '✅ Optimized';
        let status = '✅';

        if (isClientComponent && !isDynamic) {
            // Recharts and Framer Motion are often candidates for lazy loading if they are below the fold
            if (lib === 'recharts' || lib === 'react-force-graph-2d' || lib === 'three') {
                recommendation = '⚠️ Consider `next/dynamic`';
                status = '❌ Static Import';
                issuesFound++;
            } else if (lib === 'firebase') {
                 recommendation = '⚠️ Ensure tree-shaking (import from subpaths)';
                 status = '⚠️ Check Subpaths';
                 issuesFound++;
            } else {
                recommendation = 'ℹ️ Verify usage';
                status = 'ℹ️ Static';
            }
        } else if (!isClientComponent) {
            status = 'Server Component';
            recommendation = 'N/A (Server)';
        }

        if (status !== 'Server Component') {
             const relativePath = path.relative(ROOT_DIR, file);
             report += `| \`${relativePath}\` | \`${lib}\` | ${isClientComponent ? 'Client' : 'Server'} | ${isDynamic ? '✅ Yes' : '❌ No'} | ${recommendation} |\n`;
        }
      }
    });
  });

  report += `\n## Summary\n\n- **Files Scanned:** ${allFiles.length}\n- **Potential Optimization Opportunities:** ${issuesFound}\n`;
  report += `\n## Recommendations\n
1. **Lazy Load Charts & Graphs:** Components using \`recharts\` or \`react-force-graph-2d\` should typically be loaded with \`next/dynamic\` to save initial bundle size.
2. **Firebase Tree Shaking:** Ensure imports are from \`firebase/firestore\`, \`firebase/auth\`, etc., rather than the root \`firebase\` package.
3. **Analyze 'use client':** Minimize the amount of code in client components. Move logic to server components where possible.
`;

  fs.writeFileSync(REPORT_PATH, report);
  console.log(`Report generated at ${REPORT_PATH}`);
}

analyzeBundle();
