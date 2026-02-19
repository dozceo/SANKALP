
import { test, expect } from '@playwright/test';

test.describe('Integration Flow: Quiz Journey', () => {

  test('Navigate to Quiz and Attempt Interaction', async ({ page }) => {
    // 1. Visit Quiz Page
    await page.goto('/quiz');

    // Check for title or header
    // Assuming "Quiz" or "Assessment" is in the title
    await expect(page.getByText(/Quiz|Assessment|Practice/i).first()).toBeVisible();

    // 2. Start Quiz (if there's a start button)
    // Often there is a setup screen or a "Start" button.
    const startButton = page.getByRole('button', { name: /Start|Begin|Generate/i });

    if (await startButton.isVisible()) {
        await startButton.click();

        // Wait for question to load
        // Look for "Question" or "Q1"
        await expect(page.getByText(/Question \d/i).first()).toBeVisible({ timeout: 10000 });

        // 3. Attempt to answer (Mocking user choice)
        // Usually radio buttons or options
        const options = page.locator('button[role="radio"], button[class*="option"]');
        if (await options.count() > 0) {
            await options.first().click();

            // 4. Next/Submit
            const nextButton = page.getByRole('button', { name: /Next|Submit/i });
            if (await nextButton.isVisible()) {
                await nextButton.click();
            }
        }
    } else {
        console.log('No start button found, possibly already in quiz or requires setup.');
        // If no start button, check if we are already in a quiz (e.g. "Question 1")
        if (await page.getByText(/Question/i).isVisible()) {
             // Already in quiz
             console.log('Already in quiz view');
        }
    }
  });

  test('Revision Planner Access', async ({ page }) => {
      // Visit Planner directly
      await page.goto('/planner');

      // Check for calendar or list of topics
      await expect(page.getByText(/Plan|Schedule|Revision/i).first()).toBeVisible();

      // Check for "Urgent" or tasks
      // If we mocked data, we might see "Urgent Revision"
      // If not, just ensure page loads
  });

});
