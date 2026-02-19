# Rate Limit & Cost Control Proposal

**Date:** 2024-05-23
**Domain:** Performance & Cost
**Scope:** `src/ml/inference/ml-bridge.ts`, `src/app/api/intelligence/student`

## Executive Summary
A simulation of the ML inference bridge revealed a throughput bottleneck of approximately 41 requests/second. The current architecture allows unbounded concurrency on the Node.js side, which serializes requests to a single Python subprocess. Under high load (e.g., a teacher dashboard loading 30 students × 10 topics = 300 requests), the 5-second timeout in `ml-bridge.ts` will be exceeded, causing failure for ~33% of requests.

## Simulation Results
*   **Script:** `scripts/simulate_ml_load.js`
*   **Load:** 100 concurrent requests
*   **Total Time:** 2405ms
*   **Throughput:** ~41.58 req/sec
*   **Latency per Request:** ~24ms (sequential average)
*   **Risk:** A burst of >200 requests will cause the 5000ms timeout to trigger for queued requests.

## Issues Identified

### 1. Unbounded Concurrency in `ml-bridge.ts`
The `batchPredictMastery` function uses `Promise.all` to send all topic predictions to the bridge simultaneously.
```typescript
// src/ml/inference/ml-bridge.ts
const promises = topicFeatures.map(async ({ topic, features }) => {
    return bridge.predict(features); // Pushes to queue immediately
});
```
This floods the internal `pendingRequests` map and the stdin pipe.

### 2. Strict Timeout
The 5-second hard timeout in `bridge.predict` is too short for batch processing large cohorts.

### 3. API Route Exposure
The `/api/intelligence/student` route has no rate limiting. A malicious actor or a bug in the frontend could DoS the python bridge.

## Proposed Solutions

### 1. Implement Concurrency Limiting (Node.js Side)
Use `p-limit` to restrict the number of concurrent "in-flight" requests to the bridge, or simpler, process topics in chunks.

**Recommended Change in `ml-bridge.ts`:**
```typescript
import pLimit from 'p-limit';
const limit = pLimit(50); // Allow 50 concurrent inputs to buffer

export async function batchPredictMastery(topicFeatures) {
    const promises = topicFeatures.map(({ topic, features }) => {
        return limit(() => bridge.predict(features));
    });
    return Promise.all(promises);
}
```
*Note: Since the Python process is single-threaded, `p-limit` mainly helps manages the `pendingRequests` map size and prevents memory pressure, but the real fix for the timeout is increasing it or batching on the Python side.*

**Better Fix:** Send the *entire batch* to Python in one JSON object, process it in Python (vectorized), and return the batch. This avoids JSON serialization overhead for every single topic.

### 2. Rate Limiting Middleware
Implement a Token Bucket rate limiter for `/api/intelligence/student`.

**Policy:**
*   **Student:** 20 requests / minute
*   **Teacher:** 500 requests / minute (to allow dashboard loading)

### 3. Caching Strategy
Improve `getCachedPrediction` usage. Ensure that valid cache hits strictly bypass the ML bridge.

## Cost Exposure (Genkit)
For `generateQuiz` (LLM), we must implement strict rate limits as each call costs money.
*   **Limit:** 5 quizzes / hour / student.
*   **Action:** Add a database counter check in `generateQuiz` before calling `ai.generate`.
