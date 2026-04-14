import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('Charts Visual Regression', async ({ page }) => {
    // Visit the charts test page
    const response = await page.goto('/test-charts');
    expect(response?.status()).toBe(200);

    // Wait for Recharts to load
    try {
      await page.waitForSelector('.recharts-surface', { state: 'visible', timeout: 15000 });
    } catch (e) {
      console.log('Recharts might not have rendered or selector not found.');
    }

    // Wait for Interactive Graph canvas to load
    try {
      // ForceGraph2D renders a canvas element
      await page.waitForSelector('.graph-container canvas', { state: 'visible', timeout: 15000 });
    } catch (e) {
        console.log('Graph canvas might not have rendered or selector not found.');
    }

    // Give a little more time for animations (both recharts and force graph) to settle
    // The force graph has cooldownTicks, so we wait a bit for it to stabilize layout
    await page.waitForTimeout(3000);

    // Take screenshot and compare
    // This will generate a new screenshot on the first run.
    await expect(page).toHaveScreenshot('charts-page.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05, // Allow small anti-aliasing diffs and animation flakiness
      animations: 'disabled', // Playwright tries to disable animations
    });
  });
});
