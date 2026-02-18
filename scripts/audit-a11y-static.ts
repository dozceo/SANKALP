import fs from 'fs';
import path from 'path';

// CLI Argument Parsing
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const targetDir = args.find(arg => !arg.startsWith('--')) || path.join(process.cwd(), 'src/components/ui');

interface Violation {
  file: string;
  rule: string;
  message: string;
  line?: number;
}

function scanFile(filePath: string): Violation[] {
  const violations: Violation[] = [];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

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
  } catch (error: any) {
    if (jsonOutput) {
        console.error(JSON.stringify({ error: `Error scanning file ${filePath}: ${error.message}` }));
    } else {
        console.error(`Error scanning file ${filePath}: ${error.message}`);
    }
  }
  return violations;
}

function main() {
  if (!jsonOutput) {
    console.log(`Scanning for static accessibility violations in: ${targetDir}`);
  }

  if (!fs.existsSync(targetDir)) {
      const message = `Target directory not found: ${targetDir}`;
      if (jsonOutput) {
          console.error(JSON.stringify({ error: message }));
      } else {
          console.error(message);
      }
      process.exit(1);
  }

  const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.tsx'));
  let allViolations: Violation[] = [];

  files.forEach(file => {
    allViolations = allViolations.concat(scanFile(path.join(targetDir, file)));
  });

  if (allViolations.length > 0) {
    if (jsonOutput) {
        console.log(JSON.stringify(allViolations, null, 2));
    } else {
        console.log(`Found ${allViolations.length} violations.`);
        const reportPath = 'static-a11y-violations.md';
        let report = '# Static Accessibility Violation Report\n\n';
        allViolations.forEach(v => {
            report += `- **${path.basename(v.file)}**: ${v.message} (${v.rule})\n`;
        });
        fs.writeFileSync(reportPath, report);
        console.log(`Report written to ${reportPath}`);
    }
    process.exit(1);
  } else {
    if (!jsonOutput) {
        console.log('No static violations found.');
    }
    process.exit(0);
  }
}

main();
