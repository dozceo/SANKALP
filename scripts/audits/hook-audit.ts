
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const REPORT_FILE = 'reports/hook-dependency-audit.md';
const TARGET_DIRS = ['src/app', 'src/components'];

interface HookViolation {
  filePath: string;
  line: number;
  hook: string;
  message: string;
}

function getAllFiles(dir: string, fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

function analyzeFile(filePath: string): HookViolation[] {
  const violations: HookViolation[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const expression = node.expression;
      let hookName = '';

      if (ts.isIdentifier(expression)) {
        hookName = expression.text;
      } else if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.name)) {
         // React.useEffect
         if (ts.isIdentifier(expression.expression) && expression.expression.text === 'React') {
             hookName = expression.name.text;
         }
      }

      if (['useEffect', 'useCallback', 'useMemo', 'useLayoutEffect'].includes(hookName)) {
        const args = node.arguments;
        const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;

        if (args.length === 0) {
            // Should not happen in valid TS mostly, but possible
             violations.push({
                filePath,
                line,
                hook: hookName,
                message: 'Called with no arguments.'
            });
        } else if (args.length === 1) {
            if (hookName === 'useEffect' || hookName === 'useLayoutEffect') {
                violations.push({
                    filePath,
                    line,
                    hook: hookName,
                    message: 'Missing dependency array. Effect will run on every render.'
                });
            } else {
                 violations.push({
                    filePath,
                    line,
                    hook: hookName,
                    message: 'Missing dependency array. Memoization will fail.'
                });
            }
        } else {
            // Check if second argument is an array literal
            const secondArg = args[1];
            if (!ts.isArrayLiteralExpression(secondArg)) {
                 // It might be a variable, which is valid but risky
                 // Or undefined/null
                 if (secondArg.kind !== ts.SyntaxKind.Identifier && secondArg.kind !== ts.SyntaxKind.CallExpression) { // Allow variables or function calls
                     // check for undefined/null/constants?
                 }
            } else {
                // Dependency array is literal []
                // We can't easily check for missing deps without scope analysis,
                // but we can check if it's empty and the body seems to use variables.
                // That's too complex for this script.
                // We'll stick to missing dependency array as the primary "correctness" check we can reliably do.
            }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

function generateReport() {
  console.log('Running static hook analysis...');

  let allViolations: HookViolation[] = [];

  TARGET_DIRS.forEach(dir => {
      const files = getAllFiles(dir);
      files.forEach(file => {
          allViolations = allViolations.concat(analyzeFile(file));
      });
  });

  let report = `# React Hook Dependency Audit\n\n**Date:** ${new Date().toISOString()}\n\n`;
  report += `> Note: This audit was performed using static AST analysis because the project's ESLint configuration is currently broken (dependency conflicts with ESLint 10). It primarily detects missing dependency arrays.\n\n`;

  if (allViolations.length > 0) {
      report += `Found **${allViolations.length}** issues.\n\n`;

      // Group by file
      const byFile: Record<string, HookViolation[]> = {};
      allViolations.forEach(v => {
          if (!byFile[v.filePath]) byFile[v.filePath] = [];
          byFile[v.filePath].push(v);
      });

      Object.entries(byFile).forEach(([file, issues]) => {
          report += `### \`${file}\`\n`;
          issues.forEach(v => {
              report += `- **Line ${v.line}**: \`${v.hook}\` - ${v.message}\n`;
          });
          report += `\n`;
      });
  } else {
      report += `No missing dependency arrays found in scanned directories.\n\n`;
  }

  const reportsDir = path.dirname(REPORT_FILE);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated: ${REPORT_FILE}`);
}

generateReport();
