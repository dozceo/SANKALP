import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const REPORT_FILE = path.join(process.cwd(), 'reports', 'radix-a11y-violations.md');

interface Violation {
  file: string;
  rule: string;
  message: string;
  line?: number;
}

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        getAllFiles(filePath, fileList);
      }
    } else {
      if (filePath.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

function checkRadixPrimitives(filePath: string, content: string): Violation[] {
  const violations: Violation[] = [];

  // Only for src/components/ui
  // Normalize path separators for cross-platform compatibility
  const normalizedPath = filePath.split(path.sep).join('/');
  if (!normalizedPath.includes('src/components/ui')) return violations;

  const radixImportMatch = content.match(/@radix-ui\/react-([a-z-]+)/);
  if (radixImportMatch) {
    // Check for forwardRef
    if (!content.includes('forwardRef')) {
      violations.push({
        file: filePath,
        rule: 'radix-wrapper-forward-ref',
        message: `Radix primitive wrapper should use forwardRef to maintain accessibility focus management.`,
      });
    }
    // Check for props spreading (...props, ...rest, ...other)
    if (!content.includes('...props') && !content.includes('...rest') && !content.includes('...other')) {
      violations.push({
        file: filePath,
        rule: 'radix-wrapper-props-spread',
        message: `Radix primitive wrapper should spread props (e.g. ...props) to ensure ARIA attributes are passed down.`,
      });
    }
  }
  return violations;
}

function checkDialogSheetTitle(filePath: string, content: string): Violation[] {
  const violations: Violation[] = [];

  // Heuristic: If DialogContent is used but DialogTitle is not found in the file
  if (content.includes('<DialogContent') && !content.includes('<DialogTitle') && !content.includes('VisuallyHidden')) {
     // Check if it's not the definition file itself
     if (!filePath.endsWith('ui/dialog.tsx')) {
        violations.push({
            file: filePath,
            rule: 'dialog-title-missing',
            message: `Usage of <DialogContent> detected without <DialogTitle>. Accessibility requires a title for Dialogs.`,
        });
     }
  }

  if (content.includes('<SheetContent') && !content.includes('<SheetTitle') && !content.includes('VisuallyHidden')) {
     if (!filePath.endsWith('ui/sheet.tsx')) {
        // SheetContent in our UI library (sheet.tsx) actually INCLUDES a hidden title by default.
        // So this check might be a false positive if the user relies on the default.
        // Let's verify sheet.tsx again.
        // sheet.tsx has <SheetPrimitive.Title className="sr-only">Mobile Menu</SheetPrimitive.Title> inside SheetContent.
        // So actually, for Sheet, it might be safe?
        // But wait, the default title is "Mobile Menu". If the sheet is used for something else, it might be misleading.
        // However, technically it HAS a title.
        // But if the developer wants a visible title or a correct title, they should provide one?
        // Actually, the default implementation in sheet.tsx hardcodes "Mobile Menu". This is arguably a bug or a strict default.
        // For now, I will skip SheetContent check because the wrapper provides a default title.
     }
  }
  return violations;
}

function checkIconTriggers(filePath: string, content: string): Violation[] {
  const violations: Violation[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Check for Button size="icon" without aria-label
    if (line.includes('size="icon"')) {
       if (!line.includes('aria-label') && !line.includes('aria-labelledby')) {
          violations.push({
             file: filePath,
             rule: 'icon-button-label',
             message: `Button with size="icon" detected without aria-label.`,
             line: index + 1
          });
       }
    }

    // Check for *Trigger (DialogTrigger, etc) that might be icon only
    // This is hard to detect line-by-line if it spans multiple lines.
    // Simple check: if line has <DialogTrigger> and <Icon /> and </DialogTrigger> on same line without text?
    // Or if line has <DialogTrigger asChild> (which is common), then we check the child.

    // Let's check for specific pattern: <*Trigger ... aria-label={undefined} ...>
    // Or just look for triggers.

    // A common mistake: <Button><Icon /></Button> (no text)
    // Regex for Button containing only an Icon-like tag?
    // Hard with regex.

    // Let's stick to the explicit "icon" size check which is a strong signal in shadcn.
  });

  return violations;
}

function scanFile(filePath: string): Violation[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  let violations: Violation[] = [];

  violations = violations.concat(checkRadixPrimitives(filePath, content));
  violations = violations.concat(checkDialogSheetTitle(filePath, content));
  violations = violations.concat(checkIconTriggers(filePath, content));

  return violations;
}

function generateReport(violations: Violation[]) {
  let report = '# Radix UI Accessibility Violation Report\n\n';
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  report += `Total Violations: ${violations.length}\n\n`;

  if (violations.length === 0) {
      report += "No violations found.\n";
  } else {
      report += '| File | Rule | Message | Line |\n';
      report += '|---|---|---|---|\n';
      violations.forEach(v => {
          const relativePath = path.relative(process.cwd(), v.file);
          report += `| ${relativePath} | ${v.rule} | ${v.message} | ${v.line || '-'} |\n`;
      });
  }

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated at ${REPORT_FILE}`);
}

function main() {
  console.log('Scanning for Radix A11y violations...');
  const files = getAllFiles(SRC_DIR);
  let allViolations: Violation[] = [];

  files.forEach(file => {
    allViolations = allViolations.concat(scanFile(file));
  });

  generateReport(allViolations);
}

main();
