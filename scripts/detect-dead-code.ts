
import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');

// Helper to resolve aliases
function resolveImport(importPath: string, currentFile: string): string | null {
  // Remove query parameters or hash if any (though unlikely in imports)
  importPath = importPath.split('?')[0];

  if (importPath.startsWith('@/')) {
    return path.join(process.cwd(), 'src', importPath.substring(2));
  }
  if (importPath.startsWith('.')) {
    return path.resolve(path.dirname(currentFile), importPath);
  }
  return null; // Node module or absolute path we don't care about
}

// Helper to find file with extensions
function resolveFile(filePath: string): string | null {
  const extensions = ['.ts', '.tsx', '.d.ts', '/index.ts', '/index.tsx', '.js', '.jsx', '/index.js', '/index.jsx'];

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return filePath;
  }

  for (const ext of extensions) {
    const p = filePath + ext;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      return p;
    }
  }
  return null;
}

// Collect all files
function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

interface FileInfo {
  path: string;
  imports: string[];
}

const fileMap = new Map<string, FileInfo>();

function parseFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports: string[] = [];

  // Regex for imports
  // import ... from '...'
  const importFromRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
  // import '...'
  const importSideEffectRegex = /import\s+['"]([^'"]+)['"]/g;
  // require('...')
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  // dynamic import('...')
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  // export ... from '...'
  const exportFromRegex = /export\s+.*?from\s+['"]([^'"]+)['"]/g;

  const regexes = [importFromRegex, importSideEffectRegex, requireRegex, dynamicImportRegex, exportFromRegex];

  regexes.forEach(regex => {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const moduleSpecifier = match[1];
      const resolved = resolveImport(moduleSpecifier, filePath);
      if (resolved) {
        const actualFile = resolveFile(resolved);
        if (actualFile) {
          imports.push(actualFile);
        }
      }
    }
  });

  fileMap.set(filePath, { path: filePath, imports });
}

// 1. Build Graph
const allFiles = getAllFiles(SRC_DIR);
allFiles.forEach(f => parseFile(f));

// 2. Identify Entry Points
const entryPoints = allFiles.filter(f => {
  const rel = path.relative(SRC_DIR, f);
  // Next.js App Router
  if (rel.startsWith('app/') || rel.startsWith('app\\')) {
    const base = path.basename(f);
    if (['page.tsx', 'layout.tsx', 'route.ts', 'template.tsx', 'not-found.tsx', 'error.tsx', 'loading.tsx', 'global-error.tsx', 'default.tsx', 'sitemap.ts', 'robots.ts', 'manifest.ts'].includes(base)) return true;
    if (rel.includes('/actions/')) return true;
  }
  // Instrumentation and Middleware
  if (rel === 'instrumentation.ts') return true;
  if (rel === 'middleware.ts') return true;
  if (rel === 'sentry.client.config.ts') return true;
  if (rel === 'sentry.server.config.ts') return true;
  if (rel === 'sentry.edge.config.ts') return true;

  // Genkit
  if (rel === 'ai/dev.ts') return true;
  if (rel.includes('ml/inference/ml-bridge.ts')) return true;

  // Scripts logic (if scripts import src files directly, we might miss them if we don't count scripts as entry points,
  // but scripts are outside src usually.
  // Wait, if a script in root imports src/lib/x, and we only scan src, x might seem dead.
  // But typically scripts are dev-only.
  // However, the prompt asks for "Unused component detection" in "src/components, src/lib".
  // If only a script uses it, is it dead code for the *app*? Yes.
  // But strictly, it's used.
  // I will assume if it's only used by external scripts, it's effectively dead for the app bundle, but maybe useful utility.
  // I'll stick to scanning src.

  return false;
});

// 3. BFS to find reachable files
const reachableFiles = new Set<string>();
const queue = [...entryPoints];
entryPoints.forEach(f => reachableFiles.add(f));

while (queue.length > 0) {
  const current = queue.shift()!;
  const info = fileMap.get(current);
  if (!info) continue;

  for (const imp of info.imports) {
    if (!reachableFiles.has(imp)) {
      reachableFiles.add(imp);
      queue.push(imp);
    }
  }
}

// 4. Identify Dead Files (Unreachable) in components and lib
const deadFiles = allFiles.filter(f => {
  const rel = path.relative(SRC_DIR, f);
  // Normalize path separators
  const relNorm = rel.split(path.sep).join('/');
  const isInTarget = relNorm.startsWith('components/') || relNorm.startsWith('lib/');
  return isInTarget && !reachableFiles.has(f);
});

const reportPath = path.join(process.cwd(), 'DEAD_CODE_INVENTORY.md');
const reportContent = `# Dead Code Inventory

Generated on: ${new Date().toISOString()}

This report lists files in \`src/components\` and \`src/lib\` that are **never imported** by any entry point (Next.js pages, API routes, etc.).

**Total Unreachable Files:** ${deadFiles.length}

| File Path |
|---|
${deadFiles.map(f => `| \`${path.relative(process.cwd(), f)}\` |`).join('\n')}

## Analysis Method
1. **Entry Points:** \`page.tsx\`, \`layout.tsx\`, \`route.ts\`, \`actions/\`, \`instrumentation.ts\`, \`ai/dev.ts\`, Sentry configs.
2. **Graph Traversal:** Built import graph using Regex parsing (independent of TypeScript compiler).
3. **Reachability:** Marked all files reachable from entry points.
4. **Scope:** Only files in \`src/components\` and \`src/lib\` are reported as dead.
`;

fs.writeFileSync(reportPath, reportContent);
console.log(`Generated ${reportPath}`);
