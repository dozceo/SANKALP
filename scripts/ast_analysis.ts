import ts from 'typescript';
import fs from 'fs';
import path from 'path';

const TARGET_DIRS = ['src/app', 'src/components'];

interface HookAnalysis {
  file: string;
  line: number;
  hook: string;
  deps: string[] | null; // null means no dependency array provided
}

interface StrictAnalysis {
  file: string;
  line: number;
  type: 'any' | 'non-null-assertion' | 'ts-ignore' | 'ts-expect-error';
}

const hookResults: HookAnalysis[] = [];
const strictResults: StrictAnalysis[] = [];

function analyzeFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  function visit(node: ts.Node) {
    // Hooks Analysis
    if (ts.isCallExpression(node)) {
      const expression = node.expression;
      if (ts.isIdentifier(expression)) {
        const name = expression.text;
        if (['useEffect', 'useCallback', 'useMemo'].includes(name)) {
          const args = node.arguments;
          let deps: string[] | null = null;

          if (args.length > 1) {
            const depsArg = args[1];
            if (ts.isArrayLiteralExpression(depsArg)) {
              deps = depsArg.elements.map(e => e.getText(sourceFile));
            } else {
               // Dependency is not an array literal (e.g. variable), treat as present but unknown content
               deps = ['<dynamic>'];
            }
          }

          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          hookResults.push({
            file: filePath,
            line: line + 1,
            hook: name,
            deps,
          });
        }
      }
    }

    // Strict Mode Analysis
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      strictResults.push({
        file: filePath,
        line: line + 1,
        type: 'any',
      });
    }

    if (ts.isNonNullExpression(node)) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      strictResults.push({
        file: filePath,
        line: line + 1,
        type: 'non-null-assertion',
      });
    }

    // Check for comments (ts-ignore, ts-expect-error)
    // Comments are leading trivia, handled separately usually, but we can scan full text or ranges.
    // However, TypeScript AST doesn't visit comments by default.
    // We can do a simple regex check on the file content for comments, or use getLeadingCommentRanges.
    // For simplicity and speed, I'll do regex on file content for comments since they are not strictly AST nodes.

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  // Comment check (Regex based for simplicity)
  const lines = content.split('\n');
  lines.forEach((lineText, idx) => {
      if (lineText.includes('@ts-ignore')) {
          strictResults.push({ file: filePath, line: idx + 1, type: 'ts-ignore' });
      }
      if (lineText.includes('@ts-expect-error')) {
          strictResults.push({ file: filePath, line: idx + 1, type: 'ts-expect-error' });
      }
  });
}

function walk(dir: string) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      analyzeFile(fullPath);
    }
  }
}

function main() {
  for (const dir of TARGET_DIRS) {
    walk(dir);
  }

  console.log(JSON.stringify({
    hooks: hookResults,
    strict: strictResults
  }, null, 2));
}

main();
