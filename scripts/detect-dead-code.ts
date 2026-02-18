
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const LIB_DIR = path.join(SRC_DIR, 'lib');
const OUTPUT_FILE = path.join(process.cwd(), 'DEAD_CODE_INVENTORY.md');

// Heuristic regex to find exports
const EXPORT_REGEX = /export\s+(?:const|function|class|type|interface|enum)\s+([a-zA-Z0-9_]+)/g;
const EXPORT_BRACE_REGEX = /export\s+(?:type\s+)?\{([^}]+)\}/g;

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

  // 1. Direct exports: export const Foo ...
  while ((match = EXPORT_REGEX.exec(content)) !== null) {
    exports.push(match[1]);
  }

  // 2. Named exports block: export { Foo, Bar as Baz }
  while ((match = EXPORT_BRACE_REGEX.exec(content)) !== null) {
      const block = match[1];
      const items = block.split(',').map(s => s.trim()).filter(s => s);
      for (const item of items) {
          // specific case: export { type Foo }
          let cleanItem = item.replace(/^type\s+/, '');

          // Handle aliases: 'A as B'
          const parts = cleanItem.split(/\s+as\s+/);
          if (parts.length === 2) {
             exports.push(parts[1].trim());
          } else {
             exports.push(parts[0].trim());
          }
      }
  }

  // 3. Default export
  if (content.match(/export\s+default/)) {
    const fileName = path.basename(filePath, path.extname(filePath));
    if (fileName === 'index') {
       const parentDir = path.basename(path.dirname(filePath));
       exports.push(parentDir);
    } else {
       exports.push(fileName);
    }
  }

  return [...new Set(exports)]; // Remove duplicates
}

function checkUsage(exportName: string, definedInFile: string, allFiles: string[]): boolean {
  for (const file of allFiles) {
    if (file === definedInFile) continue;

    // Skip test files from checking usage (optional, but we probably want to know if code is ONLY used in tests)
    // For now, allow usage in tests to count as "used".

    const content = fs.readFileSync(file, 'utf-8');

    // Precise import check is hard with regex.
    // We stick to simple inclusion check but try to be a bit smarter.

    // Case 1: Import { exportName } from ...
    // Case 2: Import * as X ... X.exportName
    // Case 3: <exportName ... /> (JSX)
    // Case 4: Re-export: export { exportName } ...

    // To avoid matching substrings (e.g. "Card" in "CreditCard"), we use word boundaries.
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
    // Sort for consistency
    inventory.sort((a, b) => a.filePath.localeCompare(b.filePath) || a.name.localeCompare(b.name));

    inventory.forEach(item => {
      const relativePath = path.relative(process.cwd(), item.filePath);
      report += `| ${item.type} | \`${item.name}\` | \`${relativePath}\` |\n`;
    });
  }

  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(`Report generated at ${OUTPUT_FILE}`);
}

main().catch(console.error);
