
import * as fs from 'fs';
import * as path from 'path';

const INTERACTIVE_ELEMENTS = ['button', 'a', 'input', 'select', 'textarea'];

interface InteractionIssue {
  file: string;
  element: string;
  issue: string;
}

const issues: InteractionIssue[] = [];

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // 1. Check for interactive elements and missing states
  // Regex to match opening tag of interactive elements
  // This is a rough approximation.
  const tagRegex = /<(button|a|input|select|textarea)\b([^>]*)>/g;
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    const element = match[1];
    const attributes = match[2];

    // Find className inside attributes
    const classMatch = attributes.match(/className=["']([^"']+)["']/);
    if (classMatch) {
      const classes = classMatch[1];
      const missing: string[] = [];

      // Check for hover
      if (!classes.includes('hover:') && !classes.includes('group-hover:')) {
          // If it's a button, it should have hover.
          // If it uses a variant (e.g. valid shadcn classes like 'ghost'), it might handle it?
          // But here we see raw classes.
          missing.push('hover');
      }

      // Check for focus
      if (!classes.includes('focus:') && !classes.includes('focus-visible:') && !classes.includes('ring-')) {
          missing.push('focus');
      }

      // Check for active (only for button really critical)
      if (element === 'button' && !classes.includes('active:')) {
          missing.push('active');
      }

      // Check for disabled (button, input, etc)
      if ((element === 'button' || element === 'input') && !classes.includes('disabled:')) {
          // Check if 'disabled' attribute is present as a prop?
          // But visual feedback needs a class usually, unless default browser styles are relied upon.
          // Tailwind requires disabled: modifiers.
          missing.push('disabled');
      }

      // Filter out false positives for 'a' tag
      if (element === 'a') {
         // remove active/disabled
         const aIndex = missing.indexOf('active');
         if (aIndex > -1) missing.splice(aIndex, 1);
         const dIndex = missing.indexOf('disabled');
         if (dIndex > -1) missing.splice(dIndex, 1);
      }

      if (missing.length > 0) {
        issues.push({
          file: filePath,
          element,
          issue: `Missing states: ${missing.join(', ')}`
        });
      }
    } else {
        // No className? using default styles? or style prop?
        // If no className, we can't check for utility classes.
        // Assuming it might be unstyled or using global styles.
        // Warn if it's a raw button.
        if (element === 'button') {
            issues.push({
                file: filePath,
                element,
                issue: 'Raw button without className (missing visual feedback check)'
            });
        }
    }
  }

  // 2. Check for non-interactive elements with onClick
  const clickRegex = /<(div|span|p|li|section|article)\b([^>]*)onClick/g;
  while ((match = clickRegex.exec(content)) !== null) {
      const element = match[1];
      const attributes = match[2];

      // Check for role="button" and tabIndex
      const hasRole = attributes.includes('role="button"');
      const hasTabIndex = attributes.includes('tabIndex');

      if (!hasRole || !hasTabIndex) {
          issues.push({
              file: filePath,
              element,
              issue: `Non-interactive element with onClick missing role="button" or tabIndex`
          });
      }

      // Also check visual feedback
      if (attributes.includes('className')) {
           const classMatch = attributes.match(/className=["']([^"']+)["']/);
           if (classMatch) {
               const classes = classMatch[1];
               if (!classes.includes('hover:') && !classes.includes('cursor-pointer')) {
                   issues.push({
                       file: filePath,
                       element,
                       issue: `Clickable ${element} missing hover state or cursor-pointer`
                   });
               }
           }
      }
  }
}

function traverseDir(dir: string) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      scanFile(fullPath);
    }
  }
}

console.log('Starting Interaction Audit...');
traverseDir('src/app');
traverseDir('src/components');

let report = '# Interaction Feedback Gap Report\n\n';
if (issues.length === 0) {
  report += 'No interaction feedback gaps found.\n';
} else {
  report += '| File | Element | Issue |\n|---|---|---|\n';
  issues.forEach(i => {
    report += `| ${i.file} | ${i.element} | ${i.issue} |\n`;
  });
}

fs.writeFileSync('interaction-feedback-gap-report.md', report);
console.log('Interaction Audit Complete. Report saved to interaction-feedback-gap-report.md');
