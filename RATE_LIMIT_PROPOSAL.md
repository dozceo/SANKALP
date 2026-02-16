# ML Prediction Rate Limit Proposal

## Current Architecture Analysis
The current ML inference architecture uses a persistent Python subprocess (`predict_mastery.py`) managed by a Node.js bridge (`ml-bridge.ts`).
*   **Communication:** Stdin/Stdout over a pipe.
*   **Concurrency:** The Python script is single-threaded and processes requests sequentially.
*   **Queueing:** `ml-bridge.ts` pushes requests to the Python process's stdin immediately and tracks them in an unbounded `pendingRequests` Map.
*   **Timeout:** There is a hard 5-second timeout in Node.js for each request.

## Risks
1.  **Request Queue Saturation:** If the arrival rate of prediction requests exceeds the Python processing rate, the operating system's pipe buffer will fill up, and the `pendingRequests` Map will grow indefinitely, leading to memory leaks in Node.js.
2.  **Timeout Cascades:** If the queue length causes the wait time to exceed 5 seconds, requests will fail in Node.js, but the Python process will still process them (wasted compute), delaying valid subsequent requests.
3.  **No Backpressure:** The bridge accepts an infinite number of requests.

## Rate Limit Proposal

### 1. Implement Concurrency Limiting (Semaphore)
Instead of an unbounded queue, limit the number of concurrent "in-flight" requests to the Python bridge.

**Recommended Limit:** `50` concurrent requests.
**Implementation:**
Use a library like `p-limit` or a custom semaphore in `ml-bridge.ts`.

```typescript
import pLimit from 'p-limit';
const limit = pLimit(50);

public predict(features: MasteryPredictionInput): Promise<MasteryPredictionOutput> {
  return limit(() => this._predictInternal(features));
}
```

### 2. Implement Request Timeout in Python
The Python script currently processes everything it receives. It should check if a request is "stale" (timestamp logic) or the bridge should support cancellation (complex). A simpler approach is for the Node bridge to drop the promise but managing the Python side is harder.
**Better approach:** The Node timeout is already 5s. We should lower the concurrency limit so that 50 requests *can* be processed within 5s.

### 3. Per-User Rate Limiting
To prevent a single user from monopolizing the inference engine (e.g., refreshing the dashboard spamming 50 requests):
**Limit:** 100 predictions per minute per user.
**Implementation:** Redis-based sliding window or simple in-memory token bucket if single instance.

### 4. Batch Processing Optimization
The current `batchPredictMastery` sends N individual lines to Python.
**Optimization:** Modify `predict_mastery.py` to accept a *batch* JSON array `[{}, {}, ...]` on a single line.
*   Reduces IPC overhead (1 write vs N writes).
*   Allows Python to use vectorized operations (e.g., `model.predict_proba(batch_features)` instead of loop).

## Proposed Configuration

| Setting | Value | Rationale |
| :--- | :--- | :--- |
| **Max Concurrent Requests** | 50 | Prevents pipe buffer overflow and keeps latency under 5s. |
| **Request Timeout** | 3000ms | 5s is too long for UI. Fail fast if overloaded. |
| **Per-User Rate Limit** | 60 req/min | Sufficient for typical dashboard usage (10-20 topics). |
| **Batch Size** | 20 | For `batchPredictMastery`, split into chunks of 20. |
