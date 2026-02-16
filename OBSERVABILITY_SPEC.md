# Distributed Tracing & Observability Infrastructure Spec

## Executive Summary
This document outlines the architectural strategy for implementing end-to-end distributed tracing in the SANKALP platform. The goal is to transform system observability from opaque "black box" operations into a transparent, measurable pipeline. This infrastructure will enable:
1.  **Performance Optimization**: Identify and resolve bottlenecks (e.g., slow ML inference vs. LLM latency).
2.  **Root Cause Analysis**: Correlate errors across service boundaries (Frontend -> Node.js -> Python -> LLM).
3.  **Cost Attribution**: Track resource consumption (LLM tokens, DB reads) per user feature.

## Architecture & Service Boundaries
The system consists of the following key components where trace context must be propagated:

```mermaid
graph TD
    User[User Action] -->|Trace ID Generated| Frontend[Next.js Client]
    Frontend -->|HTTP Headers (traceparent)| ServerAction[Next.js Server Action]
    ServerAction -->|Internal Span| MLBridge[ML Bridge (Node.js)]
    MLBridge -->|Env Var / Args| Python[Python Inference Process]
    ServerAction -->|Internal Span| ADK[ADK Decision Engine]
    ServerAction -->|API Call| LLM[Genkit / LLM Provider]
    ServerAction -->|DB Call| Firestore[Firebase Firestore]
```

### Trace ID Propagation Points
1.  **Frontend -> Server Action**: Next.js automatically handles some of this, but we must ensure `traceparent` headers are included in `fetch` calls or Server Actions.
2.  **Node.js -> Python Subprocess**: The `Trace ID` and `Span ID` must be passed to the Python script, either via environment variables (`OTEL_TRACE_ID`, `OTEL_SPAN_ID`) or command-line arguments.
3.  **Node.js -> LLM**: The Genkit SDK should be configured to include trace context in metadata or headers if supported by the provider.

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
    *   If using API: Add `traceparent` header.
    *   If using Subprocess: Pass `OTEL_TRACE_ID` in `env` options of `spawn`.

### 3. Python Instrumentation (`src/ml/inference/predict_mastery.py`)
*   Initialize `opentelemetry-instrumentation` in Python.
*   Read `OTEL_TRACE_ID` from environment to link spans.
*   **Span Name**: `ml.inference.python`
*   **Tags**: `model_load_time`, `inference_time`, `input_features`.

## Bottleneck Detection Strategy

We will identify bottlenecks by analyzing span duration percentiles (P50, P90, P99).

| Span Category | Expected Latency | Bottleneck Threshold | Potential Cause |
| :--- | :--- | :--- | :--- |
| **Feature Extraction** | < 10ms | > 50ms | Inefficient data processing / Large history arrays |
| **ML Inference (API)** | < 100ms | > 300ms | Network latency, Model cold start |
| **ML Inference (Subprocess)**| < 200ms | > 1s | Python startup cost, Disk I/O |
| **ADK Decision** | < 5ms | > 20ms | Complex rule evaluation |
| **LLM Generation** | 1-3s | > 8s | Large prompt, Provider latency, Rate limits |
| **Firestore Read** | < 50ms | > 200ms | Missing indexes, Large result sets |

**Analysis Strategy**:
1.  Group traces by `trace_id`.
2.  Calculate duration of each span.
3.  Flag traces where Total Duration > 5s.
4.  Identify the "Critical Path" (sequence of spans that determine total time).

## Error Correlation Examples

### Scenario 1: ML Prediction Failure
**Symptom**: User sees "Recommended for revision based on learning history" (fallback reason).
**Trace Analysis**:
1.  Find trace for `revision.plan.generate`.
2.  Look for `ml.predict.mastery` span.
3.  **Status**: `Error`.
4.  **Error Event**: "Python process exited with code 1".
5.  **Drill Down**: Look at `ml.inference.python` span (if available) or `stderr` logs attached to the span.
6.  **Root Cause**: `ModuleNotFoundError: sklearn` in Python environment.

### Scenario 2: Slow Dashboard Load
**Symptom**: Dashboard takes 8 seconds to load.
**Trace Analysis**:
1.  Find trace for `dashboard.load`.
2.  Flame graph shows 10 sequential `ml.predict.mastery` calls.
3.  **Insight**: Requests are serial instead of parallel.
4.  **Fix**: Use `Promise.all` or `batchPredictMastery`.

## Visualization: Flame Graphs (Conceptual)

### Happy Path (Parallel Execution)
```text
[------------------ revision.plan.generate (3.2s) ------------------]
  [-- data.fetch (0.2s) --]
  [-- topic.process (Topic A) (0.3s) --]
      [- feat -] [- ml (0.1s) -] [- adk -]
  [-- topic.process (Topic B) (0.3s) --]
      [- feat -] [- ml (0.1s) -] [- adk -]
                                            [-- llm.explanation (2.5s) --]
```

### Bottleneck Path (Serial ML Calls)
```text
[-------------------------- revision.plan.generate (6.5s) --------------------------]
  [-- Topic A --] [-- Topic B --] [-- Topic C --] ... (10x serial calls)
      [ml 0.5s]       [ml 0.5s]       [ml 0.5s]
                                                   [-- llm.explanation (1.5s) --]
```

## Performance Baseline Report

Estimated baselines based on current architecture:

| Operation | P50 Target | P90 Target | P99 Target |
| :--- | :--- | :--- | :--- |
| **Quiz Submission** | 200ms | 500ms | 1s |
| **Smart Revision Plan** | 3s | 5s | 8s |
| **ML Inference (Single)**| 50ms | 100ms | 500ms |
| **LLM Response** | 2s | 4s | 10s |

## Alerting Threshold Recommendations

| Metric | Condition | Severity | Action |
| :--- | :--- | :--- | :--- |
| **Global Error Rate** | > 1% of requests | HIGH | PagerDuty to On-Call |
| **LLM Latency** | P90 > 8s for 5m | MEDIUM | Check Status Page / Switch Model |
| **ML Bridge Failure** | > 5 failures / min | HIGH | Restart Python Service |
| **Trace Duration** | P99 > 10s | LOW | Log for weekly review |

## Cost Attribution Model

We will attach cost-related metadata to spans to enable financial observability.

**1. LLM Costs**
*   **Span**: `llm.generate.explanation`
*   **Attributes**:
    *   `model`: `gemini-pro`
    *   `input_tokens`: `150`
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

## Implementation Roadmap

1.  **Phase 1: Foundation**: Install OpenTelemetry SDK in `src/instrumentation.ts`.
2.  **Phase 2: Critical Paths**: Instrument `smart-revision-planner.ts` and `ml-bridge.ts`.
3.  **Phase 3: Deep Dive**: Instrument Python scripts and propagate context.
4.  **Phase 4: Dashboarding**: Set up Grafana/Jaeger and build alerts.
