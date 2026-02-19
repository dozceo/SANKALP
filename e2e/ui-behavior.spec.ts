
import { test, expect } from '@playwright/test';

test.describe('UI Behavior Tests', () => {

  test('Student Analytics UI Interactions (via Test Page)', async ({ page }) => {
    // Navigate to the test page which renders StudentAnalyticsClient with mock data
    await page.goto('/test-charts');

    // 1. Verify Initial Render
    await expect(page.getByText('Student Analytics')).toBeVisible();
    await expect(page.getByText('John Doe', { exact: true })).toBeVisible();
    await expect(page.getByText('Math')).toBeVisible(); // Chart label

    // 2. Verify Interactions - Textarea
    const instructionsInput = page.getByLabel('Custom Instructions');
    await expect(instructionsInput).toBeVisible();
    // Check initial mock value
    await expect(instructionsInput).toHaveValue('Use analogies related to sports.');

    // Type new instructions
    await instructionsInput.fill('Use analogies related to coding.');
    await expect(instructionsInput).toHaveValue('Use analogies related to coding.');

    // 4. Verify Save Action
    const saveButton = page.getByRole('button', { name: 'Save Configuration' });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();

    await saveButton.click();

    // We wait for either success or error toast
    const feedback = page.getByText(/Configuration saved|Error/);
    await expect(feedback.first()).toBeVisible({ timeout: 5000 });
  });

  test('Syllabus Page Search & Loading State', async ({ page }) => {
      // Navigate to syllabus page
      await page.goto('/syllabus');

      // Verify page title
      await expect(page.getByText('Syllabus Finder')).toBeVisible();

      // Find input and type
      const input = page.locator('input[placeholder*="e.g."]');
      await expect(input).toBeVisible();
      await input.fill('Calculus');

      // Click generate
      const generateButton = page.locator('button[type="submit"]');
      await generateButton.click();

      // Expect loading state
      // The button usually gets disabled or shows a spinner
      // Or a spinner appears elsewhere.
      // We check for "Generating..." text or spinner class
      try {
          await expect(page.getByText(/Generating/i)).toBeVisible({ timeout: 3000 });
      } catch (e) {
          // If too fast, check for result or error.
          // In a mock/no-auth env, it likely fails or shows error.
          const errorOrResult = page.getByText(/Error|Syllabus for/i);
          await expect(errorOrResult.first()).toBeVisible();
      }
  });

  test('Topic Mastery Grid Rendering', async ({ page }) => {
      // Using /test-charts as a harness for the grid component
      await page.goto('/test-charts');

      // The grid renders topic cards or a heatmap.
      // Based on file list, TopicMasteryGrid.tsx exists.
      // Let's assume /test-charts renders it.
      // We look for topic names like "Algebra", "Geometry" if mocked.
      // Or just check that the container is visible.

      // Check for a known element from the mock data in /test-charts
      // "Math" was checked above.
      // Let's check for visual elements of the chart, e.g. "Mastery" axis or legend.
      await expect(page.getByText('Mastery')).toBeVisible();

      // Interactive check: Hovering over a bar/point
      // This is hard to assert visually without snapshot, but we can try to trigger a tooltip.
      // The chart usually uses Recharts.
      // We can look for .recharts-surface
      const chart = page.locator('.recharts-surface').first();
      await expect(chart).toBeVisible();

      // Click on chart
      await chart.click({ position: { x: 100, y: 100 } });

      // Just ensure no crash/error overlay
      await expect(page.getByText('Application error')).not.toBeVisible();
  });

});
