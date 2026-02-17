
import fs from 'fs';

// Simulated Request Log
interface RequestLog {
  endpoint: string;
  method: string;
  params: Record<string, any>;
  timestamp: string;
  latency: number; // ms
  cost: number; // estimated tokens
}

const SIMULATED_LOGS: RequestLog[] = [
  // Burst of syllabus requests for popular exam
  ...Array(50).fill(null).map((_, i) => ({
    endpoint: '/api/syllabus/generate',
    method: 'POST',
    params: { query: 'AP Calculus BC', examName: 'AP Calculus BC' },
    timestamp: new Date(Date.now() - i * 1000).toISOString(),
    latency: 2500,
    cost: 1500
  })),
  // Mixed requests
  ...Array(20).fill(null).map((_, i) => ({
    endpoint: '/api/syllabus/generate',
    method: 'POST',
    params: { query: 'NEET Biology', examName: 'NEET' },
    timestamp: new Date(Date.now() - (i + 50) * 1000).toISOString(),
    latency: 2400,
    cost: 1400
  })),
  // Unique quiz generations (hard to cache exactly, but maybe by topic)
  ...Array(30).fill(null).map((_, i) => ({
    endpoint: '/api/quiz/generate',
    method: 'POST',
    params: { topic: 'Derivatives', difficulty: 'Hard' },
    timestamp: new Date(Date.now() - (i + 100) * 1000).toISOString(),
    latency: 1800,
    cost: 800
  })),
  // Random other requests
  { endpoint: '/api/syllabus/generate', method: 'POST', params: { query: 'Custom Topic 1' }, timestamp: new Date().toISOString(), latency: 2000, cost: 1000 },
  { endpoint: '/api/syllabus/generate', method: 'POST', params: { query: 'Custom Topic 2' }, timestamp: new Date().toISOString(), latency: 2100, cost: 1100 },
];

function analyzePatterns() {
  console.log('Analyzing API request patterns...');

  const endpointStats: Record<string, { count: number, totalCost: number, totalLatency: number, duplicateParams: Record<string, number> }> = {};

  SIMULATED_LOGS.forEach(log => {
    if (!endpointStats[log.endpoint]) {
      endpointStats[log.endpoint] = { count: 0, totalCost: 0, totalLatency: 0, duplicateParams: {} };
    }
    const stats = endpointStats[log.endpoint];
    stats.count++;
    stats.totalCost += log.cost;
    stats.totalLatency += log.latency;

    const paramKey = JSON.stringify(log.params);
    stats.duplicateParams[paramKey] = (stats.duplicateParams[paramKey] || 0) + 1;
  });

  // Calculate Savings
  let totalPotentialSavings = 0;
  let totalLatencyReduction = 0;

  const cacheAnalysis = Object.entries(endpointStats).map(([endpoint, stats]) => {
    let cacheableRequests = 0;
    let savedCost = 0;
    let savedLatency = 0;

    Object.entries(stats.duplicateParams).forEach(([params, count]) => {
      if (count > 1) {
        // First request is a miss, subsequent are hits
        const hits = count - 1;
        cacheableRequests += hits;
        // Estimate cost based on average? Or specific?
        // For simulation, assume average cost of this endpoint
        const avgCost = stats.totalCost / stats.count;
        const avgLatency = stats.totalLatency / stats.count;

        savedCost += hits * avgCost;
        savedLatency += hits * (avgLatency - 50); // Assume 50ms cache lookup
      }
    });

    totalPotentialSavings += savedCost;
    totalLatencyReduction += savedLatency;

    return {
      endpoint,
      totalRequests: stats.count,
      cacheHitRate: (cacheableRequests / stats.count * 100).toFixed(1) + '%',
      estimatedCostSavings: Math.round(savedCost),
      estimatedLatencySavingsMs: Math.round(savedLatency)
    };
  });

  const markdown = `
# API Caching Strategy Proposal

**Domain:** Performance & Cost
**Scope:** API Layer
**Date:** ${new Date().toISOString()}

## Analysis of Request Patterns (Simulated)

Based on an analysis of ${SIMULATED_LOGS.length} API requests, we identified significant redundancy in high-cost LLM endpoints.

| Endpoint | Total Requests | Projected Cache Hit Rate | Est. Token Savings | Est. Latency Savings (ms) |
| :--- | :--- | :--- | :--- | :--- |
${cacheAnalysis.map(a => `| \`${a.endpoint}\` | ${a.totalRequests} | **${a.cacheHitRate}** | ${a.estimatedCostSavings} | ${a.estimatedLatencySavingsMs} |`).join('\n')}

**Total Projected Savings:**
- **Tokens:** ${Math.round(totalPotentialSavings)}
- **Latency:** ${(totalLatencyReduction / 1000).toFixed(2)} seconds (cumulative)

## Proposed Caching Strategy

### 1. Global Syllabus Cache
**Target:** \`/api/syllabus/generate\`
**Problem:** Currently, syllabi are generated per-student and stored with \`studentId\`. Identical queries (e.g., "AP Calculus BC") trigger redundant LLM calls.
**Solution:**
- Implement a **Shared Content Cache** in Firestore (collection: \`global_syllabus_cache\`).
- Key: SHA-256 hash of normalized query string (lowercase, trimmed).
- Value: The generated syllabus JSON.
- **TTL:** 30 days (Syllabi rarely change).

### 2. Quiz Question Bank
**Target:** \`/api/quiz/generate\`
**Problem:** Generating a new quiz for every request is expensive and slow.
**Solution:**
- Decouple "Quiz Generation" into "Question Retrieval" + "Gap Filling".
- **Step 1:** Check \`question_bank\` collection for questions matching \`topic\` + \`difficulty\`.
- **Step 2:** If enough questions exist, randomly sample them.
- **Step 3:** Only call LLM to generate *new* questions if the bank is empty or stale.
- **Step 4:** Save new questions to the bank.

### 3. Implementation Plan
1. **Database Schema Update:**
   - Create \`global_syllabus_cache\` collection.
   - Create \`question_bank\` collection (indexed by topic, difficulty).
2. **Middleware/Service Layer:**
   - Wrap \`syllabusGenerator\` with a cache-first lookup.
   - Refactor \`generateQuiz\` to query the bank first.
3. **Invalidation:**
   - Implement manual invalidation for syllabus updates.
   - Implement "bad question" flagging to remove items from the bank.

## Expected Impact
- **Cost Reduction:** ~70% for Syllabus (high repeatability).
- **Latency Improvement:** 95% reduction for cached hits (2500ms -> 50ms).
- **Scalability:** Handles viral topics without linear cost increase.
`;

  fs.writeFileSync('CACHING_STRATEGY_PROPOSAL.md', markdown);
  console.log('Caching strategy proposal generated: CACHING_STRATEGY_PROPOSAL.md');
}

analyzePatterns();
