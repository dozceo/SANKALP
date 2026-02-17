
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const REPORT_FILE = 'reports/dependency-vulnerability-report.md';
const REQUIREMENTS_FILE = 'src/ml/training/requirements.txt';

async function runNpmAudit(): Promise<any> {
  return new Promise((resolve) => {
    // pnpm audit returns a non-zero exit code if vulnerabilities are found, so we must handle error
    exec('pnpm audit --json', { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        try {
            if (stdout) {
                resolve(JSON.parse(stdout));
            } else {
                 resolve({ error: stderr || error?.message });
            }
        } catch (e) {
            resolve({ error: 'Failed to parse pnpm audit output', raw: stdout });
        }
    });
  });
}

function checkPythonRequirements() {
  if (!fs.existsSync(REQUIREMENTS_FILE)) {
    return 'Requirements file not found.';
  }
  const content = fs.readFileSync(REQUIREMENTS_FILE, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  return lines;
}

async function generateReport() {
  console.log('Running dependency scan...');

  const npmAuditResult = await runNpmAudit();
  const pythonReqs = checkPythonRequirements();

  let report = `# Dependency Supply Chain Vulnerability Report\n\n**Date:** ${new Date().toISOString()}\n\n`;

  report += `## NPM/PNPM Dependencies\n\n`;

  if (npmAuditResult.error) {
    report += `**Error running audit:** ${npmAuditResult.error}\n\n`;
    if (npmAuditResult.raw) {
        report += `Raw output:\n\`\`\`\n${npmAuditResult.raw}\n\`\`\`\n`;
    }
  } else if (npmAuditResult.advisories && Object.keys(npmAuditResult.advisories).length > 0) {
      report += `Found ${Object.keys(npmAuditResult.advisories).length} advisories.\n\n`;
      for (const [id, advisory] of Object.entries(npmAuditResult.advisories) as any) {
          report += `### ${advisory.title} (${advisory.severity})\n`;
          report += `- **Package:** ${advisory.module_name}\n`;
          report += `- **Vulnerable Versions:** ${advisory.vulnerable_versions}\n`;
          report += `- **Patched Versions:** ${advisory.patched_versions}\n`;
          report += `- **More Info:** ${advisory.url}\n\n`;
      }
  } else if (npmAuditResult.vulnerabilities) {
      // pnpm audit --json structure might differ slightly depending on version, sometimes it returns an object with 'vulnerabilities' count
      const vulns = npmAuditResult.vulnerabilities;
      report += `Summary:\n`;
      report += `- Critical: ${vulns.critical || 0}\n`;
      report += `- High: ${vulns.high || 0}\n`;
      report += `- Moderate: ${vulns.moderate || 0}\n`;
      report += `- Low: ${vulns.low || 0}\n`;

      if (npmAuditResult.advisories) { // If detailed advisories are present
           // ... handled above if structure matches
      } else {
          report += `\nRun \`pnpm audit\` manually for details.\n`;
      }

  } else {
    report += `No critical vulnerabilities found in npm packages.\n\n`;
  }

  report += `## Python Dependencies\n\n`;
  report += `Scanned \`${REQUIREMENTS_FILE}\`.\n\n`;

  if (Array.isArray(pythonReqs)) {
      report += `The following packages were identified. **Manual CVE check recommended** as no automated Python vulnerability database is currently connected.\n\n`;
      report += `| Package | Version Constraint |\n| :--- | :--- |\n`;
      pythonReqs.forEach((req: string) => {
          report += `| \`${req}\` | (Unpinned or custom) |\n`; // Simple parsing
      });
  } else {
      report += `${pythonReqs}\n`;
  }

  // Ensure reports dir exists
  const reportsDir = path.dirname(REPORT_FILE);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated: ${REPORT_FILE}`);
}

generateReport();
