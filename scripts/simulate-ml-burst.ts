
import { predictMastery } from '@/ml/inference/ml-bridge';
import { chaos } from '@/lib/chaos-config';

// Disable chaos for this test to measure pure performance
// chaos.disable(); // Assuming chaos config has a disable method or we can mock it.
// Actually, looking at ml-bridge.ts, it imports chaos from '@/lib/chaos-config'.
// We might not be able to easily disable it if it's a singleton without a setter, but let's try.

const CONCURRENCY = 50;
const TOTAL_REQUESTS = 50;

async function runBurst() {
  console.log(`Starting ML Burst Simulation with ${CONCURRENCY} concurrent requests...`);

  const startTime = Date.now();
  const requests = [];

  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    const featureInput = {
      avg_quiz_score: 0.8,
      attempts_per_topic: 2,
      days_since_last_revision: 5,
      quiz_score_variance: 0.1,
      time_spent_per_question: 45
    };

    requests.push(
      predictMastery(featureInput)
        .then(res => ({ status: 'fulfilled', value: res, id: i }))
        .catch(err => ({ status: 'rejected', reason: err, id: i }))
    );
  }

  const results = await Promise.all(requests);
  const endTime = Date.now();
  const duration = endTime - startTime;

  const successCount = results.filter(r => r.status === 'fulfilled').length;
  const failureCount = results.filter(r => r.status === 'rejected').length;

  console.log(`\nResults:`);
  console.log(`Total Duration: ${duration}ms`);
  console.log(`Throughput: ${(TOTAL_REQUESTS / (duration / 1000)).toFixed(2)} req/sec`);
  console.log(`Success: ${successCount}`);
  console.log(`Failure: ${failureCount}`);

  if (failureCount > 0) {
      console.log('Sample errors:', results.filter(r => r.status === 'rejected').slice(0, 3).map(r => (r as PromiseRejectedResult).reason));
  }

  // Generate Report
  const report = `# ML Prediction API Rate Limiting Proposal

**Date:** ${new Date().toISOString()}
**Test Scenario:** ${TOTAL_REQUESTS} requests with ${CONCURRENCY} concurrency.

## Performance Analysis
- **Total Duration:** ${duration}ms
- **Throughput:** ${(TOTAL_REQUESTS / (duration / 1000)).toFixed(2)} requests/second
- **Success Rate:** ${((successCount / TOTAL_REQUESTS) * 100).toFixed(1)}%

## Observations
The current implementation uses a persistent Python subprocess via \`stdin/stdout\`.
- If throughput is high, this architecture is efficient as it avoids process spawn overhead.
- However, if the Python script blocks or crashes, all pending requests in the queue will timeout.
- A single Python process is a bottleneck for CPU-bound tasks (Global Interpreter Lock).

## Rate Limit Proposal

| User Role | Rate Limit (Requests/Min) | Burst Allowance | Justification |
|-----------|---------------------------|-----------------|---------------|
| **Student** | 60 | 10 | Typical usage is 1 quiz submission every few minutes. 60/min allows for rapid UI navigation but prevents abuse. |
| **Teacher** | 300 | 50 | Teachers may view class dashboards triggering batch predictions for multiple students. |
| **System** | 1000 | 200 | Background jobs (e.g., nightly analysis) need higher throughput. |

## Recommendations
1. **Implement Token Bucket:** Use Redis or an in-memory rate limiter to enforce per-user limits.
2. **Horizontal Scaling:** If load increases, use a pool of Python workers (e.g., \`generic-pool\`) instead of a single singleton process.
3. **Circuit Breaker:** If the Python bridge fails repeatedly, fail fast and fall back to heuristic (non-ML) logic to avoid hanging requests.
`;

  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join('reports', 'RATE_LIMIT_PROPOSAL.md');
  if (!fs.existsSync('reports')) fs.mkdirSync('reports');
  fs.writeFileSync(reportPath, report);
  console.log(`Report generated at ${reportPath}`);

  // Clean up - force exit because the python child process might keep the node process alive
  process.exit(0);
}

runBurst().catch(console.error);
