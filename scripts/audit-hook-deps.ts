
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const REPORT_FILE = 'HOOK_DEPENDENCY_AUDIT.md';

interface HookIssue {
  file: string;
  line: number;
  hook: string;
  message: string;
}

function scanFile(filePath: string): HookIssue[] {
  const issues: HookIssue[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const expr = node.expression;
      if (ts.isIdentifier(expr) && (expr.text === 'useEffect' || expr.text === 'useCallback' || expr.text === 'useMemo')) {
        // Check arguments
        if (node.arguments.length < 2) {
          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          issues.push({
            file: filePath,
            line: line + 1,
            hook: expr.text,
            message: 'Missing dependency array. This hook will run on every render.'
          });
        } else {
          const deps = node.arguments[1];
          if (ts.isArrayLiteralExpression(deps)) {
            // Check if empty
            if (deps.elements.length === 0) {
              // Valid usually, but strict mode might want verification
            } else {
              // Has deps. We can't easily validate them without full type checking/scope analysis
              // which requires a full program, not just source file.
              // So we skip validating content for now to avoid false positives.
            }
          } else {
             // Dependency argument is not an array literal (e.g. variable)
             const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
             issues.push({
               file: filePath,
               line: line + 1,
               hook: expr.text,
               message: 'Dependency array is not a literal array. Verify it is stable.'
             });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return issues;
}

function scanDir(dir: string): HookIssue[] {
  let issues: HookIssue[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        issues = issues.concat(scanDir(fullPath));
      }
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      issues = issues.concat(scanFile(fullPath));
    }
  }
  return issues;
}

function generateReport() {
  console.log('Scanning for React hooks...');

  const srcIssues = scanDir('src');

  let reportContent = `# React Hook Dependency Audit

## Executive Summary
Audit of React hooks (\`useEffect\`, \`useCallback\`, \`useMemo\`) using AST analysis.
Note: ESLint execution failed due to environment configuration issues, so this audit relies on static AST analysis to detect missing dependency arrays and non-literal dependencies.

## Findings

`;

  if (srcIssues.length === 0) {
    reportContent += "No obvious hook dependency violations found (missing arrays).\n";
  } else {
    reportContent += `Found ${srcIssues.length} potential issues:\n\n`;
    reportContent += `| File | Line | Hook | Issue |\n|---|---|---|---|\n`;

    srcIssues.forEach(issue => {
      const relativeFile = path.relative(process.cwd(), issue.file);
      reportContent += `| \`${relativeFile}\` | ${issue.line} | \`${issue.hook}\` | ${issue.message} |\n`;
    });
  }

  reportContent += `\n\n## Recommendations

1. **Add Dependency Arrays:** Ensure all effects have a dependency array (even if empty \`[]\`) to prevent infinite loops or performance issues.
2. **Verify Dynamic Dependencies:** When passing variables as the dependency array, ensure they are memoized or stable.
3. **Use ESLint:** Fix the project's ESLint configuration to enable \`react-hooks/exhaustive-deps\` for deep dependency verification.
`;

  fs.writeFileSync(REPORT_FILE, reportContent);
  console.log(`Report generated: ${REPORT_FILE}`);
}

generateReport();
