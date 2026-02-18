import fs from 'fs';
import path from 'path';

const TS_TYPES_PATH = 'src/ml/inference/types.ts';
const PY_SCRIPT_PATH = 'src/ml/inference/predict_mastery.py';
const OUTPUT_REPORT = 'CROSS_LANG_TYPE_REPORT.md';

function extractTSInterfaceProps(filepath: string, interfaceName: string): string[] {
  try {
      const content = fs.readFileSync(filepath, 'utf-8');
      // Regex to capture the block inside "export interface InterfaceName { ... }"
      // It handles multiline content.
      const interfaceRegex = new RegExp(`export interface ${interfaceName} \\{([\\s\\S]*?)\\}`);
      const match = content.match(interfaceRegex);

      if (!match) {
          console.error(`Interface ${interfaceName} not found in ${filepath}`);
          return [];
      }

      const block = match[1];
      const props = block.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*'))
        .map(line => {
            // "key: type;" -> "key"
            // "key?: type;" -> "key"
            const parts = line.split(':');
            if (parts.length > 0) {
                return parts[0].replace('?', '').trim();
            }
            return null;
        })
        .filter(Boolean) as string[];

      return props;
  } catch (e) {
      console.error(`Error reading TS file: ${e}`);
      return [];
  }
}

function extractPythonDictKeys(filepath: string): string[] {
  try {
      const content = fs.readFileSync(filepath, 'utf-8');
      // Look for `features['key']` pattern
      // We assume the input variable is named `features` based on inspection of predict_mastery.py
      const regex = /features\['([^']+)'\]/g;
      const matches = [...content.matchAll(regex)];

      const keys = new Set<string>();
      matches.forEach(m => keys.add(m[1]));

      return Array.from(keys);
  } catch (e) {
      console.error(`Error reading Python file: ${e}`);
      return [];
  }
}

function generateReport(tsProps: string[], pyKeys: string[]) {
  const tsSet = new Set(tsProps);
  const pySet = new Set(pyKeys);

  const missingInPy = tsProps.filter(p => !pySet.has(p));
  const missingInTs = pyKeys.filter(p => !tsSet.has(p));

  let report = `# Cross-Language Type Safety Report\n\nGenerated on: ${new Date().toISOString()}\n\n`;

  report += `## Summary\n`;
  if (missingInPy.length === 0 && missingInTs.length === 0) {
    report += `✅ **SUCCESS**: TypeScript interface and Python usage are fully synchronized.\n\n`;
  } else {
    report += `❌ **FAILURE**: Type definition mismatch detected.\n\n`;
  }

  report += `### TypeScript Interface (MasteryPredictionInput)\n`;
  tsProps.forEach(p => report += `- \`${p}\`\n`);

  report += `\n### Python Script Usage (predict_mastery.py)\n`;
  pyKeys.forEach(p => report += `- \`${p}\`\n`);

  report += `\n## Discrepancies\n`;

  if (missingInPy.length > 0) {
    report += `### Defined in TS but unused in Python (Potential Over-fetching):\n`;
    missingInPy.forEach(p => report += `- \`${p}\`\n`);
  } else {
    report += `- No missing Python keys.\n`;
  }

  if (missingInTs.length > 0) {
    report += `### Used in Python but missing in TS (Runtime Error Risk):\n`;
    missingInTs.forEach(p => report += `- \`${p}\`\n`);
  } else {
    report += `- No missing TS keys.\n`;
  }

  fs.writeFileSync(OUTPUT_REPORT, report);
  console.log(`Report generated at ${OUTPUT_REPORT}`);
}

const tsProps = extractTSInterfaceProps(TS_TYPES_PATH, 'MasteryPredictionInput');
const pyKeys = extractPythonDictKeys(PY_SCRIPT_PATH);

if (tsProps.length === 0) {
    console.error('No TS properties found. Check regex or file content.');
}
if (pyKeys.length === 0) {
    console.error('No Python keys found. Check regex or file content.');
}

generateReport(tsProps, pyKeys);
