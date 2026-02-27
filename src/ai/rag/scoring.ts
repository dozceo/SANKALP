/**
 * @fileOverview Hybrid sparse + dense scoring for the production RAG pipeline.
 *
 * Sparse scoring  → BM25 (Okapi BM25 with configurable k1 / b).
 * Dense scoring   → TF-IDF vectors + cosine similarity.
 * Hybrid score    → weighted combination of normalised BM25 and dense scores.
 *
 * No external vector database is required; the in-memory implementation is
 * designed so it can be swapped for Pinecone / pgvector / Weaviate via the
 * VectorStore abstraction in vector-store.ts.
 */

import type { DocumentChunk, RAGConfig, ScoredChunk } from './types';
import { DEFAULT_RAG_CONFIG } from './types';

// ---------------------------------------------------------------------------
// Tokenisation
// ---------------------------------------------------------------------------

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'in', 'on', 'at', 'to', 'for', 'of', 'and',
  'or', 'but', 'it', 'its', 'this', 'that', 'with', 'as', 'by', 'from',
  'be', 'was', 'are', 'were', 'has', 'have', 'had', 'do', 'does', 'did',
  'not', 'no', 'so', 'if', 'my', 'me', 'he', 'she', 'we', 'they', 'you',
]);

/**
 * Tokenise a string into lower-case alpha-numeric terms, discarding
 * very common stop-words to improve signal-to-noise ratio.
 */
export function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

// ---------------------------------------------------------------------------
// BM25 (sparse) scoring
// ---------------------------------------------------------------------------

/**
 * Build corpus-level statistics needed for BM25:
 *   - document frequency (df) per term
 *   - average document length
 *   - total number of documents (N)
 */
export interface CorpusStats {
  /** Number of documents that contain each term. */
  df: Map<string, number>;
  /** Average document length (in tokens). */
  avgDl: number;
  /** Total number of documents. */
  N: number;
}

/** Compute corpus statistics from an array of pre-tokenised chunks. */
export function buildCorpusStats(chunks: DocumentChunk[]): CorpusStats {
  const df = new Map<string, number>();
  let totalTokens = 0;

  for (const chunk of chunks) {
    const uniqueTerms = new Set(chunk.tokens);
    for (const term of uniqueTerms) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
    totalTokens += chunk.tokens.length;
  }

  return {
    df,
    avgDl: chunks.length > 0 ? totalTokens / chunks.length : 0,
    N: chunks.length,
  };
}

/**
 * Compute the BM25 score for a single query–document pair.
 *
 * BM25(q, d) = Σ IDF(t) · [ tf(t,d) · (k1 + 1) ] / [ tf(t,d) + k1 · (1 − b + b · |d|/avgDl) ]
 */
export function bm25Score(
  queryTerms: string[],
  chunk: DocumentChunk,
  stats: CorpusStats,
  config: Pick<RAGConfig, 'bm25K1' | 'bm25B'> = DEFAULT_RAG_CONFIG,
): number {
  const { bm25K1: k1, bm25B: b } = config;
  const dl = chunk.tokens.length;
  if (dl === 0 || stats.avgDl === 0) return 0;

  // Build term-frequency map for this document
  const tf = new Map<string, number>();
  for (const t of chunk.tokens) {
    tf.set(t, (tf.get(t) ?? 0) + 1);
  }

  let score = 0;
  for (const term of queryTerms) {
    const termFreq = tf.get(term) ?? 0;
    if (termFreq === 0) continue;

    const docFreq = stats.df.get(term) ?? 0;
    // IDF with a floor of 0 to avoid negative weights for very common terms
    const idf = Math.max(
      0,
      Math.log((stats.N - docFreq + 0.5) / (docFreq + 0.5) + 1),
    );
    const tfNorm = (termFreq * (k1 + 1)) / (termFreq + k1 * (1 - b + b * (dl / stats.avgDl)));
    score += idf * tfNorm;
  }
  return score;
}

// ---------------------------------------------------------------------------
// TF-IDF dense vectors + cosine similarity
// ---------------------------------------------------------------------------

/**
 * Build a TF-IDF vector for the given tokens against the corpus vocabulary.
 *
 * Each dimension corresponds to a unique term in the corpus; the value is
 * tf(t,d) * idf(t).  Returned as a Map for sparse storage.
 */
export function buildTfIdfVector(
  tokens: string[],
  stats: CorpusStats,
): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) {
    tf.set(t, (tf.get(t) ?? 0) + 1);
  }

  const vec = new Map<string, number>();
  for (const [term, freq] of tf) {
    const docFreq = stats.df.get(term) ?? 0;
    const idf = Math.log((stats.N + 1) / (docFreq + 1)) + 1; // smoothed IDF
    vec.set(term, freq * idf);
  }
  return vec;
}

/** Cosine similarity between two sparse TF-IDF vectors. */
export function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>,
): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, valA] of a) {
    normA += valA * valA;
    const valB = b.get(term);
    if (valB !== undefined) dot += valA * valB;
  }
  for (const valB of b.values()) {
    normB += valB * valB;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom > 0 ? dot / denom : 0;
}

// ---------------------------------------------------------------------------
// Hybrid scoring (BM25 + dense)
// ---------------------------------------------------------------------------

/**
 * Score all chunks against a query using hybrid BM25 + TF-IDF cosine
 * similarity, then return the top-N candidates sorted by combined score.
 *
 * @param queryTerms - Pre-tokenised query terms.
 * @param chunks     - The full knowledge-base chunks.
 * @param stats      - Pre-computed corpus statistics.
 * @param config     - Pipeline configuration.
 * @returns Top candidates sorted by descending hybrid score.
 */
export function hybridScore(
  queryTerms: string[],
  chunks: DocumentChunk[],
  stats: CorpusStats,
  config: Partial<RAGConfig> = {},
): ScoredChunk[] {
  const mergedConfig = { ...DEFAULT_RAG_CONFIG, ...config };
  const { sparseWeight, candidateCount } = mergedConfig;
  const denseWeight = 1 - sparseWeight;

  if (queryTerms.length === 0 || chunks.length === 0) return [];

  const queryVec = buildTfIdfVector(queryTerms, stats);

  // Score every chunk
  const rawScored = chunks.map(chunk => {
    const sparse = bm25Score(queryTerms, chunk, stats, mergedConfig);
    const dense = cosineSimilarity(queryVec, buildTfIdfVector(chunk.tokens, stats));
    return { chunk, sparse, dense };
  });

  // Normalise each component to [0, 1] so the weighting is fair.
  // Use a loop instead of Math.max(...spread) to avoid stack overflow on large arrays.
  let maxSparse = 1e-9;
  let maxDense = 1e-9;
  for (const s of rawScored) {
    if (s.sparse > maxSparse) maxSparse = s.sparse;
    if (s.dense > maxDense) maxDense = s.dense;
  }

  const scored: ScoredChunk[] = rawScored
    .map(entry => {
      const normSparse = entry.sparse / maxSparse;
      const normDense = entry.dense / maxDense;
      return {
        chunk: entry.chunk,
        score: sparseWeight * normSparse + denseWeight * normDense,
        scoreBreakdown: { bm25: normSparse, dense: normDense },
      };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, candidateCount);

  return scored;
}
