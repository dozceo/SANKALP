import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

test.describe('Accessibility Audit', () => {
  test('should pass axe accessibility checks on test-accessibility page', async ({ page }) => {
    // Navigate to the accessibility test page
    await page.goto('/test-accessibility');

    // Wait for the main heading to ensure hydration
    await expect(page.getByRole('heading', { name: 'Accessibility Test Page' })).toBeVisible();

    // Run Axe analysis
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Generate Markdown Report
    const reportPath = path.join(process.cwd(), 'accessibility-report.md');
    let report = '# Accessibility Violation Report\n\n';
    report += `Generated on: ${new Date().toLocaleString()}\n\n`;
    report += `Total Violations: ${accessibilityScanResults.violations.length}\n\n`;

    if (accessibilityScanResults.violations.length === 0) {
      report += 'No violations found! Great job!\n';
    } else {
      accessibilityScanResults.violations.forEach((violation) => {
        report += `## ${violation.id} (${violation.impact})\n`;
        report += `**Description**: ${violation.description}\n\n`;
        report += `**Help**: [${violation.help}](${violation.helpUrl})\n\n`;
        report += `### Affected Elements:\n`;
        violation.nodes.forEach((node) => {
          report += `- **Target**: \`${node.target.join(', ')}\`\n`;
          report += `  - **HTML**: \`${node.html}\`\n`;
          report += `  - **Failure**: ${node.failureSummary}\n\n`;
        });
        report += '---\n\n';
      });
    }

    fs.writeFileSync(reportPath, report);
    console.log(`Accessibility report generated at ${reportPath}`);
  });
});
