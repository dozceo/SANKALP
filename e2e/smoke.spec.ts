
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:9002';

test.describe('Smoke Test: Core Functionality', () => {

  test('API: Student Intelligence (No Auth required for test ID)', async ({ request }) => {
    // Verify API works without chaos
    const response = await request.get(`${BASE_URL}/api/intelligence/student?studentId=test_student_1`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.studentId).toBe('test_student_1');
    expect(data.mastery).toBeDefined();
  });

  test('Frontend: Login loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/en/login`);
    expect(response?.status()).toBeLessThan(400); // 200 or 302
  });
});
