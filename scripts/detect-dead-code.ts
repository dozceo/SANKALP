
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const LIB_DIR = path.join(SRC_DIR, 'lib');
const OUTPUT_FILE = path.join(process.cwd(), 'DEAD_CODE_INVENTORY.md');

// Heuristic regex to find exports
const EXPORT_REGEX = /export\s+(?:const|function|class|type|interface|enum)\s+([a-zA-Z0-9_]+)/g;
// Specific regex for default exports (harder to track by name, often file name is used)
// We will focus on named exports for now as default exports are usually imported with any name.
// However, for components, default export is common. We can use the file name as a proxy for the component name.

interface ExportItem {
  name: string;
  filePath: string;
  type: 'component' | 'lib';
}

function getAllFiles(dir: string, extension: string[] = ['.ts', '.tsx']): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, extension));
    } else {
      if (extension.includes(path.extname(file))) {
        results.push(filePath);
      }
    }
  });
  return results;
}

function getExports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const exports: string[] = [];
  let match;
  while ((match = EXPORT_REGEX.exec(content)) !== null) {
    exports.push(match[1]);
  }

  // Check for default export
  if (content.match(/export\s+default/)) {
    // changing logic: for default export, we assume the file name (without ext) is the "name" to search for
    const fileName = path.basename(filePath, path.extname(filePath));
    // If index.ts, use parent folder name
    if (fileName === 'index') {
       const parentDir = path.basename(path.dirname(filePath));
       exports.push(parentDir);
    } else {
       exports.push(fileName);
    }
  }

  return exports;
}

function checkUsage(exportName: string, definedInFile: string, allFiles: string[]): boolean {
  for (const file of allFiles) {
    if (file === definedInFile) continue; // Skip definition file
    const content = fs.readFileSync(file, 'utf-8');
    // Simple check: is the name present?
    // This can have false positives (comments, strings), but better than false negatives.
    // We try to match strictly as a word boundary to avoid partial matches
    const regex = new RegExp(`\\b${exportName}\\b`);
    if (regex.test(content)) {
      return true;
    }
  }
  return false;
}

async function main() {
  console.log('Starting Dead Code Detection...');

  const componentFiles = getAllFiles(COMPONENTS_DIR);
  const libFiles = getAllFiles(LIB_DIR);
  const allSourceFiles = getAllFiles(SRC_DIR);

  const inventory: ExportItem[] = [];

  // Analyze Components
  for (const file of componentFiles) {
    const exports = getExports(file);
    for (const exp of exports) {
      if (!checkUsage(exp, file, allSourceFiles)) {
        inventory.push({ name: exp, filePath: file, type: 'component' });
      }
    }
  }

  // Analyze Lib
  for (const file of libFiles) {
    const exports = getExports(file);
    for (const exp of exports) {
      if (!checkUsage(exp, file, allSourceFiles)) {
        inventory.push({ name: exp, filePath: file, type: 'lib' });
      }
    }
  }

  // Generate Report
  let report = `# Dead Code Inventory\n\nGenerated on: ${new Date().toISOString()}\n\n`;
  report += `This report lists exported components and utilities from \`src/components\` and \`src/lib\` that do not appear to be used elsewhere in the \`src\` directory. **Note:** This is a heuristic analysis (string search). Manual verification is recommended before deletion.\n\n`;

  if (inventory.length === 0) {
    report += `No dead code detected!\n`;
  } else {
    report += `## Potential Dead Code (${inventory.length} items)\n\n`;
    report += `| Type | Name | File Path |\n|---|---|---|\n`;
    inventory.forEach(item => {
      const relativePath = path.relative(process.cwd(), item.filePath);
      report += `| ${item.type} | \`${item.name}\` | \`${relativePath}\` |\n`;
    });
  }

  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(`Report generated at ${OUTPUT_FILE}`);
}

main().catch(console.error);
