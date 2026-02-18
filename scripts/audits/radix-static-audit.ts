import fs from 'fs';
import path from 'path';

const UI_DIR = path.join(process.cwd(), 'src/components/ui');
const REPORT_PATH = path.join(process.cwd(), 'radix-static-audit-report.md');

interface ComponentAudit {
  file: string;
  hasRadixImport: boolean;
  radixPackage?: string;
  hasForwardRef: boolean;
  hasDisplayName: boolean;
  hasClassName: boolean; // checks for cn(..., className) usage
  issues: string[];
}

function auditFile(filePath: string): ComponentAudit {
  const content = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);

  const audit: ComponentAudit = {
    file: filename,
    hasRadixImport: false,
    hasForwardRef: false,
    hasDisplayName: false,
    hasClassName: false,
    issues: []
  };

  // 1. Check for Radix Import
  const radixImportMatch = content.match(/@radix-ui\/react-([\w-]+)/);
  if (radixImportMatch) {
    audit.hasRadixImport = true;
    audit.radixPackage = radixImportMatch[0];
  }

  // 2. Check for forwardRef
  if (content.includes('React.forwardRef') || content.includes('forwardRef<')) {
    audit.hasForwardRef = true;
  } else {
    // Some components might be simple wrappers without forwardRef, but UI lib usually has them.
    if (audit.hasRadixImport) {
        audit.issues.push('Missing `forwardRef`. Radix primitives should forward refs to the underlying element.');
    }
  }

  // 3. Check for displayName
  if (content.match(/\.displayName\s*=\s*['"`]/)) {
    audit.hasDisplayName = true;
  } else {
    if (audit.hasRadixImport) {
        audit.issues.push('Missing `displayName`. Helpful for debugging and devtools.');
    }
  }

  // 4. Check for className forwarding
  // Look for cn(..., className) or clsx(..., className) or similar patterns
  if (content.includes('className={cn(') || content.includes('className={clsx(') || content.match(/className=\{.*className.*\}/)) {
    audit.hasClassName = true;
  } else {
     // Check if component accepts className prop
     if (content.includes('className?: string') || content.includes('className,')) {
         audit.issues.push('`className` prop detected but potentially not forwarded safely (missing `cn` or `clsx` usage).');
     }
  }

  return audit;
}

function generateReport(audits: ComponentAudit[]) {
  let report = '# Radix UI Static Audit Report\n\n';
  report += `Generated on: ${new Date().toLocaleString()}\n`;
  report += `Scanned Files: ${audits.length}\n\n`;

  const radixComponents = audits.filter(a => a.hasRadixImport);
  report += `## Radix Components Found: ${radixComponents.length}\n\n`;

  if (radixComponents.length === 0) {
    report += 'No Radix UI components found in `src/components/ui`.\n';
  } else {
    report += '| Component | Package | Issues |\n';
    report += '|---|---|---|\n';

    radixComponents.forEach(audit => {
      const issueText = audit.issues.length > 0 ? audit.issues.join('<br>') : '✅ Pass';
      report += `| ${audit.file} | \`${audit.radixPackage}\` | ${issueText} |\n`;
    });
  }

  report += '\n## Non-Radix Components (Check)\n\n';
  const otherComponents = audits.filter(a => !a.hasRadixImport);
  if (otherComponents.length > 0) {
      report += '| Component | Issues |\n';
      report += '|---|---|\n';
      otherComponents.forEach(audit => {
          // Check generic issues for non-radix too
          const issues = [];
          if (!audit.hasForwardRef && (audit.file.includes('input') || audit.file.includes('button'))) issues.push('Consider `forwardRef` for form elements.');
          if (!audit.hasDisplayName) issues.push('Missing `displayName`.');
          const issueText = issues.length > 0 ? issues.join('<br>') : '✅ Pass';
          report += `| ${audit.file} | ${issueText} |\n`;
      });
  }

  fs.writeFileSync(REPORT_PATH, report);
  console.log(`Report generated at ${REPORT_PATH}`);
}

function run() {
  if (!fs.existsSync(UI_DIR)) {
    console.error(`Directory not found: ${UI_DIR}`);
    return;
  }

  const files = fs.readdirSync(UI_DIR).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  const audits = files.map(file => auditFile(path.join(UI_DIR, file)));

  generateReport(audits);
}

run();
