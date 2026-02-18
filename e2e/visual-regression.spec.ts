import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('Charts Visual Regression', async ({ page }) => {
    // Visit the charts test page
    const response = await page.goto('/test-charts');
    expect(response?.status()).toBe(200);

    // Wait for charts to load (they might have animation)
    // We can wait for a specific element. Recharts renders SVGs inside a responsive container.
    // We look for any recharts surface to ensure at least one chart rendered.
    try {
      await page.waitForSelector('.recharts-surface', { state: 'visible', timeout: 15000 });
    } catch (e) {
      console.log('Charts might not have rendered or selector not found, proceeding to screenshot anyway to capture state.');
    }

    // Give a little more time for animations to settle
    await page.waitForTimeout(2000);

    // Take screenshot and compare
    // This will generate a new screenshot on the first run.
    await expect(page).toHaveScreenshot('charts-page.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05, // Allow small anti-aliasing diffs and animation flakiness
      animations: 'disabled', // Playwright tries to disable animations
    });
  });
});
