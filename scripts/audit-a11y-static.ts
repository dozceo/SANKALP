import fs from 'fs';
import path from 'path';

const UI_DIR = path.join(process.cwd(), 'src/components/ui');

interface Violation {
  file: string;
  rule: string;
  message: string;
}

function scanFile(filePath: string): Violation[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const violations: Violation[] = [];

  // Check for Radix imports
  const radixImportMatch = content.match(/@radix-ui\/react-([a-z-]+)/);
  if (radixImportMatch) {
    // Check if the component uses forwardRef
    // This is a heuristic. We look for `React.forwardRef` or just `forwardRef`.
    if (!content.includes('forwardRef')) {
      violations.push({
        file: filePath,
        rule: 'radix-wrapper-forward-ref',
        message: `Radix primitive wrapper should use forwardRef to maintain accessibility focus management.`,
      });
    }

    // Check if props are spread
    if (!content.includes('...props')) {
      violations.push({
        file: filePath,
        rule: 'radix-wrapper-props-spread',
        message: `Radix primitive wrapper should spread props to ensure ARIA attributes are passed down.`,
      });
    }
  }

  // Check for Image alt text
  // Matches <img ...> without alt="..."
  // Simple regex, might have false positives/negatives
  const imgTagRegex = /<img\s+[^>]*>/g;
  let match;
  while ((match = imgTagRegex.exec(content)) !== null) {
    if (!match[0].includes('alt=')) {
      violations.push({
        file: filePath,
        rule: 'img-alt-missing',
        message: `<img> tag missing alt attribute.`,
      });
    }
  }

  // Check for Icon Button without label
  // Look for Button with size="icon" and check if it has aria-label
  const iconButtonRegex = /<Button[^>]*size="icon"[^>]*>/g;
  while ((match = iconButtonRegex.exec(content)) !== null) {
    if (!match[0].includes('aria-label') && !match[0].includes('aria-labelledby')) {
       violations.push({
        file: filePath,
        rule: 'icon-button-label',
        message: `Icon-only button (size="icon") missing aria-label.`,
      });
    }
  }

  return violations;
}

function main() {
  console.log('Scanning for static accessibility violations...');
  if (!fs.existsSync(UI_DIR)) {
      console.log('UI directory not found.');
      return;
  }

  const files = fs.readdirSync(UI_DIR).filter(f => f.endsWith('.tsx'));
  let allViolations: Violation[] = [];

  files.forEach(file => {
    allViolations = allViolations.concat(scanFile(path.join(UI_DIR, file)));
  });

  if (allViolations.length > 0) {
    console.log(`Found ${allViolations.length} violations.`);
    // Generate a report file
    const reportPath = 'static-a11y-violations.md';
    let report = '# Static Accessibility Violation Report\n\n';
    allViolations.forEach(v => {
        report += `- **${path.basename(v.file)}**: ${v.message} (${v.rule})\n`;
    });
    fs.writeFileSync(reportPath, report);
    console.log(`Report written to ${reportPath}`);
  } else {
    console.log('No static violations found.');
  }
}

main();
