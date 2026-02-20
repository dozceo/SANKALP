
import ts from 'typescript';
import fs from 'fs';
import path from 'path';

const FLOWS_DIR = path.join(process.cwd(), 'src/ai/flows');
const OUTPUT_FILE = path.join(process.cwd(), 'FLOW_VALIDATION_AUDIT.md');

interface AuditResult {
  file: string;
  flowName: string;
  inputSchemaStatus: 'STRONG' | 'WEAK' | 'UNKNOWN';
  inputSchemaIssues: string[];
  promptRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  promptIssues: string[];
}

function auditFile(filePath: string): AuditResult[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );

  const results: AuditResult[] = [];
  const schemaDefinitions = new Map<string, ts.CallExpression>();

  // 1. First pass: Collect Schema Definitions
  function collectSchemas(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      if (ts.isCallExpression(node.initializer)) {
        // simple check if it starts with z.
        const text = node.initializer.getText();
        if (text.startsWith('z.') || text.includes('z.object')) {
           schemaDefinitions.set(node.name.text, node.initializer);
        }
      }
    }
    ts.forEachChild(node, collectSchemas);
  }
  collectSchemas(sourceFile);

  // 2. Analyze Flows and Prompts
  function analyze(node: ts.Node) {
    // Check ai.defineFlow
    if (ts.isCallExpression(node) && node.expression.getText().endsWith('defineFlow')) {
       const args = node.arguments;
       if (args.length >= 1 && ts.isObjectLiteralExpression(args[0])) {
         const config = args[0];
         let flowName = 'anonymous';
         let inputSchemaNode: ts.Node | undefined;

         config.properties.forEach(prop => {
           if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
             if (prop.name.text === 'name') {
               flowName = prop.initializer.getText().replace(/['"]/g, '');
             }
             if (prop.name.text === 'inputSchema') {
               inputSchemaNode = prop.initializer;
             }
           }
         });

         const schemaIssues = analyzeSchema(inputSchemaNode, schemaDefinitions);

         // Prompt analysis in flow is tricky if it's dynamic.
         // We'll rely on global prompt analysis or check for ai.generate inside the flow body (args[1])
         const promptIssues: string[] = [];
         let promptRisk: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';

         // quick scan of the flow body for string interpolation in ai.generate
         if (args.length >= 2) {
            const body = args[1];

            function checkBodyForPrompts(n: ts.Node) {
                // Check for ai.generate call
                if (ts.isCallExpression(n)) {
                    const exprText = n.expression.getText();
                    if (exprText.includes('generate') || exprText.includes('ai.generate')) {
                        // Check arguments for prompt property
                        if (n.arguments.length > 0 && ts.isObjectLiteralExpression(n.arguments[0])) {
                            n.arguments[0].properties.forEach(prop => {
                                if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'prompt') {
                                    if (ts.isTemplateExpression(prop.initializer)) {
                                         promptRisk = 'HIGH';
                                         promptIssues.push('Critical: Direct Template Literal Injection (`${...}`) detected in `ai.generate` call.');
                                    }
                                }
                            });
                        }
                    }
                }
                ts.forEachChild(n, checkBodyForPrompts);
            }
            checkBodyForPrompts(body);
         }

         results.push({
           file: path.basename(filePath),
           flowName,
           inputSchemaStatus: schemaIssues.length > 0 ? 'WEAK' : 'STRONG',
           inputSchemaIssues: schemaIssues,
           promptRisk,
           promptIssues
         });
       }
    }

    // Check ai.definePrompt
    if (ts.isCallExpression(node) && node.expression.getText().endsWith('definePrompt')) {
        const args = node.arguments;
        if (args.length >= 1 && ts.isObjectLiteralExpression(args[0])) {
            const config = args[0];
            let promptName = 'anonymous';
            let promptText = '';
            let inputSchemaNode: ts.Node | undefined;

            config.properties.forEach(prop => {
                if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                    if (prop.name.text === 'name') {
                        promptName = prop.initializer.getText().replace(/['"]/g, '');
                    }
                    if (prop.name.text === 'prompt') {
                        // Check for Template Literal vs String Literal
                        if (ts.isNoSubstitutionTemplateLiteral(prop.initializer) || ts.isStringLiteral(prop.initializer)) {
                             promptText = prop.initializer.getText();
                        } else if (ts.isTemplateExpression(prop.initializer)) {
                             // This is a template literal with substitutions: `... ${var} ...`
                             // This is HIGH RISK for prompt injection if vars are user input
                             promptText = 'TEMPLATE_EXPRESSION';
                        }
                    }
                    if (prop.name.text === 'input') {
                        // nested schema: input: { schema: ... }
                        if (ts.isObjectLiteralExpression(prop.initializer)) {
                            prop.initializer.properties.forEach(p => {
                                if (ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'schema') {
                                    inputSchemaNode = p.initializer;
                                }
                            })
                        }
                    }
                }
            });

            // Re-analyze schema for the prompt specifically
            const schemaIssues = analyzeSchema(inputSchemaNode, schemaDefinitions);

            const promptIssues: string[] = [];
            let promptRisk: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';

            if (promptText === 'TEMPLATE_EXPRESSION') {
                promptRisk = 'HIGH';
                promptIssues.push('Direct Template Literal Injection (`${...}`) detected in prompt definition.');
            } else {
                if (promptText.includes('{{{')) {
                    promptRisk = 'MEDIUM';
                    promptIssues.push('Unescaped Handlebars usage (`{{{...}}}`). Ensure input is sanitized.');
                }
                // Check if {{...}} is used (safe)
            }

            results.push({
                file: path.basename(filePath),
                flowName: promptName + ' (Prompt)',
                inputSchemaStatus: schemaIssues.length > 0 ? 'WEAK' : 'STRONG',
                inputSchemaIssues: schemaIssues,
                promptRisk,
                promptIssues
            });
        }
    }

    ts.forEachChild(node, analyze);
  }

  analyze(sourceFile);
  return results;
}

function analyzeSchema(node: ts.Node | undefined, definitions: Map<string, ts.CallExpression>): string[] {
  if (!node) return ['Missing input schema'];

  let targetNode = node;
  if (ts.isIdentifier(node)) {
    const def = definitions.get(node.text);
    if (def) {
        targetNode = def;
    } else {
        return [`Schema definition '${node.text}' not found in file scope`];
    }
  }

  const issues: string[] = [];

  // Recursive function to check Zod chain
  function checkZodChain(n: ts.Node) {
      if (ts.isCallExpression(n)) {
          const text = n.getText(); // get full text of the chain so far

          // Check for z.string()
          if (text.includes('z.string()')) {
             // Check if constraints exist in the chain
             const hasMin = text.includes('.min(') || text.includes('.length(');
             const hasMax = text.includes('.max(') || text.includes('.length(');
             const hasRegex = text.includes('.regex(') || text.includes('.email(') || text.includes('.url(') || text.includes('.uuid(') || text.includes('.datetime(') || text.includes('.ip(');

             // We need to be careful. The text includes the whole chain.
             // If we have z.object({ a: z.string() }), the text of the outer object call contains "z.string()".
             // So we must process strictly the node that *is* the z.string() call or its parent chain.
             // This simple string check on the whole node is flawed for nested objects.
          }
      }
  }

  // Better approach: Traverse the schema definition
  function traverseSchema(n: ts.Node) {
      if (ts.isCallExpression(n)) {
          // Identify the "root" of this chain item.
          // e.g. z.string().min(5) -> expression is z.string().min

          // Detect "z.string()" usage
          // The structure of z.string().min(1) is Call(PropertyAccess(Call(PropertyAccess(z, string)), min), 1)

          // We look for the "z.string" call.
          // Then we walk up the parents to see what validates it.
      }
  }

  // Even better: text-based analysis of the schema node's text is robust enough if we split by fields for z.object

  // Logic:
  // 1. If it's z.object({...}), iterate properties.
  // 2. For each property, check if it's z.string() and if it has constraints.

  function validateNode(n: ts.Node, context: string = 'root') {
      if (ts.isCallExpression(n)) {
          // Check if it is z.object
          const expr = n.expression.getText();
          if (expr === 'z.object' || expr.endsWith('.object')) {
             if (n.arguments.length > 0 && ts.isObjectLiteralExpression(n.arguments[0])) {
                 n.arguments[0].properties.forEach(prop => {
                     if (ts.isPropertyAssignment(prop)) {
                         validateNode(prop.initializer, `${context}.${prop.name.getText()}`);
                     }
                 });
             }
             return;
          }

          // Check if it is z.string chain
          // We get the full text of the initializer for this property
          const fullText = n.getText();

          // Naive check: if it contains z.string() but NOT .max/.length/.email/.url/.uuid/.date
          // AND it's not inside a z.object (which we handle recursively above, but here we are at the leaf)

          if (fullText.includes('z.string()')) {
              // It is a string schema. Check for constraints.
              const constraints = ['.max(', '.length(', '.email(', '.url(', '.uuid(', '.cuid(', '.datetime(', '.ip(', '.regex('];
              const hasConstraint = constraints.some(c => fullText.includes(c));

              if (!hasConstraint) {
                  issues.push(`Field '${context}': Unbounded string. Add .max() or specific validation.`);
              }
          }
      }
  }

  validateNode(targetNode);

  return issues;
}


async function main() {
  if (!fs.existsSync(FLOWS_DIR)) {
    console.error(`Directory not found: ${FLOWS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(FLOWS_DIR).filter(f => f.endsWith('.ts'));
  let report = `# Genkit Flow Input Schema Validation Completeness Report

**Domain:** Engineering Core
**Scope:** src/ai/flows/
**Method:** AST Analysis (TypeScript Compiler API)
**Date:** ${new Date().toISOString().split('T')[0]}

## Executive Summary
This report validates strict input validation in Genkit flows. It checks for unbounded strings (DoS risk) and unsafe prompt construction (Injection risk).

## Detailed Findings

| File | Flow/Prompt | Validation Status | Prompt Risk | Issues |
| :--- | :--- | :--- | :--- | :--- |
`;

  let totalIssues = 0;

  for (const file of files) {
    const results = auditFile(path.join(FLOWS_DIR, file));
    for (const res of results) {
        const issues = [...res.inputSchemaIssues, ...res.promptIssues];
        totalIssues += issues.length;

        const issueList = issues.length > 0 ? `<ul><li>${issues.join('</li><li>')}</li></ul>` : 'None';

        const valIcon = res.inputSchemaStatus === 'STRONG' ? '✅' : '⚠️';
        const promptIcon = res.promptRisk === 'LOW' ? '✅' : (res.promptRisk === 'MEDIUM' ? '🟠' : '🔴');

        report += `| \`${res.file}\` | **${res.flowName}** | ${valIcon} ${res.inputSchemaStatus} | ${promptIcon} ${res.promptRisk} | ${issueList} |\n`;
    }
  }

  report += `
## Vulnerability Legend
- **Unbounded String**: \`z.string()\` without \`.max()\` allows potentially infinite input, leading to DoS or cost spikes.
- **Direct Template Literal**: \`\${input}\` in prompts is a critical injection vulnerability.
- **Unescaped Handlebars**: \`{{{input}}}\` bypasses HTML escaping. Use with caution or sanitize input.

## Conclusion
${totalIssues === 0 ? '✅ All flows passed validation.' : `⚠️ Found ${totalIssues} issues requiring remediation.`}
`;

  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(`Report generated at ${OUTPUT_FILE}`);
}

main().catch(console.error);
