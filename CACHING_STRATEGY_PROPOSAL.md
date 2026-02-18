
# API Caching Strategy Proposal

**Domain:** Performance & Cost
**Scope:** API Layer
**Date:** 2026-02-18T05:18:22.934Z

## Analysis of Request Patterns (Simulated)

Based on an analysis of 102 API requests, we identified significant redundancy in high-cost LLM endpoints.

| Endpoint | Total Requests | Projected Cache Hit Rate | Est. Token Savings | Est. Latency Savings (ms) |
| :--- | :--- | :--- | :--- | :--- |
| `/api/syllabus/generate` | 72 | **94.4%** | 99261 | 163861 |
| `/api/quiz/generate` | 30 | **96.7%** | 23200 | 50750 |

**Total Projected Savings:**
- **Tokens:** 122461
- **Latency:** 214.61 seconds (cumulative)

## Proposed Caching Strategy

### 1. Global Syllabus Cache
**Target:** `/api/syllabus/generate`
**Problem:** Currently, syllabi are generated per-student and stored with `studentId`. Identical queries (e.g., "AP Calculus BC") trigger redundant LLM calls.
**Solution:**
- Implement a **Shared Content Cache** in Firestore (collection: `global_syllabus_cache`).
- Key: SHA-256 hash of normalized query string (lowercase, trimmed).
- Value: The generated syllabus JSON.
- **TTL:** 30 days (Syllabi rarely change).

### 2. Quiz Question Bank
**Target:** `/api/quiz/generate`
**Problem:** Generating a new quiz for every request is expensive and slow.
**Solution:**
- Decouple "Quiz Generation" into "Question Retrieval" + "Gap Filling".
- **Step 1:** Check `question_bank` collection for questions matching `topic` + `difficulty`.
- **Step 2:** If enough questions exist, randomly sample them.
- **Step 3:** Only call LLM to generate *new* questions if the bank is empty or stale.
- **Step 4:** Save new questions to the bank.

### 3. Implementation Plan
1. **Database Schema Update:**
   - Create `global_syllabus_cache` collection.
   - Create `question_bank` collection (indexed by topic, difficulty).
2. **Middleware/Service Layer:**
   - Wrap `syllabusGenerator` with a cache-first lookup.
   - Refactor `generateQuiz` to query the bank first.
3. **Invalidation:**
   - Implement manual invalidation for syllabus updates.
   - Implement "bad question" flagging to remove items from the bank.

## Expected Impact
- **Cost Reduction:** ~70% for Syllabus (high repeatability).
- **Latency Improvement:** 95% reduction for cached hits (2500ms -> 50ms).
- **Scalability:** Handles viral topics without linear cost increase.
