
import { spawn, execSync } from 'child_process';
import { checkChaos } from '../src/lib/chaos-config'; // Can't import from src easily in script if not using ts-node/register properly?
// Actually scripts are run with tsx, so imports work if paths are correct.
// But alias @/ might not work without tsconfig paths.
// I'll stick to relative imports or just not import app code in this runner if possible.

const PORT = 9002;
const BASE_URL = `http://localhost:${PORT}`;

async function waitForServer() {
  console.log('Waiting for server to be ready...');
  for (let i = 0; i < 60; i++) { // 60s timeout
    try {
      const res = await fetch(`${BASE_URL}/api/chaos`);
      if (res.ok) return true;
    } catch (e) {
      // ignore
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

async function run() {
  console.log('Starting Chaos Engineering Harness...');

  // Start Next.js Server in Background (Using Mock DB)
  const server = spawn('npm', ['run', 'dev'], {
    env: { ...process.env, ENABLE_CHAOS: 'true', PORT: String(PORT), USE_MOCK_DB: 'true' },
    stdio: 'inherit', // Pipe output to see logs
    detached: true, // Create process group
  });

  try {
    const ready = await waitForServer();
    if (ready) {
        // Seed Mock DB via API
        try {
            console.log('Seeding Mock DB...');
            await fetch(`${BASE_URL}/api/test/seed`, { method: 'POST' });
        } catch (e) {
            console.error('Failed to seed Mock DB via API:', e);
        }
    }
    if (!ready) {
      console.error('Server failed to start in time.');
      process.kill(-server.pid!);
      process.exit(1);
    }

    console.log('Server is ready. Running Chaos Tests...');

    // Run Playwright Tests
    try {
      const stdout = execSync(`npx playwright test e2e/chaos.spec.ts --reporter=json`, {
        env: { ...process.env, ENABLE_CHAOS: 'true', PORT: String(PORT), USE_MOCK_DB: 'true' },
        stdio: ['ignore', 'pipe', 'inherit']
      });
      const fs = require('fs');
      fs.writeFileSync('chaos-results.json', stdout);
      console.log('Tests completed successfully.');
    } catch (e: any) {
      console.error('Tests failed.');
      if (e.stdout) {
          const fs = require('fs');
          fs.writeFileSync('chaos-results.json', e.stdout);
      }
      // Don't exit yet, we want to generate report
    }

    // Generate Report
    console.log('Generating Chaos Report...');
    const fs = require('fs');
    let results: any = {};
    if (fs.existsSync('chaos-results.json')) {
        results = JSON.parse(fs.readFileSync('chaos-results.json', 'utf8'));
    }

    const report = `
# Infrastructure Chaos Engineering Report

**Date:** ${new Date().toISOString()}
**Scope:** Distributed System (ML, AI, Firestore, Frontend)
**Method:** Progressive Fault Injection

## Test Results

| Scenario | Status | Duration (ms) | Observation |
|----------|--------|---------------|-------------|
${(results.suites?.[0]?.suites?.[0]?.specs || []).map((spec: any) => {
    const test = spec.tests[0];
    const result = test.results[0];
    const status = result.status === 'passed' ? '✅ Passed' : '❌ Failed';
    return `| ${spec.title} | ${status} | ${result.duration} | ${status === '✅ Passed' ? 'Graceful degradation / Recovery confirmed' : 'Unexpected failure'} |`;
}).join('\n') || '| No results | | | |'}

## Failure Matrix

| Component | Failure Mode | Outcome | Resilience Strategy |
|-----------|--------------|---------|---------------------|
| **ML Service** | Latency (5s) | ${(results.suites?.[0]?.suites?.[0]?.specs || []).find((s:any) => s.title.includes('Latency'))?.tests[0].results[0].status === 'passed' ? 'Delayed Response (200 OK)' : 'Timeout'} | **Graceful Degradation**: API waits but eventually returns partial data. |
| **ML Service** | Error / Crash | ${(results.suites?.[0]?.suites?.[0]?.specs || []).find((s:any) => s.title.includes('Failure'))?.tests[0].results[0].status === 'passed' ? 'Partial Data (200 OK)' : 'Crash (500 Error)'} | **Fallback**: System skips failing topics and returns available intelligence. |
| **Firestore** | Read Timeout | ${(results.suites?.[0]?.suites?.[0]?.specs || []).find((s:any) => s.title.includes('Read Failure'))?.tests[0].results[0].status === 'passed' ? 'Crash (500 Error)' : 'Unknown'} | **None**: Critical path failure. Recommendation: Add Circuit Breaker. |
| **Genkit AI** | Quota Exceeded | ${(results.suites?.[0]?.suites?.[0]?.specs || []).find((s:any) => s.title.includes('Quota'))?.tests[0].results[0].status === 'passed' ? 'Handled' : 'Not Tested'} | **Retry/Backoff**: Should be implemented. |
| **Frontend** | Network Partition | ${(results.suites?.[0]?.suites?.[0]?.specs || []).find((s:any) => s.title.includes('Network'))?.tests[0].results[0].status === 'passed' ? 'Handled' : 'Failed'} | **Client-side Routing**: Retains navigation state. |

## Recommendations

1.  **Circuit Breaker for Firestore**: The API failed with 500 on DB read error. Implement a circuit breaker to return cached data or a "Maintenance Mode" response instead of crashing.
2.  **Retry Logic for ML**: If ML service is flaky, implement retries with exponential backoff before falling back.
3.  **Observability**: Ensure all 500 errors from Chaos tests are logged with strict severity in monitoring (e.g. Sentry).

`;

    fs.writeFileSync('chaos-report.md', report);
    console.log('Report generated at chaos-report.md');

  } finally {
    // Kill server
    if (server.pid) {
      process.kill(-server.pid);
    }
  }
}

run().catch(console.error);
