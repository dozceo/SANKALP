/**
 * @fileOverview RAG (Retrieval-Augmented Generation) retriever for SANKALP.
 *
 * This module implements the Retrieval step of RAG:
 *   1. At startup it loads all student-profile markdown files from data/students/
 *      and splits them into small text chunks that become the "knowledge base".
 *   2. When the chatbot receives a user query it calls `retrieveRelevantContext()`
 *      which scores every chunk by keyword overlap with the query (BM25-inspired)
 *      and returns the top-k most relevant chunks concatenated as a single string.
 *   3. That string is passed as `brainMapContext` to the LLM prompt, so the model
 *      always answers with knowledge that is grounded in real student data rather
 *      than generic world knowledge alone.
 *
 * No external vector database is required; retrieval runs entirely in-process.
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DocumentChunk {
  /** Human-readable source identifier (e.g. "alex-kumar"). */
  source: string;
  /** The raw text of this chunk. */
  text: string;
}

// ---------------------------------------------------------------------------
// Document loading & chunking
// ---------------------------------------------------------------------------

// 300 characters keeps each chunk within a reasonable LLM context budget while
// still containing enough sentences to be semantically coherent.
// 60-character overlap (~20 % of CHUNK_SIZE) ensures boundary sentences are
// fully represented in at least one chunk.
const CHUNK_SIZE = 300;
const CHUNK_OVERLAP = 60;

/**
 * Split a long text into overlapping chunks so that every topic or sentence
 * has a fair chance of being returned even when it straddles a boundary.
 */
function splitIntoChunks(text: string, source: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push({ source, text: text.slice(start, end).trim() });
    if (end === text.length) break;
    start = end - CHUNK_OVERLAP;
  }
  return chunks;
}

/**
 * Load every student-profile markdown file from the `data/students/` directory
 * and return them as a flat array of document chunks.
 *
 * The function is intentionally synchronous because it is called once at module
 * initialisation; in a server environment that cost is paid only on cold start.
 */
function loadKnowledgeBase(): DocumentChunk[] {
  const studentsDir = path.join(process.cwd(), 'data', 'students');

  if (!fs.existsSync(studentsDir)) {
    console.warn('[RAG] data/students directory not found — retriever will return empty context');
    return [];
  }

  const chunks: DocumentChunk[] = [];

  for (const file of fs.readdirSync(studentsDir)) {
    if (!file.endsWith('.md')) continue;
    try {
      const raw = fs.readFileSync(path.join(studentsDir, file), 'utf-8');
      const source = file.replace(/\.md$/, '');
      chunks.push(...splitIntoChunks(raw, source));
    } catch (err) {
      console.warn(`[RAG] Could not read ${path.join(studentsDir, file)}:`, err);
    }
  }

  console.log(`[RAG] Knowledge base loaded — ${chunks.length} chunks from ${studentsDir}`);
  return chunks;
}

// Singleton: build the index once per process lifetime.
let _knowledgeBase: DocumentChunk[] | null = null;

function getKnowledgeBase(): DocumentChunk[] {
  if (!_knowledgeBase) {
    _knowledgeBase = loadKnowledgeBase();
  }
  return _knowledgeBase;
}

// ---------------------------------------------------------------------------
// Keyword-based relevance scoring (BM25-inspired)
// ---------------------------------------------------------------------------

/**
 * Tokenise a string into lower-case alpha-numeric terms, discarding
 * very common stop-words to improve signal-to-noise ratio.
 *
 * Note: stop-words are English-only; non-English queries still work but
 * may carry extra noise from common function words in that language.
 */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'in', 'on', 'at', 'to', 'for', 'of', 'and',
  'or', 'but', 'it', 'its', 'this', 'that', 'with', 'as', 'by', 'from',
  'be', 'was', 'are', 'were', 'has', 'have', 'had', 'do', 'does', 'did',
]);

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

/**
 * Compute a simple overlap score between a query and a document chunk.
 * Returns the number of unique query terms that appear in the chunk,
 * normalised by the size of the query term set.
 */
function relevanceScore(queryTerms: string[], chunk: DocumentChunk): number {
  const chunkTokens = new Set(tokenise(chunk.text));
  let matches = 0;
  for (const term of queryTerms) {
    if (chunkTokens.has(term)) matches++;
  }
  return queryTerms.length > 0 ? matches / queryTerms.length : 0;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve the most relevant context chunks for `query` from the knowledge base
 * and return them concatenated as a single string ready to be injected into an
 * LLM prompt.
 *
 * @param query - The user's question or the concept being explained.
 * @param k     - Maximum number of chunks to return (default: 3).
 * @returns     A string containing retrieved context, or an empty string if no
 *              relevant chunks were found.
 */
export function retrieveRelevantContext(query: string, k = 3): string {
  const kb = getKnowledgeBase();
  if (kb.length === 0) return '';

  const queryTerms = tokenise(query);
  if (queryTerms.length === 0) return '';

  // Score every chunk and pick the top-k.
  const scored = kb
    .map(chunk => ({ chunk, score: relevanceScore(queryTerms, chunk) }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  if (scored.length === 0) return '';

  return scored
    .map(entry => `[Source: ${entry.chunk.source}]\n${entry.chunk.text}`)
    .join('\n\n---\n\n');
}
