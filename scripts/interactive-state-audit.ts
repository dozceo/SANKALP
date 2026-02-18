import fs from 'fs';
import path from 'path';

const TARGET_DIRS = ['src/components'];
const OUTPUT_FILE = 'interaction-feedback-gap-report.md';

interface Gap {
  file: string;
  element: string;
  line: number;
  missingStates: string[];
}

const gaps: Gap[] = [];

// Helper to check if a class string has state modifiers
function checkStates(classString: string, required: string[]): string[] {
  const missing: string[] = [];

  required.forEach(state => {
    let hasState = false;
    // Check standard tailwind modifiers
    if (classString.includes(`${state}:`)) hasState = true;

    // Synonyms
    if (state === 'focus') {
      if (classString.includes('focus-visible:') || classString.includes('focus-within:')) hasState = true;
    }
    if (state === 'disabled') {
      if (classString.includes('aria-disabled:') || classString.includes('data-[disabled]') || classString.includes('disabled:')) hasState = true;
      // Also check if opacity is reduced which implies disabled state visual
      if (classString.includes('opacity-')) hasState = true; // weak check but maybe
    }
    if (state === 'checked') {
        if (classString.includes('data-[state=checked]') || classString.includes('aria-checked')) hasState = true;
    }

    if (!hasState) missing.push(state);
  });

  return missing;
}

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const isUiComponent = filePath.includes('src/components/ui/');
  const fileName = path.basename(filePath, '.tsx');

  // 1. Check UI Component definitions (in src/components/ui)
  if (isUiComponent) {
    // Heuristic: Check if the whole file (or cva definition) contains state modifiers
    // This assumes the component is implemented in this file
    // Mapping filename to requirements
    let requirements: string[] = [];
    if (fileName === 'button') requirements = ['hover', 'focus', 'disabled'];
    else if (fileName === 'input') requirements = ['focus', 'disabled'];
    else if (fileName === 'textarea') requirements = ['focus', 'disabled'];
    else if (fileName === 'select') requirements = ['focus', 'disabled'];
    else if (fileName === 'checkbox') requirements = ['focus', 'disabled', 'checked'];
    else if (fileName === 'switch') requirements = ['focus', 'disabled', 'checked'];

    if (requirements.length > 0) {
        // Simple check: scan entire content for these states
        const missing = checkStates(content, requirements);
        if (missing.length > 0) {
            gaps.push({
                file: filePath,
                element: fileName,
                line: 1,
                missingStates: missing
            });
        }
    }
    return;
  }

  // 2. Check Raw HTML usage in other components
  const tagRegex = /<(button|a|input|textarea|select)\s+[^>]*className=["']([^"']+)["'][^>]*>/g;
  let match;

  while ((match = tagRegex.exec(content)) !== null) {
    const tag = match[1];
    const classes = match[2];
    const index = match.index;
    const lineNumber = content.substring(0, index).split('\n').length;

    let reqs: string[] = [];
    if (tag === 'button') reqs = ['hover', 'focus', 'disabled'];
    if (tag === 'a') reqs = ['hover', 'focus'];
    if (tag === 'input') reqs = ['focus', 'disabled'];
    if (tag === 'textarea') reqs = ['focus', 'disabled'];
    if (tag === 'select') reqs = ['focus', 'disabled'];

    const missing = checkStates(classes, reqs);
    if (missing.length > 0) {
        gaps.push({
            file: filePath,
            element: `<${tag}>`,
            line: lineNumber,
            missingStates: missing
        });
    }
  }
}

function traverseDir(dir: string) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDir(fullPath);
    } else if (file.endsWith('.tsx')) {
      scanFile(fullPath);
    }
  });
}

TARGET_DIRS.forEach(dir => traverseDir(dir));

// Generate Report
let report = `# Interaction Feedback Gap Report

Audit of interactive components for missing visual feedback states (hover, focus, disabled).

Total gaps found: ${gaps.length}

| File | Element | Line | Missing States |
| :--- | :--- | :--- | :--- |
${gaps.map(g => `| \`${g.file}\` | \`${g.element}\` | ${g.line} | ${g.missingStates.join(', ')} |`).join('\n')}

## Notes
- **UI Library (\`src/components/ui/\`)**: Checked for presence of state modifiers in the file definition.
- **Component Usage**: Checked for raw HTML tags (\`<button>\`, \`<a>\`, \`<input>\`) usage with inline Tailwind classes.
- **States Checked**:
  - Button: \`hover\`, \`focus\`, \`disabled\`
  - Link: \`hover\`, \`focus\`
  - Input/Textarea/Select: \`focus\`, \`disabled\`
  - Checkbox/Switch: \`focus\`, \`disabled\`, \`checked\`
`;

fs.writeFileSync(OUTPUT_FILE, report);
console.log(`Report generated: ${OUTPUT_FILE}`);
