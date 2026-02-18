import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

test.describe.configure({ mode: 'serial' });

test.describe('Accessibility Audit', () => {
  const reportPath = path.join(process.cwd(), 'accessibility-report.md');

  test.beforeAll(() => {
    // Initialize report file
    const initialContent = `# Accessibility Violation Report\n\nGenerated on: ${new Date().toLocaleString()}\n\n`;
    fs.writeFileSync(reportPath, initialContent);
  });

  async function appendReport(pageName: string, violations: any[]) {
    let report = `## Report for: ${pageName}\n\n`;
    report += `**Total Violations**: ${violations.length}\n\n`;

    if (violations.length === 0) {
      report += '✅ No violations found!\n\n';
    } else {
      violations.forEach((violation) => {
        report += `### ${violation.id} (${violation.impact})\n`;
        report += `**Description**: ${violation.description}\n\n`;
        report += `**Help**: [${violation.help}](${violation.helpUrl})\n\n`;
        report += `#### Affected Elements:\n`;
        violation.nodes.forEach((node: any) => {
          report += `- **Target**: \`${node.target.join(', ')}\`\n`;
          // Truncate HTML to avoid massive report
          const html = node.html.length > 100 ? node.html.substring(0, 100) + '...' : node.html;
          report += `  - **HTML**: \`${html.replace(/`/g, "'")}\`\n`;
          report += `  - **Failure**: ${node.failureSummary}\n\n`;
        });
      });
    }
    report += '---\n\n';
    fs.appendFileSync(reportPath, report);
  }

  test('Basic Accessibility Page', async ({ page }) => {
    await page.goto('/test-accessibility');
    await expect(page.getByRole('heading', { name: 'Accessibility Test Page' })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    await appendReport('/test-accessibility', results.violations);
  });

  test('Comprehensive Accessibility Page', async ({ page }) => {
    await page.goto('/test-accessibility-comprehensive');
    await expect(page.getByRole('heading', { name: 'Comprehensive Accessibility Audit' })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    await appendReport('/test-accessibility-comprehensive', results.violations);
  });
});
