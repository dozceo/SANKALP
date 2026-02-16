# API Response Caching Strategy Proposal

## Executive Summary
This proposal outlines a strategy to optimize API performance and reduce LLM costs by implementing targeted caching mechanisms. Analysis of the codebase reveals that while some flows (Syllabus, Quiz) utilize caching, high-latency and high-cost flows like Text-to-Speech and Concept Explanation remain uncached.

**Estimated Impact:**
- **Cost Reduction:** 40-60% on redundant queries (especially for common topics).
- **Latency Improvement:** Near-instant responses (<50ms) for cached content vs. 2-5s for AI generation.

## Current State Analysis

| Flow | Status | Cache Mechanism | Issues |
| :--- | :--- | :--- | :--- |
| **Syllabus Generator** | ✅ Cached | `unstable_cache` (24h) | Good implementation. |
| **Adaptive Quiz** | ✅ Cached | `unstable_cache` (1h) | Good, but sensitive to minor input variations. |
| **Smart Revision** | ❌ Uncached | None | Regenerates explanations every time. |
| **Mindful Mentor** | ❌ Uncached | None | Repeated concerns trigger new generation. |
| **Chatbot (Explanation)** | ❌ Uncached | None | Common concepts are regenerated repeatedly. |
| **Text-to-Speech** | ❌ Uncached | None | **Critical:** Expensive audio generation is never cached. |

## High-Value Caching Targets

### 1. Text-to-Speech (Critical)
**Rationale:** Audio generation is computationally expensive and slow.
**Strategy:**
- Cache the `textToSpeech` action based on the `text` input hash.
- Store the base64 audio string in a persistent store (e.g., Redis or Firebase Storage) rather than just in-memory if possible, or use `unstable_cache` for server-side caching.
- **TTL:** Long-term (e.g., 7-30 days) as the audio for a specific text string never changes.

### 2. Concept Explanations (Chatbot)
**Rationale:** Educational concepts (e.g., "Newton's Second Law") are static.
**Strategy:**
- Wrap `getExplanation` in `unstable_cache`.
- **Key:** `['explanation', concept.toLowerCase(), language]`.
- **TTL:** 24 hours or longer.
- **Normalization:** Lowercase and trim the concept input to increase cache hit rate.

### 3. Smart Revision Explanations
**Rationale:** The "reason" for revising a topic (e.g., "Spaced Repetition") is generic.
**Strategy:**
- Refactor `smartRevisionPlanner` to cache the explanation generation separately from the decision logic.
- Cache explanations by `topic` + `mastery_level_bucket` (High/Med/Low) instead of exact mastery percentage.

## Proposed Implementation Plan

### Phase 1: Immediate Wins (Low Effort, High Impact)
1.  Apply `unstable_cache` to `getExplanation` in `src/app/(main)/chat/actions.ts`.
2.  Apply `unstable_cache` to `getTextToSpeech` in `src/app/(main)/chat/actions.ts`.

### Phase 2: Optimization
1.  **Canonicalization:** Implement input normalization (trim, lowercase) for all cache keys to avoid "Physics" vs "physics" misses.
2.  **Shared Cache:** For `generateQuiz`, considering pre-generating a "Question Bank" for popular topics rather than on-demand caching.

### Phase 3: Infrastructure
1.  Move from `unstable_cache` (file-system/memory based in Next.js) to a distributed cache (Redis) if scaling to multiple server instances, ensuring consistency.
