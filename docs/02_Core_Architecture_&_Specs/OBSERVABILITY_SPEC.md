# Distributed Tracing & Observability Infrastructure Spec

## Executive Summary
This document outlines the architectural strategy for implementing end-to-end distributed tracing in the SANKALP platform. The goal is to transform system observability from opaque "black box" operations into a transparent, measurable pipeline.

Based on initial benchmarks, the primary latency contributor is LLM generation (~2s), while ML inference is highly performant (~4ms) after an initial cold start (~2.6s). This specification prioritizes visualizing these latencies and correlating errors across the Next.js/Python boundary.

## Architecture & Service Boundaries

The system consists of the following key components where trace context must be propagated:

```mermaid
graph TD
    User[User Action] -->|Trace ID Generated| Frontend[Next.js Client]
    Frontend -->|HTTP Headers (traceparent)| ServerAction[Next.js Server Action]

    subgraph "Backend Services"
        ServerAction -->|Internal Span| MLBridge[ML Bridge (Node.js)]
        MLBridge -->|JSON Payload (_trace_id)| Python[Python Inference Process]
        ServerAction -->|Internal Span| ADK[ADK Decision Engine]
        ServerAction -->|API Call| LLM[Genkit / LLM Provider]
        ServerAction -->|DB Call| Firestore[Firebase Firestore]
    end
```

### Trace ID Propagation Points
1.  **Frontend -> Server Action**: Next.js automatically handles some of this, but we must ensure `traceparent` headers are included in `fetch` calls or Server Actions.
2.  **Node.js -> Python Subprocess**:
    -   **Mechanism**: Pass the Trace ID in the JSON payload sent to `stdin`.
    -   **Implementation**: Update `predictMastery` payload to include `_trace_id`. Update `predict_mastery.py` to extract this ID and start a span with it as parent.
3.  **Node.js -> LLM**:
    -   **Mechanism**: The Genkit SDK should be configured to include trace context in metadata or headers.
    -   **Implementation**: Use Genkit's `telemetry` hooks or wrap `generate` calls in a custom span.

## Trace Instrumentation Plan

### 1. Instrumentation Setup
Modify `src/instrumentation.ts` to initialize the OpenTelemetry Node.js SDK alongside Sentry.
-   **SDK**: `@opentelemetry/sdk-node`
-   **Exporters**: OTLP Trace Exporter (sending to Jaeger, honeycomb, or similar).
-   **Auto-instrumentation**: `@opentelemetry/auto-instrumentations-node` for HTTP, Express, etc.

### 2. Span Definitions & Metadata

#### A. Quiz Submission Flow (`src/app/api/quiz/submit`)
*   **Span Name**: `quiz.submit`
*   **Tags**: `student_id`, `topic`, `score`, `questions_attempted`

#### B. Smart Revision Planner Flow (`src/ai/flows/smart-revision-planner.ts`)
This is the core complex flow.

| Span Name | Parent | Start Trigger | End Trigger | Metadata (Tags) |
| :--- | :--- | :--- | :--- | :--- |
| `revision.plan.generate` | Root | `smartRevisionPlanner` called | Function returns | `student_id`, `brain_map_topics_count` |
| `data.fetch.history` | `revision.plan.generate` | `getStudent`, `getQuizResults` | Data returned | `history_length`, `cache_hit` |
| `topic.process` | `revision.plan.generate` | Loop start for topic | Loop end | `topic_name` |
| `feature.extraction` | `topic.process` | `extractMasteryFeatures` | Returns features | `attempts`, `days_since_revision` |
| `ml.predict.mastery` | `topic.process` | `predictMastery` call | Prediction returned | `model_version`, `prediction_source` (API/Process) |
| `adk.decision` | `topic.process` | `makeRevisionDecision` | Decision returned | `decision_action`, `priority` |
| `llm.generate.explanation` | `revision.plan.generate` | `explanationPrompt` | Response received | `llm_model`, `prompt_tokens`, `completion_tokens` |

#### C. ML Bridge (`src/ml/inference/ml-bridge.ts`)
*   **Span Name**: `ml.bridge.invoke`
*   **Tags**: `method` (api vs subprocess), `python_script_path`
*   **Context Propagation**:
    *   **Subprocess**: Add `_trace_id` field to the JSON input.

### 3. Python Instrumentation (`src/ml/inference/predict_mastery.py`)
*   Initialize `opentelemetry-instrumentation` in Python.
*   Read `_trace_id` from JSON input to link spans.
*   **Span Name**: `ml.inference.python`
*   **Tags**: `model_load_time`, `inference_time`, `input_features`.

## Bottleneck Detection Strategy & Analysis

Based on benchmark data collected via `scripts/measure-latency.ts`:

### Ranked Bottlenecks
1.  **LLM Generation (Genkit)**: ~2,000ms (Simulated/Estimated). This is the dominant factor in request latency.
    -   *Impact*: User waits 2-5 seconds for revision plans.
    -   *Optimization*: Streaming responses, caching common explanations.
2.  **ML Cold Start**: ~2,600ms (First request only).
    -   *Impact*: First user after deployment/restart experiences significant delay.
    -   *Optimization*: Pre-warm the Python process during server startup.
3.  **ML Inference (Steady State)**: ~4ms.
    -   *Impact*: Negligible.
    -   *Status*: Highly optimized.
4.  **ADK Decision**: < 1ms.
    -   *Impact*: Negligible.
    -   *Status*: Highly optimized.

### Analysis Strategy
1.  **Monitor Cold Starts**: Track the frequency of spans > 1s in `ml.predict.mastery`.
2.  **Monitor LLM Latency**: Track P90 latency of `llm.generate.explanation`.

## Error Correlation Examples

### Scenario 1: ML Prediction Failure
**Symptom**: User sees "Recommended for revision based on learning history" (fallback reason).
**Trace Analysis**:
1.  Find trace for `revision.plan.generate`.
2.  Look for `ml.predict.mastery` span.
3.  **Status**: `Error`.
4.  **Error Event**: "Python process exited with code 1".
5.  **Drill Down**: Look at `ml.inference.python` span (if available) or `stderr` logs attached to the span.
6.  **Root Cause**: `ModuleNotFoundError: joblib` (as seen in benchmarks).

### Scenario 2: Slow Dashboard Load
**Symptom**: Dashboard takes 8 seconds to load.
**Trace Analysis**:
1.  Find trace for `dashboard.load`.
2.  Flame graph shows 10 sequential `ml.predict.mastery` calls.
3.  **Insight**: Requests are serial instead of parallel.
4.  **Fix**: Use `Promise.all` or `batchPredictMastery`.

## Visualization: Flame Graphs (Conceptual)

### Happy Path (Warm Cache, Parallel Execution)
```mermaid
gantt
    title Request Trace: Smart Revision Plan
    dateFormat  s
    axisFormat %S

    section Server Action
    revision.plan.generate :active, 0, 3.5

    section Data Fetch
    data.fetch.history : 0.1, 0.3

    section Topic Processing (Parallel)
    Topic A (Feature) : 0.3, 0.35
    Topic A (ML) : 0.35, 0.36
    Topic A (ADK) : 0.36, 0.37

    Topic B (Feature) : 0.3, 0.35
    Topic B (ML) : 0.35, 0.36
    Topic B (ADK) : 0.36, 0.37

    section LLM
    llm.generate.explanation : 0.5, 3.0
```

### Bottleneck Path (Cold Start, Serial Execution)
```mermaid
gantt
    title Request Trace: Smart Revision Plan (Cold Start)
    dateFormat  s
    axisFormat %S

    section Server Action
    revision.plan.generate :active, 0, 6.0

    section ML (Cold Start)
    ML Spawn Process : 0.3, 2.9
    ML Inference : 2.9, 2.95

    section LLM
    llm.generate.explanation : 3.0, 5.5
```

## Performance Baseline Report

Actual measurements from `scripts/measure-latency.ts`:

| Operation | P50 (Median) | P90 | P99 | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **ML Inference (Steady)** | ~4ms | ~5ms | ~10ms | Extremely fast after initialization. |
| **ML Inference (Cold)** | ~2,600ms | N/A | N/A | Happens once per process start. |
| **ADK Decision** | < 1ms | < 1ms | ~1ms | Negligible overhead. |
| **LLM Response** | ~2,000ms* | ~3,500ms* | ~5,000ms* | *Estimated/Simulated. |

## Alerting Threshold Recommendations

| Metric | Condition | Severity | Action |
| :--- | :--- | :--- | :--- |
| **Global Error Rate** | > 1% of requests | HIGH | PagerDuty to On-Call |
| **LLM Latency** | P90 > 5s for 5m | MEDIUM | Check Status Page / Switch Model |
| **ML Cold Start Freq** | > 10 / hour | MEDIUM | Investigate process crashes/restarts |
| **Trace Duration** | P99 > 8s | LOW | Log for weekly review |

## Cost Attribution Model

We will attach cost-related metadata to spans to enable financial observability.

**1. LLM Costs**
*   **Span**: `llm.generate.explanation`
*   **Attributes**:
    *   `model`: `gemini-1.5-flash`
    *   `input_tokens`: `150` (measured from response usage metadata)
    *   `output_tokens`: `50`
*   **Calculation**: `(input_tokens * cost_per_input) + (output_tokens * cost_per_output)`

**2. Database Costs**
*   **Span**: `firestore.read` / `firestore.write`
*   **Attributes**:
    *   `collection`: `quizResults`
    *   `operation`: `read`
    *   `documents_read`: `10`
*   **Calculation**: `documents_read * cost_per_read`

**3. Compute Costs**
*   **Span**: `ml.inference.python`
*   **Attributes**:
    *   `duration_ms`: `120`
*   **Calculation**: CPU time attribution based on instance cost.
