
import fs from 'fs';
import path from 'path';

const TARGET_DIRS = ['src/components'];
const OUTPUT_FILE = 'reports/INTERACTION_FEEDBACK_GAP_REPORT.md';

interface Gap {
  file: string;
  element: string;
  line: number;
  missingStates: string[];
}

const gaps: Gap[] = [];
let totalComponentsChecked = 0;

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
      if (classString.includes('opacity-')) hasState = true;
    }
    if (state === 'checked') {
        if (classString.includes('data-[state=checked]') || classString.includes('aria-checked')) hasState = true;
    }

    // Loading state is often handled via disabled state visually, but let's check if there's any indication of loading handling in code?
    // Hard to check visually via static analysis. We assume `disabled` covers loading interaction blocking.

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
    let requirements: string[] = [];
    if (fileName === 'button') requirements = ['hover', 'focus', 'disabled'];
    else if (fileName === 'input') requirements = ['focus', 'disabled'];
    else if (fileName === 'textarea') requirements = ['focus', 'disabled'];
    else if (fileName === 'select') requirements = ['focus', 'disabled'];
    else if (fileName === 'checkbox') requirements = ['focus', 'disabled', 'checked'];
    else if (fileName === 'switch') requirements = ['focus', 'disabled', 'checked'];

    if (requirements.length > 0) {
        totalComponentsChecked++;
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

    if (reqs.length > 0) {
        totalComponentsChecked++;
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

## Executive Summary
Audit of interactive components for missing visual feedback states (hover, focus, disabled).

- **Total Elements Checked**: ${totalComponentsChecked}
- **Gaps Found**: ${gaps.length}

## Recommendations
1. **Ensure Visual Feedback**: All interactive elements must show visual changes on hover, focus, and disabled states.
2. **Use UI Components**: Prefer using \`src/components/ui\` components (Button, Input) which handle these states centrally, rather than raw HTML tags.
3. **Check Accessibility**: Ensure focus states are visible for keyboard navigation.

## Detailed Gaps
| File | Element | Line | Missing States |
| :--- | :--- | :--- | :--- |
${gaps.map(g => `| \`${g.file}\` | \`${g.element}\` | ${g.line} | ${g.missingStates.join(', ')} |`).join('\n')}
`;

fs.writeFileSync(OUTPUT_FILE, report);
console.log(`Report generated: ${OUTPUT_FILE}`);
