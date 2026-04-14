import fs from 'fs';
import path from 'path';

// --- Configuration ---
const NUM_REQUESTS = 1000;
const CACHE_SIZES = [10, 50, 100];
// Cost Estimate: Gemini 1.5 Flash is roughly $0.35 / 1M input tokens, $1.05 / 1M output tokens.
// Assuming 100 input tokens + 1000 output tokens = 1.1k tokens total.
// Blended cost estimate per request:
// (100/1000000 * 0.35) + (1000/1000000 * 1.05) = 0.000035 + 0.00105 = $0.001085 per request.
const COST_PER_REQUEST = 0.001085;
const LATENCY_UNCACHED_MS = 2500; // Estimated from memory (2.5s)
const LATENCY_CACHED_MS = 50; // Redis/Memory access

// Common Queries (ranked by popularity for Zipfian simulation)
const QUERIES = [
  "AP Calculus BC", "AP Psychology", "Biology 101", "Chemistry Basics",
  "World History", "Physics Mechanics", "Algebra I", "Geometry",
  "English Literature", "Computer Science Principles", "Economics Micro",
  "Statistics", "Art History", "Music Theory", "Spanish I",
  "French I", "German I", "Latin", "Astronomy", "Environmental Science"
];

// --- Utilities ---

// Simple Zipfian distribution generator
// Rank 1 gets proportional to 1/1, Rank 2 to 1/2, etc.
function generateRequestStream(numRequests: number): string[] {
  const stream: string[] = [];
  const weights = QUERIES.map((_, i) => 1 / (i + 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  for (let i = 0; i < numRequests; i++) {
    let r = Math.random() * totalWeight;
    for (let j = 0; j < weights.length; j++) {
      r -= weights[j];
      if (r <= 0) {
        stream.push(QUERIES[j]);
        break;
      }
    }
    // Fallback for floating point precision issues
    if (stream.length <= i) {
        stream.push(QUERIES[0]);
    }
  }
  return stream;
}

class LRUCache {
  private capacity: number;
  private cache: Map<string, boolean>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  access(key: string): boolean {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, true);
      return true; // Hit
    } else {
      // Insert
      if (this.cache.size >= this.capacity) {
        // Remove first (least recently used)
        const firstKey = this.cache.keys().next().value;
        if (firstKey) this.cache.delete(firstKey);
      }
      this.cache.set(key, true);
      return false; // Miss
    }
  }
}

// --- Main Analysis ---

function runAnalysis() {
  const requests = generateRequestStream(NUM_REQUESTS);

  let report = `# API Response Caching Strategy Proposal\n\n`;
  report += `**Date:** ${new Date().toISOString()}\n`;
  report += `**Simulation:** ${NUM_REQUESTS} requests following Zipfian distribution.\n`;
  report += `**Baseline Cost (No Cache):** $${(NUM_REQUESTS * COST_PER_REQUEST).toFixed(2)}\n`;
  report += `**Baseline Latency (No Cache):** ${(NUM_REQUESTS * LATENCY_UNCACHED_MS / 1000).toFixed(1)}s (Total Wait Time)\n\n`;

  report += `## Cache Performance Analysis\n\n`;
  report += `| Cache Size | Hit Rate | Miss Rate | Est. Cost Savings | Latency Improvement |\n`;
  report += `|---|---|---|---|---|\n`;

  let bestStrategy = { size: 0, savings: 0 };

  CACHE_SIZES.forEach(size => {
    const cache = new LRUCache(size);
    let hits = 0;

    requests.forEach(req => {
      if (cache.access(req)) hits++;
    });

    const hitRate = (hits / NUM_REQUESTS);
    const costSavings = hits * COST_PER_REQUEST;
    const latencySavingsMs = hits * (LATENCY_UNCACHED_MS - LATENCY_CACHED_MS);

    // Latency improvement calculation: (Original Total - New Total) / Original Total
    // Original Total = N * Uncached
    // New Total = (Misses * Uncached) + (Hits * Cached)
    const originalTotalTime = NUM_REQUESTS * LATENCY_UNCACHED_MS;
    const newTotalTime = ((NUM_REQUESTS - hits) * LATENCY_UNCACHED_MS) + (hits * LATENCY_CACHED_MS);
    const latencyImprovement = ((originalTotalTime - newTotalTime) / originalTotalTime) * 100;

    if (costSavings > bestStrategy.savings) {
        bestStrategy = { size, savings: costSavings };
    }

    report += `| ${size} entries | ${(hitRate * 100).toFixed(1)}% | ${((1 - hitRate) * 100).toFixed(1)}% | $${costSavings.toFixed(2)} | ${latencyImprovement.toFixed(1)}% |\n`;
  });

  report += `\n## Recommendation\n\n`;
  report += `Based on the simulation of common syllabus queries:\n`;
  report += `1. **Implement an LRU Cache of size ${bestStrategy.size}**: This covers the most popular subjects ("Head of the Tail") effectively.\n`;
  report += `2. **Expected Impact**: Reducing API costs by ~${(bestStrategy.savings / (NUM_REQUESTS * COST_PER_REQUEST) * 100).toFixed(0)}% and improving average response latency significantly.\n`;
  report += `3. **Implementation Strategy**: Use Redis (e.g., Upstash) or Next.js \`unstable_cache\` with a TTL of 24 hours for syllabus data, as syllabi rarely change daily.\n`;

  const outputFile = path.join(process.cwd(), 'CACHING_STRATEGY_PROPOSAL.md');
  fs.writeFileSync(outputFile, report);
  console.log(`Caching strategy proposal generated at: ${outputFile}`);
}

runAnalysis();
