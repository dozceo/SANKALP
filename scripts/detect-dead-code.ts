
import fs from 'fs';
import path from 'path';

/**
 * Dead Code Detection Script
 *
 * Scans `src/components` and `src/lib` for exported entities (functions, classes, consts)
 * and checks if they are imported/used elsewhere in the `src` directory.
 *
 * Usage:
 *   npx tsx scripts/detect-dead-code.ts [--strict]
 *
 * Flags:
 *   --strict: Exit with code 1 if any potential dead code is found. Useful for CI.
 */

const SRC_DIR = path.join(process.cwd(), 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const LIB_DIR = path.join(SRC_DIR, 'lib');
const OUTPUT_FILE = path.join(process.cwd(), 'DEAD_CODE_INVENTORY.md');

// Heuristic regex to find exports
const EXPORT_REGEX = /export\s+(?:const|function|class|type|interface|enum)\s+([a-zA-Z0-9_]+)/g;

interface ExportItem {
  name: string;
  filePath: string;
  type: 'component' | 'lib';
}

/**
 * Recursively find all files in a directory with specific extensions.
 */
function getAllFiles(dir: string, extension: string[] = ['.ts', '.tsx']): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  try {
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
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
  }
  return results;
}

/**
 * Extract exported names from a file.
 */
function getExports(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const exports: string[] = [];
    let match;
    while ((match = EXPORT_REGEX.exec(content)) !== null) {
      exports.push(match[1]);
    }

    // Check for default export
    if (content.match(/export\s+default/)) {
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
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return [];
  }
}

/**
 * Check if an exported name is used in any file other than its definition.
 */
function checkUsage(exportName: string, definedInFile: string, allFiles: string[]): boolean {
  for (const file of allFiles) {
    if (file === definedInFile) continue; // Skip definition file
    try {
      const content = fs.readFileSync(file, 'utf-8');
      // strict word boundary check to avoid partial matches
      const regex = new RegExp(`\\b${exportName}\\b`);
      if (regex.test(content)) {
        return true;
      }
    } catch (err) {
        // file might have been deleted or moved during scan
        continue;
    }
  }
  return false;
}

async function main() {
  console.log('Starting Dead Code Detection...');
  const isStrict = process.argv.includes('--strict');

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
    console.log('✅ No dead code detected.');
  } else {
    report += `## Potential Dead Code (${inventory.length} items)\n\n`;
    report += `| Type | Name | File Path |\n|---|---|---|\n`;
    inventory.forEach(item => {
      const relativePath = path.relative(process.cwd(), item.filePath);
      report += `| ${item.type} | \`${item.name}\` | \`${relativePath}\` |\n`;
    });
    console.warn(`⚠️ Found ${inventory.length} potential dead code items. See ${OUTPUT_FILE} for details.`);
  }

  try {
    fs.writeFileSync(OUTPUT_FILE, report);
    console.log(`Report generated at ${OUTPUT_FILE}`);
  } catch (err) {
    console.error(`Error writing report to ${OUTPUT_FILE}:`, err);
    process.exit(1);
  }

  if (isStrict && inventory.length > 0) {
      console.error('❌ Strict mode enabled: Exiting with error due to detected dead code.');
      process.exit(1);
  }
}

main().catch((err) => {
    console.error('Unhandled error in script:', err);
    process.exit(1);
});
