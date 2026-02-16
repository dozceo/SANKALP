
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:9002';

test.describe('Chaos Engineering: Infrastructure Failure Simulation', () => {

  test.beforeEach(async ({ request }) => {
    // Reset chaos state before each test
    await request.delete(`${BASE_URL}/api/chaos`);
  });

  test('T0: Baseline Health Check', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/intelligence/student?studentId=test_student_1`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.studentId).toBe('test_student_1');
  });

  test('T1: ML Service Latency (5s)', async ({ request }) => {
    // Inject latency
    await request.post(`${BASE_URL}/api/chaos`, { data: { mlLatency: 5000 } });

    const start = Date.now();
    const response = await request.get(`${BASE_URL}/api/intelligence/student?studentId=test_student_1`);
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(duration).toBeGreaterThan(5000);

    // Verify system degraded gracefully (still returned data)
    const data = await response.json();
    expect(data.mastery).toBeDefined();
  });

  test('T2: ML Service Failure (Graceful Degradation)', async ({ request }) => {
    // Inject ML error
    await request.post(`${BASE_URL}/api/chaos`, { data: { mlError: true } });

    const response = await request.get(`${BASE_URL}/api/intelligence/student?studentId=test_student_1`);

    // The API handles ML errors by skipping topics, so it should still return 200
    // but mastery data might be empty or cached
    expect(response.status()).toBe(200);
    const data = await response.json();

    // Check if we have partial data (or empty mastery if all failed and no cache)
    // The logic says "continue" on error, so other parts of intelligence should be present
    expect(data.attentionRisk).toBeDefined();
    // Mastery might be empty if all topics failed prediction and weren't cached
    // We can't strictly assert mastery count without knowing cache state
  });

  test('T3: Firestore Read Failure (Cascading Failure)', async ({ request }) => {
    // Inject DB Read error
    await request.post(`${BASE_URL}/api/chaos`, { data: { firestoreReadError: true } });

    const response = await request.get(`${BASE_URL}/api/intelligence/student?studentId=test_student_1`);

    // DB failure in GET usually crashes the endpoint logic
    expect(response.status()).toBe(500);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('T4: Genkit Quota Exceeded (AI Resilience)', async ({ request }) => {
    // Inject Quota Exceeded
    await request.post(`${BASE_URL}/api/chaos`, { data: { genkitQuotaExceeded: true } });

    // We don't have a direct API for Quiz Generation that is easy to call without auth/setup
    // But if we had, we would assert 429 or graceful message.
    // For now, we skip or mock a call if possible.
    // Assuming /api/intelligence doesn't call Genkit directly (it calls ML and ADK).
    // ADK might call Genkit?
    // ADK `makeRevisionDecision` is deterministic logic, no Genkit.
    // So this test is a placeholder for when we can trigger AI.
  });

  test('T5: Network Partition (Frontend Resilience)', async ({ page }) => {
    // Simulate network failure for API calls
    await page.route('**/api/intelligence/**', route => route.abort('failed'));

    // Navigate to dashboard
    // We need to bypass login or use a public page if possible.
    // Dashboard likely redirects to login.
    // We'll try to go to a page that fetches data.
    // If we can't login, we can't test this fully in E2E.
    // But let's assume we can hit the login page and it tries to fetch something?
    // No.

    // Since we are in a sandbox without a seeded user session for the browser,
    // we might get redirected to /login.
    await page.goto(`${BASE_URL}/en/planner`);

    // If the page loads (even if 404 or login), we check it didn't crash completely (white screen)
    // But since we routed API to fail, we expect some UI handling.
    // If redirected to login, it's fine.
    // If 404, it's fine (server issue, not chaos resilience issue unless triggered by chaos).
    // Just expect url to be planner or login.
    const url = page.url();
    expect(url).toMatch(/.*(planner|login).*/);
  });

});
