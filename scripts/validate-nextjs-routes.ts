
import fs from 'fs';
import path from 'path';

/**
 * Next.js App Router Validation Script
 *
 * Validates the `src/app` directory structure for Next.js App Router conventions.
 * Checks for parallel route configuration (missing `default.tsx`) and potential URL path conflicts.
 *
 * Usage:
 *   npx tsx scripts/validate-nextjs-routes.ts
 *
 * Exits with code 1 if critical issues (Error level) are found.
 */

const APP_DIR = path.join(process.cwd(), 'src/app');
const OUTPUT_FILE = path.join(process.cwd(), 'ROUTE_CONFIG_HEALTH_REPORT.md');

interface RouteIssue {
  type: 'Error' | 'Warning';
  message: string;
  path: string;
}

interface RouteNode {
  name: string;
  fullPath: string;
  isGroup: boolean;
  isParallel: boolean;
  isIntercepting: boolean;
  children: RouteNode[];
  hasPage: boolean;
  hasLayout: boolean;
  hasDefault: boolean;
}

/**
 * Recursively scans the directory to build a RouteNode tree.
 */
function scanRoutes(dir: string): RouteNode {
  const name = path.basename(dir);
  const node: RouteNode = {
    name,
    fullPath: dir,
    isGroup: name.startsWith('(') && name.endsWith(')'),
    isParallel: name.startsWith('@'),
    isIntercepting: name.startsWith('(') && (name.includes('.') || name.includes('..')),
    children: [],
    hasPage: false,
    hasLayout: false,
    hasDefault: false,
  };

  try {
    if (fs.existsSync(path.join(dir, 'page.tsx')) || fs.existsSync(path.join(dir, 'page.ts'))) {
      node.hasPage = true;
    }
    if (fs.existsSync(path.join(dir, 'layout.tsx')) || fs.existsSync(path.join(dir, 'layout.ts'))) {
      node.hasLayout = true;
    }
    if (fs.existsSync(path.join(dir, 'default.tsx')) || fs.existsSync(path.join(dir, 'default.ts'))) {
      node.hasDefault = true;
    }

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      if (fs.statSync(itemPath).isDirectory()) {
        node.children.push(scanRoutes(itemPath));
      }
    }
  } catch (err) {
    console.error(`Error scanning directory ${dir}:`, err);
  }
  return node;
}

/**
 * Validates individual route nodes for structural correctness.
 */
function validateRoutes(node: RouteNode, parentPath: string = ''): RouteIssue[] {
  const issues: RouteIssue[] = [];

  // Validate Parallel Routes
  if (node.isParallel) {
    if (!node.hasDefault) {
       issues.push({
         type: 'Warning',
         message: `Parallel route slot missing \`default.tsx\`. This may cause 404 errors on hard navigation if the slot state is undefined.`,
         path: node.fullPath
       });
    }
  }

  // Validate Route Groups (Check for layout isolation if intended, simplistic check)
  if (node.isGroup && node.hasLayout && !node.hasPage) {
     // A group with layout but no page often implies shared layout for children.
     // Not strictly an issue, but worth noting structure.
  }

  // Check for Conflicting Paths
  // We need to flatten the structure to see actual URL paths.
  // This requires a separate pass or accumulation.

  for (const child of node.children) {
    issues.push(...validateRoutes(child, node.fullPath));
  }

  return issues;
}

function getEffectivePath(node: RouteNode, parentEffectivePath: string = ''): string[] {
    let currentPath = parentEffectivePath;
    if (!node.isGroup && !node.isParallel && !node.isIntercepting && node.name !== 'app') { // simplistic exclusion of 'app' root
        currentPath = path.join(currentPath, node.name);
    }

    let paths: string[] = [];
    if (node.hasPage) {
        paths.push(currentPath);
    }

    for (const child of node.children) {
        paths = paths.concat(getEffectivePath(child, currentPath));
    }
    return paths;
}

/**
 * Checks for URL path conflicts caused by route groups.
 */
function checkPathConflicts(root: RouteNode): RouteIssue[] {
    const issues: RouteIssue[] = [];
    // Map effective path -> original source path(s)
    const pathMap = new Map<string, string[]>();

    function traverse(node: RouteNode, currentUrl: string) {
        let nextUrl = currentUrl;
        if (!node.isGroup && !node.isParallel && !node.isIntercepting && node.name !== 'src' && node.name !== 'app') {
            nextUrl = path.join(currentUrl, node.name);
        }

        if (node.hasPage) {
            const existing = pathMap.get(nextUrl) || [];
            existing.push(node.fullPath);
            pathMap.set(nextUrl, existing);
        }

        for (const child of node.children) {
            traverse(child, nextUrl);
        }
    }

    traverse(root, '/');

    for (const [url, sources] of pathMap.entries()) {
        if (sources.length > 1) {
            issues.push({
                type: 'Error',
                message: `URL Path Conflict: The URL \`${url}\` is defined by multiple pages: ${sources.join(', ')}`,
                path: sources[0] // just pick one for location
            });
        }
    }

    return issues;
}


function main() {
  console.log('Starting Route Validation...');
  try {
    const root = scanRoutes(APP_DIR);
    const issues = validateRoutes(root);
    const conflicts = checkPathConflicts(root);

    const allIssues = [...issues, ...conflicts];

    let report = `# Route Configuration Health Report\n\nGenerated on: ${new Date().toISOString()}\n\n`;

    if (allIssues.length === 0) {
        report += `## ✅ No Issues Found\n\nAll routes appear to be configured correctly according to standard Next.js patterns.\n`;
        console.log('✅ No route configuration issues found.');
    } else {
        report += `## ⚠️ Issues Found (${allIssues.length})\n\n`;
        report += `| Severity | Message | Location |\n|---|---|---|\n`;
        allIssues.forEach(issue => {
            const relativePath = path.relative(process.cwd(), issue.path);
            report += `| **${issue.type}** | ${issue.message} | \`${relativePath}\` |\n`;
        });
        console.warn(`⚠️ Found ${allIssues.length} route configuration issues. See ${OUTPUT_FILE} for details.`);
    }

    fs.writeFileSync(OUTPUT_FILE, report);
    console.log(`Report generated at ${OUTPUT_FILE}`);

    // Exit with code 1 only if there are 'Error' level issues (conflicts)
    const criticalErrors = allIssues.filter(i => i.type === 'Error');
    if (criticalErrors.length > 0) {
        console.error(`❌ Found ${criticalErrors.length} critical route conflicts. Exiting with error.`);
        process.exit(1);
    }

  } catch (err) {
    console.error('Unhandled error during validation:', err);
    process.exit(1);
  }
}

main();
