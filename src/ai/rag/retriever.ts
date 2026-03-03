/**
 * @fileOverview Production-standard RAG (Retrieval-Augmented Generation)
 * retriever for SANKALP.
 *
 * Key production dimensions implemented:
 *
 * | Dimension        | Implementation                                           |
 * |------------------|----------------------------------------------------------|
 * | Retrieval Method | Hybrid sparse BM25 + dense TF-IDF cosine similarity      |
 * | Index            | Pluggable VectorStore (in-memory default; swap to         |
 * |                  | Pinecone / pgvector / Weaviate via the interface)         |
 * | Chunking         | Context-aware paragraph chunking (512–1024 tokens)        |
 * | Scoring          | Real Okapi BM25 with k1/b tuning + TF-IDF dense vectors  |
 * | Reranking        | Heuristic cross-encoder (term proximity, section match,   |
 * |                  | exact phrase); LLM reranker hook available                |
 * | Query            | Full user chat history merged into an enriched query      |
 * | Freshness        | Incremental reindexing via refreshKnowledgeBase()         |
 * | Method           | Async operations (retrieveContext returns a Promise)      |
 *
 * Aligned with the Core Intelligence Block Upgrade Strategy (Tier 1–3) in
 * docs/upcoming manual changess/Core_block_upgrade.md — the retriever feeds
 * enriched context to the upgraded ADK decision engine and dynamic LLM
 * orchestration layer.
 */

import * as fs from 'fs';
import * as path from 'path';

import type { ChatMessage, DocumentChunk, RAGConfig, RetrievalMetadata, RetrievalResult, ScoredChunk } from './types';
import { DEFAULT_RAG_CONFIG } from './types';
import { chunkDocument } from './chunking';
import { tokenise } from './scoring';
import { InMemoryVectorStore, type VectorStore } from './vector-store';

// ---------------------------------------------------------------------------
// Singleton vector store
// ---------------------------------------------------------------------------

let _store: VectorStore | null = null;

function getStore(): VectorStore {
  if (!_store) {
    _store = new InMemoryVectorStore();
    loadKnowledgeBase(_store);
  }
  return _store;
}

// ---------------------------------------------------------------------------
// Document loading (context-aware chunking)
// ---------------------------------------------------------------------------

/**
 * Load every student-profile markdown file from `data/students/` and index
 * them into the provided vector store using context-aware paragraph chunking.
 */
function loadKnowledgeBase(store: VectorStore): void {
  const studentsDir = path.join(process.cwd(), 'data', 'students');

  if (!fs.existsSync(studentsDir)) {
    console.warn('[RAG] data/students directory not found — retriever will return empty context');
    return;
  }

  const allChunks: DocumentChunk[] = [];

  for (const file of fs.readdirSync(studentsDir)) {
    if (!file.endsWith('.md')) continue;
    try {
      const raw = fs.readFileSync(path.join(studentsDir, file), 'utf-8');
      const source = file.replace(/\.md$/, '');
      allChunks.push(...chunkDocument(raw, source));
    } catch (err) {
      console.warn(`[RAG] Could not read ${path.join(studentsDir, file)}:`, err);
    }
  }

  store.upsert(allChunks);
  store.rebuild();
  console.log(`[RAG] Knowledge base loaded — ${store.size()} chunks from ${studentsDir}`);
}

// ---------------------------------------------------------------------------
// Query enrichment (chat history → enriched query)
// ---------------------------------------------------------------------------

const MAX_HISTORY_CHARS = 1500;

/**
 * Build an enriched query string from the current user message and recent
 * chat history.  This ensures the retriever sees conversational context
 * rather than a single isolated question.
 *
 * @param currentQuery - The latest user message.
 * @param history      - Previous messages in the conversation (optional).
 * @returns A single query string suitable for retrieval.
 */
export function buildEnrichedQuery(
  currentQuery: string,
  history?: ChatMessage[],
): string {
  if (!history || history.length === 0) return currentQuery;

  // Collect recent user messages (most recent first) up to a char budget
  const recentUserMessages: string[] = [];
  let charBudget = MAX_HISTORY_CHARS;

  for (let i = history.length - 1; i >= 0 && charBudget > 0; i--) {
    if (history[i].role === 'user') {
      const msg = history[i].content;
      if (msg.length <= charBudget) {
        recentUserMessages.unshift(msg);
        charBudget -= msg.length;
      }
    }
  }

  // Combine: current query is always primary; history provides context
  if (recentUserMessages.length === 0) return currentQuery;
  return `${recentUserMessages.join(' ')} ${currentQuery}`;
}

// ---------------------------------------------------------------------------
// Incremental reindexing (freshness)
// ---------------------------------------------------------------------------

/**
 * Refresh the knowledge base by reloading all source documents and rebuilding
 * the vector store index.  Call this after new student data is added or
 * existing profiles are updated.
 *
 * This supports event-driven / incremental reindexing — the caller can invoke
 * it from a Firestore onWrite trigger, a cron job, or an admin API endpoint.
 */
export function refreshKnowledgeBase(): void {
  _store = new InMemoryVectorStore();
  loadKnowledgeBase(_store);
  console.log('[RAG] Knowledge base refreshed');
}

/**
 * Incrementally index a single document (e.g. when a student profile is
 * created or updated) without reloading the entire corpus.
 *
 * @param source - Human-readable source identifier.
 * @param text   - Full text of the document.
 */
export function upsertDocument(source: string, text: string): void {
  const store = getStore();
  const chunks = chunkDocument(text, source);
  store.upsert(chunks);
  store.rebuild();
}

/**
 * Remove all chunks belonging to a source document.
 *
 * @param source - The source identifier whose chunks should be removed.
 */
export function removeDocument(source: string): void {
  const store = getStore();
  const ids = store.getIdsBySource(source);
  if (ids.length > 0) {
    store.remove(ids);
    store.rebuild();
  }
}

// ---------------------------------------------------------------------------
// Public retrieval API (async, production-standard)
// ---------------------------------------------------------------------------

/**
 * Retrieve the most relevant context chunks for a query, using the full
 * hybrid retrieval pipeline:
 *
 *   1. Enrich the query with chat history context.
 *   2. Hybrid BM25 + TF-IDF dense retrieval from the vector store.
 *   3. Cross-encoder heuristic reranking.
 *   4. Return top-K chunks as a formatted string.
 *
 * This is the **primary async API** for production use.
 *
 * @param query   - The user's current question or concept.
 * @param options - Optional configuration overrides and chat history.
 * @returns A string with retrieved context, or empty string if none found.
 */
export async function retrieveContext(
  query: string,
  options?: {
    history?: ChatMessage[];
    config?: Partial<RAGConfig>;
    k?: number;
  },
): Promise<string> {
  const result = await retrieveContextWithMetadata(query, options);
  return result.context;
}

// ---------------------------------------------------------------------------
// Metadata-returning retrieval API (for ML / ADK / LLM orchestration)
// ---------------------------------------------------------------------------

/**
 * Compute retrieval confidence from the score distribution of returned chunks.
 *
 * A high confidence (close to 1.0) means the top results have high absolute
 * scores and a tight distribution — the pipeline found clearly relevant
 * content.  A low confidence means scores are low or spread out.
 *
 * Downstream use:
 *   - **ADK (Tier 1C)**: if confidence < 0.3 the decision engine can fall
 *     back to general-knowledge mode instead of relying on RAG context.
 *   - **Dynamic LLM (Tier 3)**: confidence informs prompt routing — high
 *     confidence → use the retrieved context verbatim; low → ask the LLM
 *     to generate from its own knowledge.
 */
function computeRetrievalConfidence(results: ScoredChunk[]): number {
  if (results.length === 0) return 0;
  const scores = results.map(r => r.score);
  const maxScore = Math.max(...scores);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  // Blend: mostly driven by the best-match score, tempered by average quality
  return Math.min(1, 0.6 * maxScore + 0.4 * avgScore);
}

/**
 * Retrieve the most relevant context chunks **with structured metadata**
 * suitable for downstream ML feature engineering, ADK decision-making,
 * and dynamic LLM orchestration.
 *
 * This is the primary API for the Core Intelligence Block Upgrade:
 *
 * | Upgrade Tier                       | Metadata used                                |
 * |------------------------------------|----------------------------------------------|
 * | **1B** Advanced Feature Engineering | `queryTermCount`, `avgRelevanceScore`,       |
 * |                                    | `topChunkSources` → feed 40-feature pipeline |
 * | **1C** ADK Multi-Signal Context     | `retrievalConfidence` → weight RAG vs.       |
 * |                                    | general knowledge in decision rules          |
 * | **3** Dynamic LLM Orchestration     | `retrievalConfidence`, `topChunkSources` →   |
 * |                                    | inform prompt routing & token budgeting      |
 *
 * @param query   - The user's current question or concept.
 * @param options - Optional configuration overrides and chat history.
 * @returns A {@link RetrievalResult} with formatted context and metadata.
 */
export async function retrieveContextWithMetadata(
  query: string,
  options?: {
    history?: ChatMessage[];
    config?: Partial<RAGConfig>;
    k?: number;
  },
): Promise<RetrievalResult> {
  const config = options?.config ?? {};
  const topK = options?.k ?? config.topK ?? DEFAULT_RAG_CONFIG.topK;

  const enrichedQuery = buildEnrichedQuery(query, options?.history);
  const store = getStore();
  const queryTerms = tokenise(enrichedQuery);

  const results: ScoredChunk[] = store.query(enrichedQuery, { ...config, topK });

  const context = results.length === 0
    ? ''
    : results
        .map(entry => `[Source: ${entry.chunk.source}]\n${entry.chunk.text}`)
        .join('\n\n---\n\n');

  const scores = results.map(r => r.score);
  const avgRelevanceScore = scores.length > 0
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 0;
  const maxRelevanceScore = scores.length > 0
    ? Math.max(...scores)
    : 0;

  const metadata: RetrievalMetadata = {
    queryTermCount: queryTerms.length,
    chunksReturned: results.length,
    totalIndexedChunks: store.size(),
    avgRelevanceScore,
    maxRelevanceScore,
    topChunkSources: results.map(r => r.chunk.source),
    retrievalConfidence: computeRetrievalConfidence(results),
  };

  return { context, metadata };
}

// ---------------------------------------------------------------------------
// Backward-compatible synchronous API
// ---------------------------------------------------------------------------

/**
 * Retrieve the most relevant context chunks for `query` from the knowledge
 * base and return them concatenated as a single string.
 *
 * **Legacy synchronous wrapper** — new code should prefer {@link retrieveContext}.
 *
 * @param query - The user's question or the concept being explained.
 * @param k     - Maximum number of chunks to return (default: 3).
 * @returns A string containing retrieved context, or an empty string.
 */
export function retrieveRelevantContext(query: string, k = 3): string {
  const store = getStore();
  const queryTerms = tokenise(query);
  if (queryTerms.length === 0) return '';

  const results: ScoredChunk[] = store.query(query, { topK: k });

  if (results.length === 0) return '';

  return results
    .map(entry => `[Source: ${entry.chunk.source}]\n${entry.chunk.text}`)
    .join('\n\n---\n\n');
}
