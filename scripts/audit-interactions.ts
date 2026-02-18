import fs from 'fs';
import path from 'path';

const TARGET_DIRS = ['src/app', 'src/components'];
const OUTPUT_FILE = 'interaction-feedback-gap-report.md';

interface Gap {
  file: string;
  line: number;
  element: string;
  missing: string[];
}

const gaps: Gap[] = [];

// Interactive elements to check
const ELEMENTS = ['button', 'a', 'input', 'select', 'textarea'];

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const fileName = path.basename(filePath, '.tsx').toLowerCase();

  // 1. Check UI Component definitions (in src/components/ui)
  if (filePath.includes('src/components/ui/') && ELEMENTS.includes(fileName)) {
     // Check whole file for state classes
     const missing: string[] = [];

     // Hover
     if (fileName !== 'input' && fileName !== 'textarea' && fileName !== 'select') {
         if (!content.includes('hover:') && !content.includes('data-[state=open]') && !content.includes('data-[state=checked]')) {
             // Allow other states as proxies for interactivity if component is complex
             missing.push('hover');
         }
     }

     // Focus
     if (!content.includes('focus:') && !content.includes('focus-visible:') && !content.includes('ring-')) {
         missing.push('focus');
     }

     // Disabled
     if ((fileName === 'button' || fileName === 'input' || fileName === 'select' || fileName === 'textarea')) {
         if (!content.includes('disabled:') && !content.includes('aria-disabled:') && !content.includes('data-[disabled]')) {
             missing.push('disabled');
         }
     }

     if (missing.length > 0) {
         gaps.push({
             file: filePath,
             line: 1,
             element: `UI Component: ${fileName}`,
             missing: missing
         });
     }
     return;
  }

  // 2. Check Raw HTML usage in other files
  lines.forEach((line, index) => {
    // Regex for <tag ... className="...">
    // Matches <button ... className="...">
    const match = line.match(/<(button|a|input|select|textarea)\b([^>]*)>/);
    if (match) {
        const tag = match[1];
        const attr = match[2];

        // Only check if className is present
        const classMatch = attr.match(/className=["']([^"']+)["']/);
        if (classMatch) {
            const classes = classMatch[1];
            const missing: string[] = [];

            // Hover
            if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
                 if (!classes.includes('hover:') && !classes.includes('group-hover:') && !classes.includes('peer-hover:')) {
                     // Check if parent has group? Can't easily.
                     // Just flag it.
                     missing.push('hover');
                 }
            }

            // Focus
            if (!classes.includes('focus:') && !classes.includes('focus-visible:') && !classes.includes('ring-')) {
                 missing.push('focus');
            }

            // Disabled
            if ((tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea')) {
                 if (!classes.includes('disabled:') && !classes.includes('aria-disabled:')) {
                     missing.push('disabled');
                 }
            }

            if (missing.length > 0) {
                gaps.push({
                    file: filePath,
                    line: index + 1,
                    element: `<${tag}>`,
                    missing: missing
                });
            }
        }

        // 3. Loading State Check (Heuristic)
        // If it's a submit button, check if it has disabled logic or loading indicator
        if (tag === 'button' && attr.includes('type="submit"')) {
             if (!attr.includes('disabled={') && !attr.includes('aria-busy')) {
                  // gaps.push(...) - maybe too noisy?
                  // Let's add it to a separate category or same gap list
                  gaps.push({
                      file: filePath,
                      line: index + 1,
                      element: `<${tag} type="submit">`,
                      missing: ['loading state handling (disabled={...} or aria-busy)']
                  });
             }
        }
    }
  });
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
TARGET_DIRS.forEach(dir => traverseDir(dir));

let report = '# Interaction Feedback Gap Report\n\n';
if (gaps.length === 0) {
  report += 'No interaction feedback gaps found.\n';
} else {
  report += '| File | Line | Element | Missing States |\n|---|---|---|---|\n';
  // Sort by file and line
  gaps.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  gaps.forEach(g => {
    report += `| ${g.file} | ${g.line} | \`${g.element}\` | ${g.missing.join(', ')} |\n`;
  });
}

report += `\n## Methodology
- **UI Components**: Verified definition files in \`src/components/ui/\` for presence of state modifiers.
- **Raw Elements**: Scanned raw HTML tags (\`<button>\`, \`<a>\`, etc.) with inline classes.
- **Submit Buttons**: Checked for \`disabled={...}\` or \`aria-busy\` on buttons with \`type="submit"\`.
`;

fs.writeFileSync(OUTPUT_FILE, report);
console.log(`Interaction Audit Complete. Report saved to ${OUTPUT_FILE}`);
