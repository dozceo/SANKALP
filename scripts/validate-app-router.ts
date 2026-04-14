
import * as fs from 'fs';
import * as path from 'path';

const APP_DIR = path.join(process.cwd(), 'src', 'app');

interface Issue {
  type: 'error' | 'warning';
  path: string;
  message: string;
}

const issues: Issue[] = [];

function getAllDirs(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results.push(filePath);
      results = results.concat(getAllDirs(filePath));
    }
  });
  return results;
}

function checkParallelRoute(dirPath: string) {
  const dirName = path.basename(dirPath);
  if (!dirName.startsWith('@')) return;

  const slotName = dirName.substring(1); // remove @
  const parentDir = path.dirname(dirPath);

  // Check 1: Parent layout must exist
  const layoutExtensions = ['.tsx', '.js', '.jsx', '.ts'];
  let layoutPath = '';
  for (const ext of layoutExtensions) {
    const p = path.join(parentDir, 'layout' + ext);
    if (fs.existsSync(p)) {
      layoutPath = p;
      break;
    }
  }

  if (!layoutPath) {
    issues.push({
      type: 'error',
      path: dirPath,
      message: `Parallel route ${dirName} has no layout in parent directory ${path.relative(process.cwd(), parentDir)}`
    });
    return;
  }

  // Check 2: Layout should accept the slot prop
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  // Simple regex to check if slotName is used in props destructuring or props usage
  // e.g. function Layout({ slotName, children })
  // or function Layout(props) { ... props.slotName }
  const regexDestructure = new RegExp(`\\{\\s*[^}]*\\b${slotName}\\b[^}]*\\}`);
  const regexUsage = new RegExp(`props\\.${slotName}\\b`);

  if (!regexDestructure.test(layoutContent) && !regexUsage.test(layoutContent)) {
     issues.push({
      type: 'warning',
      path: layoutPath,
      message: `Layout may not be using the parallel route slot '${slotName}'.`
    });
  }

  // Check 3: Check for page.tsx or default.tsx
  const hasPage = fs.existsSync(path.join(dirPath, 'page.tsx')) || fs.existsSync(path.join(dirPath, 'page.js'));
  const hasDefault = fs.existsSync(path.join(dirPath, 'default.tsx')) || fs.existsSync(path.join(dirPath, 'default.js'));

  if (!hasPage && !hasDefault) {
      issues.push({
          type: 'error',
          path: dirPath,
          message: `Parallel route ${dirName} must have a page.tsx or default.tsx.`
      });
  }
}

function checkInterceptingRoute(dirPath: string) {
    const dirName = path.basename(dirPath);
    // (.), (..), (...), (..)name
    if (!dirName.startsWith('(') || !dirName.includes('.')) return;

    // Simple check for intercepting route pattern
    const match = dirName.match(/^\((.+)\)(.+)$/);
    if (!match) return; // Maybe just a route group like (auth)

    // Wait, (auth) is a route group, not intercepting.
    // Intercepting starts with (.) or (..)
    if (!dirName.startsWith('(.)') && !dirName.startsWith('(..)') && !dirName.startsWith('(...)')) {
        return;
    }

    const modifier = match[1]; // . or .. or ...
    const targetName = match[2];

    // Resolve target path
    let targetPath: string | null = null;
    const parentDir = path.dirname(dirPath);

    if (modifier === '.') {
        // Sibling
        targetPath = path.join(parentDir, targetName);
    } else if (modifier === '..') {
        // Parent
        targetPath = path.join(parentDir, '..', targetName);
    } else if (modifier === '...') {
        // Root (app dir)
        targetPath = path.join(APP_DIR, targetName);
    }

    if (targetPath) {
        // Verify target exists (folder with page.tsx or just page.tsx?)
        // In App Router, routes are folders.
        if (!fs.existsSync(targetPath)) {
             issues.push({
                type: 'warning',
                path: dirPath,
                message: `Intercepting route ${dirName} targets ${path.relative(process.cwd(), targetPath)} which does not seem to exist.`
            });
        }
    }
}

function main() {
    console.log('Validating App Router structure...');
    if (!fs.existsSync(APP_DIR)) {
        console.error('src/app not found');
        return;
    }

    const allDirs = getAllDirs(APP_DIR);
    console.log(`Scanning ${allDirs.length} directories in src/app...`);

    for (const dir of allDirs) {
        checkParallelRoute(dir);
        checkInterceptingRoute(dir);
    }

    const reportPath = 'APP_ROUTER_VALIDATION_REPORT.md';
    let reportContent = `# App Router Validation Report

Generated on: ${new Date().toISOString()}

`;

    if (issues.length === 0) {
        reportContent += "No issues found in App Router structure.\n";
    } else {
        reportContent += "| Type | Path | Message |\n|---|---|---|\n";
        issues.forEach(i => {
            reportContent += `| ${i.type.toUpperCase()} | \`${path.relative(process.cwd(), i.path)}\` | ${i.message} |\n`;
        });
    }

    fs.writeFileSync(reportPath, reportContent);
    console.log(`Report generated at ${reportPath}`);
}

main();
