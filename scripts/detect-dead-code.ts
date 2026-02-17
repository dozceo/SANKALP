
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const SRC_DIR = path.join(process.cwd(), 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const LIB_DIR = path.join(SRC_DIR, 'lib');

interface ExportInfo {
  name: string;
  type: 'named' | 'default';
  filePath: string;
}

function getAllFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

function getExports(filePath: string): ExportInfo[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );

  const exports: ExportInfo[] = [];

  ts.forEachChild(sourceFile, node => {
    if (ts.isExportAssignment(node)) {
      exports.push({ name: 'default', type: 'default', filePath });
    } else if (ts.isExportDeclaration(node)) {
      // export { x } from ...
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        node.exportClause.elements.forEach(element => {
          exports.push({ name: element.name.text, type: 'named', filePath });
        });
      }
    } else if (
      (ts.isFunctionDeclaration(node) ||
        ts.isClassDeclaration(node) ||
        ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isVariableStatement(node) ||
        ts.isEnumDeclaration(node)) &&
      node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      if (ts.isVariableStatement(node)) {
        node.declarationList.declarations.forEach(decl => {
          if (ts.isIdentifier(decl.name)) {
            exports.push({ name: decl.name.text, type: 'named', filePath });
          }
        });
      } else if ('name' in node && node.name && ts.isIdentifier(node.name as any)) {
        exports.push({ name: (node.name as any).text, type: 'named', filePath });
      }
    }
  });

  return exports;
}

function isUsed(exportInfo: ExportInfo, allFiles: string[]): boolean {
  // If default export, check if file is imported
  // If named export, check if name is imported

  // Naive check: search for string in other files.
  // For default export, we look for the filename being imported.
  // This is hard because of relative paths.
  // Instead, for default export, we can look for `from '.../filename'` or `from '.../filename.ts'` (without ext usually)

  const fileNameBase = path.basename(exportInfo.filePath, path.extname(exportInfo.filePath));

  // We'll iterate all other files
  for (const file of allFiles) {
    if (file === exportInfo.filePath) continue;

    const content = fs.readFileSync(file, 'utf-8');

    if (exportInfo.type === 'default') {
        // Check for import of the file
        // This is a heuristic. We check if the file name (without extension) appears in an import statement.
        // Or strictly, we can check if the path is resolved. But we can't easily resolve paths here without a full compiler host.
        // So we will just look for the filename in quotes.
        // e.g. import X from './path/to/file';
        // pattern: /['"]\.[./]*\/filename['"]/

        // Simpler: just check if the filename appears in the content? No, too many false positives.
        // Let's assume standard import syntax.
        // We look for the file basename in '...' or "..."
        if (content.includes(`/${fileNameBase}'`) || content.includes(`/${fileNameBase}"`)) {
            return true;
        }
    } else {
      // Named export
      // Check for `import { ... name ... }` or `import { name as alias }`
      // Or `import * as X ... X.name`

      // Simple text search for the name.
      // We must ensure it's not a local variable with same name.
      // But for "dead code inventory", false positives (saying it IS used when it's just a local var) are safer than false negatives (saying unused when it IS used).
      // Wait, false positive = "Used" -> we don't list it. Code remains. Safe.
      // False negative = "Unused" -> we list it. User deletes it. Code breaks. Unsafe.
      // So we want to be conservative: if we see the name, assume used.

      // Regex to match whole word
      const regex = new RegExp(`\\b${exportInfo.name}\\b`);
      if (regex.test(content)) {
        return true;
      }
    }
  }

  return false;
}

async function main() {
  console.log('Scanning for files...');
  const componentFiles = getAllFiles(COMPONENTS_DIR);
  const libFiles = getAllFiles(LIB_DIR);
  const targetFiles = [...componentFiles, ...libFiles];

  const allSrcFiles = getAllFiles(SRC_DIR);

  console.log(`Found ${targetFiles.length} files to analyze in components/ and lib/.`);
  console.log(`Total source files: ${allSrcFiles.length}`);

  const unusedExports: ExportInfo[] = [];

  for (const file of targetFiles) {
    const exports = getExports(file);
    for (const exp of exports) {
      if (!isUsed(exp, allSrcFiles)) {
        unusedExports.push(exp);
      }
    }
  }

  const reportPath = 'DEAD_CODE_REPORT.md';
  const reportContent = `# Dead Code Inventory

Generated on: ${new Date().toISOString()}

The following exports in \`src/components\` and \`src/lib\` appear to be unused.
**Note:** This is a heuristic scan. Verify before deleting.

| File | Export Type | Name |
|------|-------------|------|
${unusedExports.map(e => `| \`${path.relative(process.cwd(), e.filePath)}\` | ${e.type} | \`${e.name}\` |`).join('\n')}

${unusedExports.length === 0 ? 'No unused exports found.' : ''}
`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`Report generated at ${reportPath}`);
}

main().catch(console.error);
