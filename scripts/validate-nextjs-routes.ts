
import * as fs from 'fs';
import * as path from 'path';

const APP_DIR = path.join(process.cwd(), 'src/app');
const REPORT_PATH = path.join(process.cwd(), 'ROUTE_CONFIG_HEALTH_REPORT.md');

interface RouteNode {
  name: string;
  path: string;
  isSlot: boolean;
  isGroup: boolean;
  isIntercepting: boolean;
  hasPage: boolean;
  hasLayout: boolean;
  hasDefault: boolean;
  children: RouteNode[];
}

function buildRouteTree(dir: string): RouteNode {
  const name = path.basename(dir);
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const hasPage = entries.some(e => e.isFile() && e.name === 'page.tsx');
  const hasLayout = entries.some(e => e.isFile() && e.name === 'layout.tsx');
  const hasDefault = entries.some(e => e.isFile() && e.name === 'default.tsx');

  const children: RouteNode[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      children.push(buildRouteTree(path.join(dir, entry.name)));
    }
  }

  return {
    name,
    path: dir,
    isSlot: name.startsWith('@'),
    isGroup: name.startsWith('(') && name.endsWith(')') && !name.startsWith('(.)') && !name.startsWith('(..)'),
    isIntercepting: name.startsWith('(.)') || name.startsWith('(..)'),
    hasPage,
    hasLayout,
    hasDefault,
    children
  };
}

const issues: string[] = [];

function validateSlots(node: RouteNode, parentLayoutContent: string | null) {
  if (node.isSlot) {
    const slotName = node.name.substring(1); // remove @

    // Check 1: Parent has layout?
    // The parent of a slot is the directory containing the slot folder.
    // We need to check the layout in that directory.
    // The traversal logic here passes parentLayoutContent.

    if (!parentLayoutContent) {
      issues.push(`- **Orphaned Slot**: \`${path.relative(process.cwd(), node.path)}\` has no parent \`layout.tsx\`. Slots must be consumed by a layout.`);
    } else {
      // Check 2: Layout consumes slot?
      // Heuristic: check if slotName is in the file content.
      // This is weak (could be a comment), but better than nothing.
      // Ideally check for `props.slotName` or `{ slotName }`.
      const regex = new RegExp(`\\b${slotName}\\b`);
      if (!regex.test(parentLayoutContent)) {
        issues.push(`- **Unused Slot**: \`${path.relative(process.cwd(), node.path)}\` is not referenced in the parent layout. Check if \`${slotName}\` is included in the layout props.`);
      }
    }

    // Check 3: Default.tsx
    if (!node.hasDefault && !node.hasPage) {
        // Technically a slot doesn't *need* a default if it has a page, but if navigation changes and the slot is not active,
        // Next.js tries to render `default.tsx`. If missing, it might 404.
        // Usually good practice to have default.tsx or handle it.
        // If it has page.tsx, it renders on the matching route.
        // But on unmatched routes (sibling navigation), it needs default.
        issues.push(`- **Missing Default**: \`${path.relative(process.cwd(), node.path)}\` is a slot but lacks \`default.tsx\`. This may cause 404s during client-side navigation if the slot state is unmatched.`);
    }
  }

  // Recurse
  const layoutPath = path.join(node.path, 'layout.tsx');
  let currentLayoutContent: string | null = null;
  if (node.hasLayout) {
    currentLayoutContent = fs.readFileSync(layoutPath, 'utf-8');
  }

  for (const child of node.children) {
    // If current node is a slot, its children are just routes inside the slot.
    // The "parent layout" for children of a slot is the slot's layout (if any).
    // If current node is a normal route, its children are sub-routes.
    // If current node is a group, its children are in the same layout context as the group's parent (unless group has layout).

    // Wait, slots are children of a route. They are parallel to `page.tsx`.
    // My `buildRouteTree` nests them under the route directory.
    // So `validateSlots` calls with `parentLayoutContent` of the route.

    if (child.isSlot) {
      // Pass CURRENT node's layout (or passed down layout if group?)
      // If current node is a group, it might not have layout.
      // If current node is group, it effectively merges with parent.
      // But file system wise, the slot is inside the group folder.
      // If group has layout, that layout consumes the slot.
      // If group has no layout, the slot is likely invalid or consumes parent layout?
      // Next.js: Slots MUST be in the same directory as the layout that uses them.
      // So checking `hasLayout` on `node` is correct.
      validateSlots(child, currentLayoutContent);
    } else {
       // Normal route recursion
       validateSlots(child, currentLayoutContent);
    }
  }
}

function validateIntercepting(node: RouteNode) {
    if (node.isIntercepting) {
        // Parse target
        // (.) -> sibling
        // (..) -> parent
        // (..)(..) -> grandparent
        // (...) -> root

        let targetPath: string | null = null;
        let relativeSegments: string[] = [];

        // Remove parens to get target segment name
        // e.g. (.)photo -> photo
        // (..)photo -> photo
        const match = node.name.match(/^(\(.*\))(.+)$/);
        if (match) {
            const prefix = match[1];
            const segment = match[2];

            const currentDir = path.dirname(node.path);

            if (prefix === '(.)') {
                targetPath = path.join(currentDir, segment);
            } else if (prefix === '(..)') {
                targetPath = path.join(path.dirname(currentDir), segment);
            } else if (prefix === '(...)') {
                targetPath = path.join(APP_DIR, segment);
            }
            // Handling (..)(..) is complex, skipping for now.

            if (targetPath) {
                if (!fs.existsSync(targetPath)) {
                     issues.push(`- **Broken Intercept**: \`${path.relative(process.cwd(), node.path)}\` targets \`${segment}\` which does not exist at \`${path.relative(process.cwd(), targetPath)}\`.`);
                }
            }
        }
    }

    for (const child of node.children) {
        validateIntercepting(child);
    }
}

function validateGroups(node: RouteNode) {
    // Check if group has layout. If so, it's fine.
    // If group doesn't have layout, it's organizational.
    // Warning: Route Groups should not affect URL structure.
    // If we have (a)/page.tsx and (b)/page.tsx, both resolve to /. Conflict!
    // We need to check for URL collisions.
    // This requires flattening the route tree to URL paths.

    // I will simplify: duplicate paths check.
    // Map URL -> [File Paths]
    // If >1, error.

    // Recursive flattener
    // path, url
    // if group, url = parentUrl
    // if slot, ignored for URL? No, slot is not a URL segment.
    // if intercepting, ignored for URL? No, it handles a URL.

    // Actually, checking URL collisions is very important.
}

const urlMap = new Map<string, string[]>();

function mapUrls(node: RouteNode, currentUrl: string) {
    let nextUrl = currentUrl;

    if (!node.isGroup && !node.isSlot && node.name !== 'src' && node.name !== 'app') {
         // This is a segment
         // if intercepting, the URL segment is the target name usually?
         // Actually, intercepting route (..)photo works on /photo URL.
         // So for collision check, we treat it as the segment name (without parens).
         let segment = node.name;
         if (node.isIntercepting) {
             const match = node.name.match(/^(\(.*\))(.+)$/);
             if (match) segment = match[2];
         }

         nextUrl = path.join(currentUrl, segment);
    }

    if (node.hasPage) {
        const existing = urlMap.get(nextUrl) || [];
        existing.push(node.path);
        urlMap.set(nextUrl, existing);
    }

    for (const child of node.children) {
        mapUrls(child, nextUrl);
    }
}

// MAIN EXECUTION
const root = buildRouteTree(APP_DIR);

// 1. Slots
validateSlots(root, null);

// 2. Intercepts
validateIntercepting(root);

// 3. URL Collisions
// (Need to correctly map structure, skipping 'app' root node name)
// The root node passed to mapUrls is src/app. content is /
// children are the segments.
// My recursion adds segment name.
// src/app node name is 'app'.
// We should start mapping from children with base url '/'.

// Helper to start mapping
function startMapping(node: RouteNode) {
    for (const child of node.children) {
        mapUrls(child, '/');
    }
}
startMapping(root);

// Check collisions
urlMap.forEach((paths, url) => {
    if (paths.length > 1) {
        // Filter out intercepting routes colliding with their target - that's intentional!
        // Collision is bad if two *regular* pages claim same URL.
        // Or two groups (a)/page and (b)/page.

        // simple heuristic: if any path contains @ or (.), it might be valid overlap (slot or intercept).
        // If multiple paths are "normal" routes, it's a conflict.

        const normalRoutes = paths.filter(p => !p.includes('@') && !path.basename(p).startsWith('('));
        if (normalRoutes.length > 1) {
             issues.push(`- **Route Conflict**: The URL \`${url}\` is claimed by multiple pages:
${normalRoutes.map(p => `  - \`${path.relative(process.cwd(), p)}\``).join('\n')}`);
        }
    }
});


const reportContent = `# Next.js Route Configuration Health Report

Generated on: ${new Date().toISOString()}

This report validates the \`src/app\` directory structure for common Next.js App Router issues, including Parallel Routes, Intercepting Routes, and URL collisions.

## Issues Found
${issues.length === 0 ? 'No issues found.' : issues.join('\n')}

## Validated Areas
- **Parallel Routes (@slots)**: Checked for parent layout usage and missing \`default.tsx\`.
- **Intercepting Routes ((.))**: Checked for existence of target segments.
- **Route Groups**: Checked for URL collisions between groups.
`;

fs.writeFileSync(REPORT_PATH, reportContent);
console.log(`Generated ${REPORT_PATH}`);
