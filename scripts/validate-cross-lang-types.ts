import fs from 'fs';
import path from 'path';

const TS_TYPES_PATH = 'src/ml/inference/types.ts';
const PY_SCRIPT_PATH = 'src/ml/inference/predict_mastery.py';
const OUTPUT_REPORT = 'CROSS_LANG_TYPE_REPORT.md';

function extractTSInterfaceProps(filepath: string, interfaceName: string): string[] {
  const content = fs.readFileSync(filepath, 'utf-8');
  // Simple regex to find interface block
  const interfaceRegex = new RegExp(`export interface ${interfaceName} \\{([^\\}]+)\\}`, 'm');
  const match = content.match(interfaceRegex);

  if (!match) return [];

  const block = match[1];
  // Extract keys: "key: type;" -> "key"
  const lines = block.split('\n');
  const props = lines
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('//'))
    .map(line => line.split(':')[0].trim())
    .filter(Boolean);

  return props;
}

function extractPythonDictKeys(filepath: string, dictName: string): string[] {
  const content = fs.readFileSync(filepath, 'utf-8');
  // Look for `features['key']` pattern or similar inside `predict_mastery` function or similar context
  // Or just scan for all `features['...']` usages since that's the input variable name in the script

  const regex = /features\['([^']+)'\]/g;
  const matches = [...content.matchAll(regex)];

  const keys = new Set<string>();
  matches.forEach(m => keys.add(m[1]));

  return Array.from(keys);
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
    report += `### defined in TS but unused in Python:\n`;
    missingInPy.forEach(p => report += `- \`${p}\`\n`);
  } else {
    report += `- No missing Python keys.\n`;
  }

  if (missingInTs.length > 0) {
    report += `### used in Python but missing in TS:\n`;
    missingInTs.forEach(p => report += `- \`${p}\`\n`);
  } else {
    report += `- No missing TS keys.\n`;
  }

  fs.writeFileSync(OUTPUT_REPORT, report);
  console.log(`Report generated at ${OUTPUT_REPORT}`);
}

const tsProps = extractTSInterfaceProps(TS_TYPES_PATH, 'MasteryPredictionInput');
const pyKeys = extractPythonDictKeys(PY_SCRIPT_PATH, 'features');

generateReport(tsProps, pyKeys);
