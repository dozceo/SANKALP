import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

const FLOWS_DIR = 'src/ai/flows';

interface AuditResult {
  file: string;
  flowName?: string;
  findings: string[];
}

function auditFile(filePath: string): AuditResult {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const findings: string[] = [];
  let flowName = '';

  function visit(node: ts.Node) {
    // Check for ai.defineFlow
    if (ts.isCallExpression(node)) {
      const expression = node.expression;
      if (ts.isPropertyAccessExpression(expression) && expression.name.text === 'defineFlow') {
        // Found a flow definition
        const args = node.arguments;
        if (args.length > 0 && ts.isObjectLiteralExpression(args[0])) {
          const config = args[0] as ts.ObjectLiteralExpression;
          const nameProp = config.properties.find(p => p.name && (p.name as any).text === 'name');
          if (nameProp && ts.isPropertyAssignment(nameProp) && ts.isStringLiteral(nameProp.initializer)) {
            flowName = nameProp.initializer.text;
          }
        }
      }

      // Check for ai.generate with template literal prompt
      if (ts.isPropertyAccessExpression(expression) && expression.name.text === 'generate') {
         const args = node.arguments;
         if (args.length > 0 && ts.isObjectLiteralExpression(args[0])) {
             const config = args[0] as ts.ObjectLiteralExpression;
             const promptProp = config.properties.find(p => p.name && (p.name as any).text === 'prompt');
             if (promptProp && ts.isPropertyAssignment(promptProp)) {
                 if (ts.isTemplateExpression(promptProp.initializer)) {
                     findings.push(`High Risk: ai.generate uses template literal for prompt. Ensure inputs are sanitized.`);
                 } else if (ts.isBinaryExpression(promptProp.initializer)) {
                     findings.push(`High Risk: ai.generate uses string concatenation for prompt.`);
                 } else if (ts.isIdentifier(promptProp.initializer)) {
                     findings.push(`Medium Risk: ai.generate uses direct variable for prompt. Ensure variable is sanitized or safe.`);
                 }
             }
         }
      }

      // Check for ai.definePrompt with unescaped handlebars
      if (ts.isPropertyAccessExpression(expression) && expression.name.text === 'definePrompt') {
          const args = node.arguments;
          if (args.length > 0 && ts.isObjectLiteralExpression(args[0])) {
              const config = args[0] as ts.ObjectLiteralExpression;
              const promptProp = config.properties.find(p => p.name && (p.name as any).text === 'prompt');
              if (promptProp && ts.isPropertyAssignment(promptProp)) {
                  let promptText = '';
                  if (ts.isStringLiteral(promptProp.initializer) || ts.isNoSubstitutionTemplateLiteral(promptProp.initializer)) {
                      promptText = promptProp.initializer.text;
                  }

                  if (promptText.includes('{{{')) {
                      findings.push(`High Risk: ai.definePrompt uses triple braces {{{...}}} (Unescaped).`);
                  } else if (promptText.includes('{{')) {
                      findings.push(`Medium Risk: ai.definePrompt uses double braces {{...}}. Vulnerable to prompt injection if input contains instructions.`);
                  }
              }
          }
      }

       // Check for JSON.parse
      if (ts.isPropertyAccessExpression(expression) && expression.name.text === 'parse' && expression.expression.getText() === 'JSON') {
          findings.push(`Unsafe Parsing: JSON.parse detected. Ensure input is validated structure, not just string.`);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return { file: path.relative(process.cwd(), filePath), flowName, findings };
}

function main() {
  const files = fs.readdirSync(FLOWS_DIR).filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'));
  const results: AuditResult[] = [];

  for (const file of files) {
    results.push(auditFile(path.join(FLOWS_DIR, file)));
  }

  console.log(JSON.stringify(results, null, 2));
}

main();
