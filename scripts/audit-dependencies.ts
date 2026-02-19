
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

const REPORT_FILE = 'DEPENDENCY_VULNERABILITY_REPORT.md';
const PYTHON_REQUIREMENTS = [
  'src/ml/training/requirements.txt',
  'src/ml/inference/requirements.txt'
];

interface AuditAdvisory {
  title: string;
  module_name: string;
  vulnerable_versions: string;
  severity: string;
  url: string;
}

interface AuditOutput {
  vulnerabilities: Record<string, {
    name: string;
    severity: string;
    isDirect: boolean;
    via: Array<string | { title: string; url: string; severity: string }>;
    effects: string[];
    range: string;
    nodes: string[];
    fixAvailable: boolean | object;
  }>;
  metadata: {
    vulnerabilities: {
      info: number;
      low: number;
      moderate: number;
      high: number;
      critical: number;
      total: number;
    }
  }
}

async function runNpmAudit(): Promise<AuditOutput | null> {
  try {
    const { stdout } = await execAsync('npm audit --json');
    return JSON.parse(stdout);
  } catch (error: any) {
    // npm audit returns exit code 1 if vulnerabilities are found
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch (e) {
        console.error('Failed to parse npm audit output:', e);
        return null;
      }
    }
    console.error('Error running npm audit:', error);
    return null;
  }
}

async function checkPythonRequirements(): Promise<string[]> {
  const issues: string[] = [];

  for (const reqPath of PYTHON_REQUIREMENTS) {
    if (fs.existsSync(reqPath)) {
      const content = fs.readFileSync(reqPath, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));

      lines.forEach(line => {
        // Check for loose versioning (no ==)
        if (!line.includes('==')) {
          issues.push(`- **${path.basename(reqPath)}**: Dependency \`${line.trim()}\` is not pinned to a specific version. This increases supply chain attack surface.`);
        }
      });
    } else {
      issues.push(`- **${path.basename(reqPath)}**: File not found.`);
    }
  }

  return issues;
}

async function generateReport() {
  console.log('Running dependency audit...');

  const auditData = await runNpmAudit();
  const pythonIssues = await checkPythonRequirements();

  let reportContent = `# Dependency Supply Chain Vulnerability Report

## Executive Summary
This report analyzes both Node.js (npm) and Python dependencies for known vulnerabilities and supply chain risks.

`;

  // NPM Section
  if (auditData) {
    const stats = auditData.metadata.vulnerabilities;
    reportContent += `## Node.js Dependencies (npm)

**Vulnerability Summary:**
- Critical: ${stats.critical}
- High: ${stats.high}
- Moderate: ${stats.moderate}
- Low: ${stats.low}
- Total: ${stats.total}

### Detailed Findings

`;

    if (stats.total === 0) {
      reportContent += "No known vulnerabilities found in npm dependencies.\n";
    } else {
      reportContent += "| Package | Severity | Issue | Direct Dependency |\n|---|---|---|---|\n";

      Object.entries(auditData.vulnerabilities).forEach(([name, vuln]) => {
        const issueTitle = typeof vuln.via[0] === 'object' ? vuln.via[0].title : 'Dependency of vulnerable package';
        reportContent += `| ${name} | **${vuln.severity.toUpperCase()}** | ${issueTitle} | ${vuln.isDirect ? 'Yes' : 'No'} |\n`;
      });
    }
  } else {
    reportContent += `## Node.js Dependencies (npm)\n\nFailed to run or parse \`npm audit\`.\n`;
  }

  // Python Section
  reportContent += `\n## Python Dependencies

**Risk Analysis:**
Python dependencies are checked for version pinning. Unpinned dependencies allow upstream changes to break the build or introduce malicious code.

### Findings

`;

  if (pythonIssues.length === 0) {
    reportContent += "No issues found in Python requirements.\n";
  } else {
    reportContent += pythonIssues.join('\n') + "\n";
  }

  // Recommendations
  reportContent += `\n## Recommendations

1. **Patch High/Critical Vulnerabilities:** Run \`npm audit fix\` to address auto-fixable issues.
2. **Pin Python Versions:** Update \`requirements.txt\` to use strict versioning (e.g., \`pandas==1.3.5\`) instead of ranges (\`>=\`).
3. **Regular Scanning:** Integrate \`npm audit\` and \`pip-audit\` into the CI/CD pipeline.
`;

  fs.writeFileSync(REPORT_FILE, reportContent);
  console.log(`Report generated: ${REPORT_FILE}`);
}

generateReport().catch(console.error);
