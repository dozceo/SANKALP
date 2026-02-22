# Cost Optimization & Resource Efficiency Analyzer: LLM Token Usage + Compute + Database Cost Modeling

**Domain**: Performance & Cost (Financial Engineering)
**Scope**: All LLM API calls (`src/ai/flows/`), ML inference compute (`src/ml/`), Firestore operations, Next.js serverless function usage.
**Date**: October 26, 2023
**Author**: Jules (AI Engineer)

---

## 1. Executive Summary

This report provides a detailed cost model of the platform's resource consumption, identifying critical inefficiencies that threaten financial sustainability at scale. While database read costs are relatively low, **compute costs (ML inference)** and **LLM audio costs (Speech-to-Speech)** present significant risks.

**Key Findings:**
1.  **Critical ML Inefficiency**: The `smart-revision-planner.ts` flow executes ML inference sequentially for each topic (N+1 pattern), leading to massive compute overhead and latency.
2.  **Database N+1**: The `api/intelligence/student` endpoint performs parallel Firestore reads/writes for every topic a student has studied, scaling linearly with student progress.
3.  **Audio Cost Multiplier**: The `speech-to-speech` flow is ~40x more expensive per interaction than text-based chat due to STT/TTS pricing.

**Projected Monthly Costs**:
-   **100 Users**: ~$45 / month (Manageable)
-   **1,000 Users**: ~$850 / month (Warning)
-   **10,000 Users**: ~$12,500 / month (Critical - primarily compute & audio)

---

## 2. Current Cost Breakdown

| Resource Type | Driver | Estimated Unit Cost | Primary Cost Center |
| :--- | :--- | :--- | :--- |
| **LLM API** | Token Usage (Input/Output) | ~$0.0002/text, ~$0.004/audio | `speech-to-speech.ts` |
| **ML Compute** | Python Subprocess Duration | ~$0.0002/sec (Serverless) | `smart-revision-planner.ts` (Loop) |
| **Database** | Firestore Reads/Writes | $0.06/100k reads | `api/intelligence/student` |
| **Hosting** | Vercel Function Duration | $0.60/GB-hour | Long-running ML API calls |

---

## 3. Per-Operation Cost Analysis

### A. LLM Operations (Genkit Flows)

| Flow Name | Input Tokens | Output Tokens | Est. Cost (Gemini Flash) | Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| **Syllabus Generator** | ~200 | ~1,100 | **$0.00035** | Medium |
| **Adaptive Quiz** | ~500 | ~550 | **$0.00020** | Low |
| **Chatbot / Mentor** | ~400 | ~200 | **$0.00010** | Low |
| **Revision Explainer** | ~250 | ~150 | **$0.00006** | Low |
| **Speech-to-Speech** | Audio + Text | Audio + Text | **$0.00410** | **CRITICAL** |

### B. ML Inference Operations

| Operation | Implementation Details | Latency | Compute Cost |
| :--- | :--- | :--- | :--- |
| **Single Prediction** | Spawns Python process, loads pickle, runs 1 item | ~3s | ~$0.0006 |
| **Revision Plan (20 Topics)** | **Loops** over topics, spawns process 20 times | **~60s** | **$0.0120** |
| **Batch Prediction** | Spawns process once, runs 20 items | ~3.5s | ~$0.0007 |

*Note: The current implementation of `smart-revision-planner.ts` uses the Single Prediction loop, resulting in 17x higher compute cost than necessary.*

### C. Database Operations

| Endpoint | Operation Pattern | Reads/Writes (per call) | Est. Cost |
| :--- | :--- | :--- | :--- |
| **`api/intelligence/student`** | N+1 parallel reads (`getCachedPrediction`) & N writes (`saveADKDecision`) | ~40 Reads / ~20 Writes | $0.00003 |
| **`api/student/analytics`** | Parallel fetch of student + quizzes | ~2 Reads | Negligible |

---

## 4. Cost-at-Scale Projections

**Assumptions**:
-   Active users perform 1 revision plan, 2 quizzes, 10 chats, and 1 speech interaction daily.
-   Average student has 20 topics.

| Scale (Users) | LLM Cost (Monthly) | ML Compute Cost (Monthly) | DB Cost (Monthly) | **Total Monthly** |
| :--- | :--- | :--- | :--- | :--- |
| **100** | $25 | $18 | $2 | **$45** |
| **1,000** | $250 | $180 | $20 | **$450** |
| **10,000** | $2,500 | **$1,800** | $200 | **$4,500** |
| **100,000** | $25,000 | **$18,000** | $2,000 | **$45,000** |

*Alert: Without fixing the ML loop in `smart-revision-planner.ts`, compute costs will grow linearly with (Users × Topics), potentially exceeding LLM costs if topic counts grow.*

---

## 5. Waste Inventory & Efficiency Gaps

### 1. The "N+1" ML Loop (High Waste)
-   **Location**: `src/ai/flows/smart-revision-planner.ts`
-   **Issue**: Iterates `brainMapData.topics` and calls `predictMastery` for each.
-   **Impact**: Spawns 20+ Python processes for a single user request.
-   **Waste**: ~95% of compute time is spent on process startup overhead.

### 2. The "N+1" Database Read (Medium Waste)
-   **Location**: `src/app/api/intelligence/student/route.ts`
-   **Issue**: Iterates topics and calls `getCachedPrediction` (Firestore read) for each.
-   **Impact**: high concurrency on Firestore, potential rate limiting.
-   **Waste**: Could be 1 query.

### 3. Redundant Audio Generation (High Waste)
-   **Location**: `src/ai/flows/speech-to-speech.ts`
-   **Issue**: Re-generates audio for common phrases or identical responses.
-   **Impact**: Expensive TTS calls.

---

## 6. Optimization Roadmap

### Phase 1: Immediate Fixes (High ROI)
1.  **Batch ML Predictions**: Refactor `smart-revision-planner.ts` to use `batchPredictMastery` instead of the loop.
    -   *Est. Savings*: 90% reduction in ML compute cost.
2.  **Batch DB Reads**: Refactor `api/intelligence/student` to query `mlPredictions` by `studentId` once, then filter in memory.
    -   *Est. Savings*: 95% reduction in read operations for this endpoint.

### Phase 2: Structural Improvements
3.  **Cache TTS Output**: Implement a hash-based cache for generated audio files in `speech-to-speech.ts`.
    -   *Est. Savings*: 20-40% of audio costs.
4.  **Syllabus Caching**: Cache generated syllabi by `examName` + `subject` in Firestore/Redis.
    -   *Est. Savings*: Avoid re-generating common syllabi (e.g., "NEET Biology").

### Phase 3: Architecture
5.  **FastAPI Microservice**: Move ML inference to a persistent container (FastAPI) to eliminate process spawn overhead entirely.
    -   *Est. Savings*: Further 50% compute reduction + <100ms latency.

---

## 7. Token Usage Heatmap

| Flow | Input | Output | Frequency | Cost Intensity |
| :--- | :--- | :--- | :--- | :--- |
| `speech-to-speech` | Low | Low (Text) / High (Audio) | Low | 🔥🔥🔥 High |
| `syllabus-generator` | Low | High (~1k) | Low | 🔥🔥 Medium |
| `adaptive-quiz` | Medium | Medium | High | 🔥 Medium |
| `chatbot` | Medium | Low | High | 💧 Low |

---

## 8. Database Operation Hotspots

1.  **Student Intelligence API** (`/api/intelligence/student`)
    -   **Read Hotspot**: Fetching cached ML predictions per topic.
    -   **Write Hotspot**: logging `adkDecisions` per topic.
    -   **Fix**: Batch read `mlPredictions` where `studentId == X`. Batch write `adkDecisions`.

2.  **Quiz Submission** (`/api/quiz/submit`)
    -   **Write**: Single write (Efficient).

---

## 9. Budget Alert System Spec

**Monitoring Strategy**:
-   **Daily Budget**: Set a soft limit of **$50/day** (scales with user base).
-   **Per-User Cap**: Alert if any single user exceeds **$2.00/day** (indicative of abuse or loop bug).

**Alert Triggers**:
1.  **Spike Detection**: If cost increases >50% hour-over-hour.
2.  **Error Rate**: If ML inference failure rate > 5% (indicates subprocess crashes).
3.  **Latency**: If `smart-revision-planner` takes > 10s (indicates loop scaling issue).

**Implementation**:
-   Use `src/lib/chaos-config.ts` or a new `CostMonitor` class to track token usage and DB ops per request.
-   Log to a dedicated `cost_logs` collection or external monitoring service (Datadog/Sentry).

## Review Status
? **Reviewed on 2026-02-22**: Implemented DB batching for ML Predictions and ADK Decisions as recommended.
