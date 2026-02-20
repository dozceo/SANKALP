# Observability Infrastructure Specification

## 1. Trace Instrumentation Plan

This specification outlines the strategy to implement end-to-end distributed tracing across the SANKALP platform, covering Frontend, Next.js Backend, ML Services, and LLM Integrations. The goal is to provide visibility into request lifecycles, identify performance bottlenecks, and correlate errors across service boundaries.

### 1.1 Trace Context Propagation

To ensure a continuous trace across all services, a unique `Trace ID` must be generated at the entry point (Frontend) and propagated to all downstream services.

| Source Service | Destination Service | Propagation Mechanism | Implementation Detail |
| :--- | :--- | :--- | :--- |
| **Frontend (React)** | **Next.js API / Server Actions** | HTTP Headers | `traceparent` header (W3C Trace Context standard). |
| **Next.js Backend** | **ML Service (Python)** | JSON Payload | Inject `trace_id` and `span_id` into the JSON object sent to `stdin` of the Python subprocess. |
| **Next.js Backend** | **Genkit (LLM)** | Metadata | Pass `trace_id` in `ai.run` options or Genkit context to correlate LLM spans. |
| **Next.js Backend** | **Firestore** | SDK Instrumentation | Use `@opentelemetry/instrumentation-firestore` to automatically attach context. |

### 1.2 Instrumentation Points & Spans

We will use OpenTelemetry (OTEL) auto-instrumentation where possible, supplemented by manual instrumentation for custom logic.

#### A. Frontend (Browser)
*   **Library**: `@opentelemetry/sdk-trace-web`, `@opentelemetry/instrumentation-fetch`
*   **Spans**:
    *   `navigation`: Tracks page loads (e.g., `/home`, `/quiz`).
    *   `user_interaction`: Tracks clicks on key buttons (e.g., "Submit Quiz", "Generate Syllabus").
    *   `http_request`: Tracks `fetch` calls to `/api/*`.

#### B. Backend (Next.js Node.js)
*   **Library**: `@opentelemetry/sdk-node`, `@opentelemetry/instrumentation-http`, `@opentelemetry/instrumentation-fs`
*   **Spans**:
    *   `api_handler`: Wraps API routes (e.g., `GET /api/intelligence/student`).
    *   `server_action`: Wraps Server Actions (e.g., `createQuiz` in `src/app/(main)/quiz/actions.ts`).
    *   `db_operation`: Wraps Firestore calls in `src/lib/db-helpers.ts` (e.g., `getStudent`, `saveQuizResult`).

#### C. ML Service (Node.js <-> Python Bridge)
*   **Location**: `src/ml/inference/ml-bridge.ts`
*   **Span**: `ml_inference_request`
    *   **Start**: When `bridge.predict()` is called.
    *   **End**: When the promise resolves.
    *   **Metadata**: `student_id`, `topic`, `model_version`.
    *   **Context Injection**:
        ```typescript
        // In bridge.predict(features)
        const traceId = trace.getSpan(context.active()).spanContext().traceId;
        const payload = { ...features, _id: id, _trace_id: traceId };
        proc.stdin.write(JSON.stringify(payload) + "\n");
        ```

#### D. Python Inference Service
*   **Location**: `src/ml/inference/predict_mastery.py`
*   **Span**: `model_prediction`
    *   **Start**: After reading a line from `stdin` and parsing JSON.
    *   **End**: Before writing the result to `stdout`.
    *   **Metadata**: `input_features_hash`, `confidence_score`.
    *   **Implementation**: Use `opentelemetry-api` and `opentelemetry-sdk` in Python. Extract `_trace_id` from input JSON to create a child span.

#### E. Genkit / LLM (AI Service)
*   **Location**: `src/ai/genkit.ts`
*   **Span**: `llm_generation`
    *   **Start**: Inside `ai.defineFlow` or `ai.generate`.
    *   **End**: When the LLM response is received.
    *   **Metadata**: `prompt_name` (e.g., `adaptiveQuizPrompt`), `model` (`gemini-2.0-flash`), `token_usage_input`, `token_usage_output`.

---

## 2. Service Boundary Documentation

| Boundary | Type | Location in Code | Trace Requirements |
| :--- | :--- | :--- | :--- |
| **Frontend → API** | HTTP/Fetch | `src/app/(main)/home/page.tsx` (fetch intelligence) | Ensure `traceparent` header is included in `fetch` options. |
| **Frontend → Server Action** | RPC (Next.js) | `src/app/(main)/quiz/page.tsx` calls `createQuiz` | Next.js experimentally supports OTEL; verify context propagation for Server Actions. |
| **Node.js → Python** | Stdio Pipe | `src/ml/inference/ml-bridge.ts` (`proc.stdin.write`) | **Critical**: Must manually inject `_trace_id` into the JSON payload. |
| **Python → Node.js** | Stdio Pipe | `src/ml/inference/ml-bridge.ts` (`rl.on("line")`) | Correlate the response log with the request span using the `_id` (and implicitly the active trace if context is preserved). |
| **Node.js → Gemini API** | HTTP/REST | `src/ai/genkit.ts` | usage of `@genkit-ai/googleai` should automatically be traced if `http` instrumentation is enabled, but adding custom attributes for prompts is recommended. |
| **Node.js → Firestore** | gRPC/HTTP | `src/lib/db-helpers.ts` | `@opentelemetry/instrumentation-firestore` handles this automatically. |

---

## 3. Example Flame Graphs (Conceptual)

### 3.1 Scenario: Dashboard Load (`/home`)

**User Story**: Student logs in and views their dashboard. The system fetches intelligence data which triggers ML predictions.

```text
[Trace: 4bf92f3577b34da6a3ce929d0e0e4736]
|-- [span: navigation /home] (Frontend) -----------------------------------------------------> 1200ms
    |-- [span: fetch /api/intelligence/student] (Frontend HTTP) -----------------------------> 950ms
        |-- [span: GET /api/intelligence/student] (Backend API) -----------------------------> 900ms
            |-- [span: getStudent] (Firestore Read) ----------------------------------> 50ms
            |-- [span: getQuizResults] (Firestore Read) ------------------------------> 80ms
            |-- [span: batchPredictMastery] (Node.js) --------------------------------------> 600ms
                |-- [span: ml_inference_request topic="Algebra"] --------------------> 150ms
                    |-- [span: model_prediction] (Python) ----------------------> 140ms
                |-- [span: ml_inference_request topic="Calculus"] -------------------> 155ms (Sequential Wait)
                    |-- [span: model_prediction] (Python) ----------------------> 145ms
                |-- [span: ml_inference_request topic="Physics"] --------------------> 160ms (Sequential Wait)
                    |-- [span: model_prediction] (Python) ----------------------> 150ms
            |-- [span: makeRevisionDecision] (ADK Logic) -----------------------------> 10ms
            |-- [span: saveADKDecision] (Firestore Write) ----------------------------> 40ms
```

**Insight**: The flame graph reveals that `batchPredictMastery` takes 600ms because the Python `model_prediction` spans are executing sequentially (non-overlapping), despite `Promise.all` in Node.js, due to the single-threaded nature of the standard input loop in `predict_mastery.py`.

### 3.2 Scenario: Quiz Generation (`/quiz/create`)

**User Story**: Student requests a new quiz on "Photosynthesis".

```text
[Trace: 8a5b2c1d...]
|-- [span: click "Start Quiz"] (Frontend) ---------------------------------------------------> 3500ms
    |-- [span: server_action createQuiz] (Backend) ------------------------------------------> 3400ms
        |-- [span: generateQuiz] (AI Flow) --------------------------------------------------> 3350ms
            |-- [span: llm_generation prompt="adaptiveQuizPrompt"] (Genkit) -----------------> 3300ms
                |-- [span: http_post googleapis.com] (External API) -------------------> 3250ms
```

**Insight**: The entire latency is dominated by the LLM generation call.

---

## 4. Bottleneck Analysis

Based on the architectural review and conceptual traces, the following bottlenecks are identified:

### Rank 1: Sequential ML Inference (High Latency)
*   **Location**: `src/ml/inference/ml-bridge.ts` and `src/ml/inference/predict_mastery.py`
*   **Issue**: `ml-bridge.ts` sends batch requests concurrently using `Promise.all`, but `predict_mastery.py` reads `sys.stdin` synchronously in a loop. This effectively serializes parallel requests.
*   **Impact**: Dashboard load time increases linearly with the number of topics (N * InferenceTime).
*   **Detection**: Flame graph shows "staircase" pattern for `ml_inference_request` spans.
*   **Fix**: Update `predict_mastery.py` to accept batch inputs (JSON array) in a single line or implement a multi-threaded request handler in Python.

### Rank 2: LLM Latency (High Variance)
*   **Location**: `src/ai/genkit.ts`
*   **Issue**: Calls to Gemini 2.0 Flash can take 1-5 seconds.
*   **Impact**: Quiz generation and explanation features feel sluggish.
*   **Detection**: Long `llm_generation` spans with no internal activity.
*   **Fix**: Implement streaming responses for Quiz generation so the user sees questions appear one by one.

### Rank 3: Firestore Read Amplification
*   **Location**: `src/lib/db-helpers.ts` -> `getBatchedCachedPredictions`
*   **Issue**: Using `IN` queries with small chunks (size 10) is good, but frequent dashboard reloads trigger these reads every time.
*   **Impact**: Increased Firestore costs and latency.
*   **Detection**: High count of `firestore_read` spans per trace.

---

## 5. Performance Baselines & Alerting

We will establish the following baselines for "Normal" operation. Deviations trigger alerts.

| Operation | Metric | Target (P90) | Alert Threshold | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard Load** | Latency | < 1.5s | > 3.0s | Medium |
| **Quiz Submission** | Latency | < 500ms | > 1.5s | Low |
| **Smart Revision** | Latency | < 2.0s | > 5.0s | High |
| **ML Inference (Single)** | Latency | < 100ms | > 300ms | Medium |
| **ML Inference (Batch)** | Latency | < 800ms | > 2.0s | Medium |
| **LLM Generation** | Latency | < 4.0s | > 8.0s | Low (User Expectation) |
| **Error Rate** | % Errors | < 0.5% | > 2.0% | Critical |

---

## 6. Cost Attribution Model

To monitor unit economics, every trace involving paid resources (LLM, Database) will be tagged with cost metrics.

### 6.1 LLM Costs (Genkit)
*   **Metric**: `llm.token_count.input`, `llm.token_count.output`
*   **Tagging**: Add `model_id` (e.g., `gemini-2.0-flash`) to the span.
*   **Calculation**:
    *   Input Cost: `span.attributes['llm.token_count.input'] * $0.0001 / 1k`
    *   Output Cost: `span.attributes['llm.token_count.output'] * $0.0004 / 1k`

### 6.2 Database Costs (Firestore)
*   **Metric**: `db.operation.count`
*   **Tagging**: Add `db.collection` and `db.operation` (read/write) to the span.
*   **Calculation**:
    *   Read Cost: `count * $0.038 / 100k`
    *   Write Cost: `count * $0.115 / 100k`

### 6.3 Per-User Cost Analysis
By propagating `user_id` as a baggage item in the trace context, we can aggregate total costs per user per month.
*   **Query**: `sum(cost) where user_id = 'student_123'`

---

## 7. Error Correlation Examples

### Scenario: "ML Prediction Failed"
**Symptom**: User sees "Prediction unavailable" on the dashboard.

**Trace View**:
1.  **Frontend**: `GET /api/intelligence/student` (Status: 200 OK, but partial content)
2.  **Backend**: `batchPredictMastery` (Status: OK)
    *   **Span**: `ml_inference_request` (Status: ERROR)
        *   **Event**: `exception` -> "Timeout waiting for Python inference"
        *   **Log**: "Python process stderr: MemoryError"
3.  **Root Cause**: The trace links the generic API fallback response directly to a specific `MemoryError` in the Python subprocess, which would otherwise be hidden in detached logs.

### Scenario: "Quiz Save Failed"
**Symptom**: User completes quiz, but results are lost.

**Trace View**:
1.  **Frontend**: `POST /api/quiz/submit` (Status: 500)
2.  **Backend**: `saveQuizResult` (Status: ERROR)
    *   **Span**: `firestore_write` (Status: ERROR)
        *   **Attributes**: `code=PERMISSION_DENIED`, `collection=quizResults`
3.  **Root Cause**: Trace immediately identifies that the user's auth token was invalid or expired when attempting the write, rather than a logic error.
