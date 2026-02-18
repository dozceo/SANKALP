import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

test.describe('Accessibility Audit', () => {
  test('Analyze Accessibility Test Page', async ({ page }) => {
    // Visit the accessibility test page
    // Note: This page is available in the app router under src/app/test-accessibility/page.tsx
    const response = await page.goto('/test-accessibility');
    expect(response?.status()).toBe(200);

    // Run Axe analysis
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Generate Markdown Report
    let report = '# Accessibility Violation Report\n\n';
    report += `Generated on: ${new Date().toLocaleString()}\n\n`;
    report += `Total Violations: ${accessibilityScanResults.violations.length}\n\n`;

    if (accessibilityScanResults.violations.length > 0) {
      report += '| Impact | Rule | Description | Element |\n';
      report += '|---|---|---|---|\n';

      for (const violation of accessibilityScanResults.violations) {
        const impact = violation.impact || 'unknown';
        const ruleId = violation.id;
        const description = violation.description;

        for (const node of violation.nodes) {
           const htmlSample = node.html.replace(/\|/g, '\\|').substring(0, 100).replace(/\n/g, ' ');
           report += `| **${impact}** | \`${ruleId}\` | ${description} | \`${htmlSample}\` |\n`;
        }
      }
    } else {
      report += 'No violations found!\n';
    }

    const reportPath = path.join(process.cwd(), 'accessibility-report.md');
    fs.writeFileSync(reportPath, report);

    console.log(`Accessibility report generated at ${reportPath}`);

    // Check that the file was created
    expect(fs.existsSync(reportPath)).toBeTruthy();
  });
});
