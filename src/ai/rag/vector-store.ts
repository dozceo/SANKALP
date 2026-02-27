/**
 * @fileOverview Vector store abstraction for the production RAG pipeline.
 *
 * Provides a thin interface (`VectorStore`) that can be backed by:
 *   • An **in-memory** implementation (default, zero-config).
 *   • A managed service such as **Pinecone**, **pgvector**, or **Weaviate**
 *     (swap in by implementing the interface and providing a factory).
 *
 * The in-memory store keeps all chunk data, corpus stats, and TF-IDF vectors
 * in process memory and supports incremental / event-driven reindexing via
 * `upsert()` and `remove()` without a full reload.
 */

import type { DocumentChunk, ScoredChunk, RAGConfig } from './types';
import { DEFAULT_RAG_CONFIG } from './types';
import {
  buildCorpusStats,
  hybridScore,
  tokenise,
  type CorpusStats,
} from './scoring';
import { heuristicRerank } from './reranker';

// ---------------------------------------------------------------------------
// Abstract interface (future: Pinecone / pgvector / Weaviate adapter)
// ---------------------------------------------------------------------------

/** Minimal interface for a pluggable vector store backend. */
export interface VectorStore {
  /** Add or replace chunks in the index. */
  upsert(chunks: DocumentChunk[]): void;
  /** Remove chunks by their ids. */
  remove(ids: string[]): void;
  /** Return all chunk ids that start with the given source prefix. */
  getIdsBySource(source: string): string[];
  /** Query the store and return re-ranked results. */
  query(queryText: string, config?: Partial<RAGConfig>): ScoredChunk[];
  /** Return the current number of indexed chunks. */
  size(): number;
  /** Rebuild internal statistics (call after bulk upsert). */
  rebuild(): void;
}

// ---------------------------------------------------------------------------
// In-memory implementation
// ---------------------------------------------------------------------------

/**
 * A fully in-process vector store that keeps chunks in a Map and maintains
 * BM25 corpus statistics for fast hybrid retrieval + reranking.
 *
 * Suitable for moderate-sized knowledge bases (thousands of chunks).  For
 * larger corpora, replace with a managed vector DB that implements the same
 * {@link VectorStore} interface.
 */
export class InMemoryVectorStore implements VectorStore {
  private chunks = new Map<string, DocumentChunk>();
  private stats: CorpusStats = { df: new Map(), avgDl: 0, N: 0 };
  private dirty = true;

  // -- Mutations ------------------------------------------------------------

  upsert(chunks: DocumentChunk[]): void {
    for (const c of chunks) {
      this.chunks.set(c.id, c);
    }
    this.dirty = true;
  }

  remove(ids: string[]): void {
    for (const id of ids) {
      this.chunks.delete(id);
    }
    this.dirty = true;
  }

  getIdsBySource(source: string): string[] {
    const prefix = `${source}#`;
    const ids: string[] = [];
    for (const id of this.chunks.keys()) {
      if (id.startsWith(prefix)) ids.push(id);
    }
    return ids;
  }

  // -- Query ----------------------------------------------------------------

  query(queryText: string, config?: Partial<RAGConfig>): ScoredChunk[] {
    const mergedConfig = { ...DEFAULT_RAG_CONFIG, ...config };
    this.ensureFresh();

    const queryTerms = tokenise(queryText);
    if (queryTerms.length === 0) return [];

    const allChunks = Array.from(this.chunks.values());

    // Stage 1: hybrid sparse + dense retrieval
    const candidates = hybridScore(queryTerms, allChunks, this.stats, mergedConfig);

    // Stage 2: cross-encoder reranking
    return heuristicRerank(queryText, candidates, mergedConfig.topK);
  }

  // -- Housekeeping ---------------------------------------------------------

  size(): number {
    return this.chunks.size;
  }

  rebuild(): void {
    this.stats = buildCorpusStats(Array.from(this.chunks.values()));
    this.dirty = false;
  }

  /** Lazily rebuild stats when needed. */
  private ensureFresh(): void {
    if (this.dirty) this.rebuild();
  }
}
