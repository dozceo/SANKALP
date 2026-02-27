/**
 * @fileOverview Cross-encoder reranker for the production RAG pipeline.
 *
 * After the initial hybrid retrieval returns a set of candidates, the reranker
 * refines the ordering by scoring each (query, chunk) pair more carefully.
 *
 * Two strategies are provided:
 *   1. **heuristicRerank** — a fast, zero-API-call reranker that uses term
 *      proximity, section-title match, and exact-phrase overlap.  Suitable for
 *      latency-sensitive paths and environments without LLM API access.
 *   2. A future **llmRerank** hook (commented placeholder) that can call a
 *      Genkit flow or external cross-encoder model for even higher quality.
 *
 * The reranker is designed to slot into the retriever pipeline between the
 * hybrid scorer and the final top-K selection.
 */

import type { ScoredChunk } from './types';
import { tokenise } from './scoring';

// ---------------------------------------------------------------------------
// Heuristic cross-encoder (no external API needed)
// ---------------------------------------------------------------------------

/**
 * Compute a proximity bonus: how close the query terms appear to each other
 * within the chunk text.  Smaller windows → higher bonus.
 */
function termProximityScore(queryTerms: string[], chunkText: string): number {
  if (queryTerms.length < 2) return 0;

  const lower = chunkText.toLowerCase();
  const positions: number[] = [];

  for (const term of queryTerms) {
    const idx = lower.indexOf(term);
    if (idx >= 0) positions.push(idx);
  }

  if (positions.length < 2) return 0;

  positions.sort((a, b) => a - b);
  const span = positions[positions.length - 1] - positions[0];
  // Normalise: perfect proximity (span=0) → 1; span ≥ 500 chars → 0
  return Math.max(0, 1 - span / 500);
}

/**
 * Bonus for chunks whose section heading matches query terms.
 */
function sectionMatchScore(queryTerms: string[], section?: string): number {
  if (!section) return 0;
  const sectionTokens = new Set(tokenise(section));
  let matches = 0;
  for (const term of queryTerms) {
    if (sectionTokens.has(term)) matches++;
  }
  return queryTerms.length > 0 ? matches / queryTerms.length : 0;
}

/**
 * Bonus for chunks that contain the original query as an exact (or near-exact)
 * substring, which often signals a direct answer.
 */
function exactPhraseScore(query: string, chunkText: string): number {
  const q = query.toLowerCase().trim();
  if (q.length < 4) return 0;
  return chunkText.toLowerCase().includes(q) ? 1 : 0;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Re-rank a set of candidate chunks using lightweight heuristic signals.
 *
 * The final score is the original hybrid score boosted by:
 *   • term proximity   (weight 0.15)
 *   • section match    (weight 0.10)
 *   • exact phrase     (weight 0.10)
 *
 * @param query      - The raw user query string.
 * @param candidates - Scored chunks from the hybrid retrieval stage.
 * @param topK       - Number of results to return after reranking.
 * @returns Re-ranked and trimmed array of {@link ScoredChunk}.
 */
export function heuristicRerank(
  query: string,
  candidates: ScoredChunk[],
  topK: number,
): ScoredChunk[] {
  if (candidates.length === 0) return [];

  const queryTerms = tokenise(query);

  const reranked = candidates.map(entry => {
    const proximity = termProximityScore(queryTerms, entry.chunk.text);
    const sectionBonus = sectionMatchScore(queryTerms, entry.chunk.section);
    const phraseBonus = exactPhraseScore(query, entry.chunk.text);

    const rerankBoost = 0.15 * proximity + 0.10 * sectionBonus + 0.10 * phraseBonus;

    return {
      ...entry,
      score: entry.score + rerankBoost,
      scoreBreakdown: {
        bm25: entry.scoreBreakdown?.bm25 ?? 0,
        dense: entry.scoreBreakdown?.dense ?? 0,
        rerank: rerankBoost,
      },
    };
  });

  return reranked
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
