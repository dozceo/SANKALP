/**
 * @fileOverview Shared types for the production-standard RAG pipeline.
 *
 * These types are used across the chunking, scoring, reranking, vector-store,
 * and retriever modules to maintain a consistent interface.
 */

// ---------------------------------------------------------------------------
// Document & Chunk types
// ---------------------------------------------------------------------------

/** A single chunk of text extracted from a source document. */
export interface DocumentChunk {
  /** Unique identifier for this chunk (source + index). */
  id: string;
  /** Human-readable source identifier (e.g. "alex-kumar"). */
  source: string;
  /** The raw text of this chunk. */
  text: string;
  /** Pre-computed lowercase tokens for this chunk (populated at index time). */
  tokens: string[];
  /** Section heading this chunk belongs to (if any). */
  section?: string;
}

/** A chunk paired with a relevance score from a retrieval stage. */
export interface ScoredChunk {
  chunk: DocumentChunk;
  /** Combined relevance score (higher = more relevant). */
  score: number;
  /** Individual score components for debugging / observability. */
  scoreBreakdown?: {
    bm25: number;
    dense: number;
    rerank?: number;
  };
}

// ---------------------------------------------------------------------------
// Chat history support
// ---------------------------------------------------------------------------

/** A single message in the user's conversation history. */
export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

// ---------------------------------------------------------------------------
// Pipeline configuration
// ---------------------------------------------------------------------------

/** Tunable parameters for the hybrid retrieval pipeline. */
export interface RAGConfig {
  /** Weight for BM25 (sparse) score in [0, 1]. Dense weight = 1 − sparseWeight. */
  sparseWeight: number;
  /** BM25 tuning: term-frequency saturation parameter (default 1.2). */
  bm25K1: number;
  /** BM25 tuning: document-length normalisation (default 0.75). */
  bm25B: number;
  /** Number of candidates to fetch before reranking (default 10). */
  candidateCount: number;
  /** Final number of chunks to return after reranking (default 3). */
  topK: number;
  /** Target chunk size in characters for context-aware chunking. */
  chunkTargetChars: number;
  /** Overlap in characters between adjacent chunks. */
  chunkOverlapChars: number;
}

/** Sensible defaults aligned with production best practices. */
export const DEFAULT_RAG_CONFIG: RAGConfig = {
  sparseWeight: 0.5,
  bm25K1: 1.2,
  bm25B: 0.75,
  candidateCount: 10,
  topK: 3,
  chunkTargetChars: 2400,   // ~600 tokens ≈ between 512-1024 token range
  chunkOverlapChars: 400,   // ~100 tokens overlap
};

// ---------------------------------------------------------------------------
// Retrieval metadata (for ML / ADK consumption)
// ---------------------------------------------------------------------------

/**
 * Metadata returned alongside retrieved context to support the
 * Core Intelligence Block Upgrade (Tiers 1–3).
 *
 * Downstream consumers:
 *   - **Tier 1B** (Advanced Feature Engineering): `queryTermCount`,
 *     `avgRelevanceScore`, `topChunkSources` feed the 40-feature pipeline
 *     (e.g. `chat_history_length`, `help_seeking_frequency`).
 *   - **Tier 1C** (ADK Decision Engine): `retrievalConfidence` enables the
 *     multi-signal context to weight RAG context vs. general knowledge.
 *   - **Tier 3** (Dynamic LLM Orchestration): `retrievalConfidence` and
 *     `topChunkSources` inform prompt routing decisions.
 */
export interface RetrievalMetadata {
  /** Number of tokenised query terms used for retrieval. */
  queryTermCount: number;
  /** Number of chunks returned after reranking. */
  chunksReturned: number;
  /** Total number of indexed chunks in the knowledge base. */
  totalIndexedChunks: number;
  /** Average relevance score of the returned chunks (0–1 normalised). */
  avgRelevanceScore: number;
  /** Maximum relevance score among returned chunks. */
  maxRelevanceScore: number;
  /** Source identifiers of the top-ranked chunks. */
  topChunkSources: string[];
  /**
   * Confidence that the retrieved context is relevant (0–1).
   * Computed from score distribution; useful for ADK to decide whether
   * to rely on RAG context or fall back to general knowledge.
   */
  retrievalConfidence: number;
}

/**
 * Full result from the metadata-returning retrieval API.
 * Provides both the formatted context string and structured metadata
 * for the ML / ADK / LLM orchestration layers.
 */
export interface RetrievalResult {
  /** Formatted context string ready for LLM prompt injection. */
  context: string;
  /** Structured metadata for downstream ML / ADK consumption. */
  metadata: RetrievalMetadata;
}
