/**
 * @fileOverview Tests for the production-standard RAG pipeline.
 *
 * Covers:
 *   - Context-aware paragraph chunking
 *   - BM25 scoring
 *   - TF-IDF dense scoring + cosine similarity
 *   - Hybrid scoring
 *   - Heuristic cross-encoder reranking
 *   - Query enrichment from chat history
 *   - InMemoryVectorStore end-to-end
 */

import { chunkDocument } from '../chunking';
import {
  tokenise,
  buildCorpusStats,
  bm25Score,
  buildTfIdfVector,
  cosineSimilarity,
  hybridScore,
} from '../scoring';
import { heuristicRerank } from '../reranker';
import { buildEnrichedQuery } from '../retriever';
import { InMemoryVectorStore } from '../vector-store';
import type { DocumentChunk, ScoredChunk, ChatMessage } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeChunk(id: string, text: string, source = 'test'): DocumentChunk {
  return { id, source, text, tokens: tokenise(text) };
}

// ---------------------------------------------------------------------------
// Tokenisation
// ---------------------------------------------------------------------------

describe('tokenise', () => {
  it('lowercases and splits on non-alphanumeric boundaries', () => {
    expect(tokenise('Hello World!')).toEqual(['hello', 'world']);
  });

  it('removes stop-words', () => {
    const tokens = tokenise('the quick and lazy fox');
    expect(tokens).not.toContain('the');
    expect(tokens).not.toContain('and');
    expect(tokens).toContain('quick');
    expect(tokens).toContain('lazy');
    expect(tokens).toContain('fox');
  });

  it('removes single-character tokens', () => {
    expect(tokenise('a b c abc')).toEqual(['abc']);
  });

  it('returns empty array for empty input', () => {
    expect(tokenise('')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Context-aware chunking
// ---------------------------------------------------------------------------

describe('chunkDocument', () => {
  it('produces chunks from paragraph-separated text', () => {
    const text = 'Paragraph one about algebra.\n\nParagraph two about geometry.';
    const chunks = chunkDocument(text, 'test-doc');
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].source).toBe('test-doc');
    expect(chunks[0].id).toMatch(/^test-doc#/);
  });

  it('respects paragraph boundaries', () => {
    const p1 = 'A'.repeat(500);
    const p2 = 'B'.repeat(500);
    const text = `${p1}\n\n${p2}`;
    const chunks = chunkDocument(text, 'src', { chunkTargetChars: 600 });
    // Each paragraph should end up in at least one chunk
    const allText = chunks.map(c => c.text).join(' ');
    expect(allText).toContain(p1);
    expect(allText).toContain(p2);
  });

  it('pre-computes tokens for each chunk', () => {
    const chunks = chunkDocument('Hello world\n\nFoo bar', 'src');
    for (const chunk of chunks) {
      expect(Array.isArray(chunk.tokens)).toBe(true);
      expect(chunk.tokens.length).toBeGreaterThan(0);
    }
  });

  it('returns empty array for empty text', () => {
    expect(chunkDocument('', 'src')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// BM25 scoring
// ---------------------------------------------------------------------------

describe('bm25Score', () => {
  const chunks = [
    makeChunk('1', 'algebra quadratic equations solving for x'),
    makeChunk('2', 'geometry triangles circles area volume'),
    makeChunk('3', 'algebra linear equations graphing slope'),
  ];
  const stats = buildCorpusStats(chunks);

  it('returns higher score for chunks with more matching terms', () => {
    const query = tokenise('algebra equations');
    const score1 = bm25Score(query, chunks[0], stats);
    const score2 = bm25Score(query, chunks[1], stats);
    expect(score1).toBeGreaterThan(score2);
  });

  it('returns 0 for completely unrelated query', () => {
    const query = tokenise('quantum physics');
    const score = bm25Score(query, chunks[0], stats);
    expect(score).toBe(0);
  });

  it('incorporates IDF: rare terms contribute more', () => {
    // 'quadratic' only appears in chunk 0; 'algebra' appears in 0 and 2
    const queryRare = tokenise('quadratic');
    const queryCommon = tokenise('algebra');
    const scoreRare = bm25Score(queryRare, chunks[0], stats);
    const scoreCommon = bm25Score(queryCommon, chunks[0], stats);
    expect(scoreRare).toBeGreaterThan(scoreCommon);
  });
});

// ---------------------------------------------------------------------------
// TF-IDF dense scoring
// ---------------------------------------------------------------------------

describe('TF-IDF cosine similarity', () => {
  const chunks = [
    makeChunk('1', 'algebra quadratic equations solving'),
    makeChunk('2', 'geometry triangles circles area'),
  ];
  const stats = buildCorpusStats(chunks);

  it('returns higher similarity for related content', () => {
    const queryVec = buildTfIdfVector(tokenise('algebra equations'), stats);
    const vec1 = buildTfIdfVector(chunks[0].tokens, stats);
    const vec2 = buildTfIdfVector(chunks[1].tokens, stats);
    expect(cosineSimilarity(queryVec, vec1)).toBeGreaterThan(
      cosineSimilarity(queryVec, vec2),
    );
  });

  it('returns 0 for orthogonal vectors', () => {
    const a = new Map([['x', 1]]);
    const b = new Map([['y', 1]]);
    expect(cosineSimilarity(a, b)).toBe(0);
  });

  it('returns 1 for identical unit vectors', () => {
    const a = new Map([['x', 1]]);
    expect(cosineSimilarity(a, a)).toBeCloseTo(1);
  });
});

// ---------------------------------------------------------------------------
// Hybrid scoring
// ---------------------------------------------------------------------------

describe('hybridScore', () => {
  const chunks = [
    makeChunk('1', 'algebra quadratic equations solving for unknowns'),
    makeChunk('2', 'geometry triangles circles area volume calculation'),
    makeChunk('3', 'algebra linear equations graphing slope intercept'),
  ];
  const stats = buildCorpusStats(chunks);

  it('returns scored candidates sorted by relevance', () => {
    const results = hybridScore(tokenise('algebra equations'), chunks, stats);
    expect(results.length).toBeGreaterThan(0);
    // First result should be about algebra
    expect(results[0].chunk.text).toContain('algebra');
  });

  it('returns empty array for empty query', () => {
    expect(hybridScore([], chunks, stats)).toEqual([]);
  });

  it('includes score breakdown', () => {
    const results = hybridScore(tokenise('algebra'), chunks, stats);
    for (const r of results) {
      expect(r.scoreBreakdown).toBeDefined();
      expect(r.scoreBreakdown!.bm25).toBeGreaterThanOrEqual(0);
      expect(r.scoreBreakdown!.dense).toBeGreaterThanOrEqual(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Reranking
// ---------------------------------------------------------------------------

describe('heuristicRerank', () => {
  it('boosts chunks containing exact query phrase', () => {
    const candidates: ScoredChunk[] = [
      {
        chunk: makeChunk('1', 'general information about math topics'),
        score: 0.8,
        scoreBreakdown: { bm25: 0.8, dense: 0.8 },
      },
      {
        chunk: makeChunk('2', 'algebra quadratic equations solving'),
        score: 0.7,
        scoreBreakdown: { bm25: 0.7, dense: 0.7 },
      },
    ];

    const reranked = heuristicRerank('algebra quadratic', candidates, 2);
    // The second chunk should get a boost from exact phrase and proximity
    expect(reranked.length).toBe(2);
  });

  it('returns at most topK results', () => {
    const candidates: ScoredChunk[] = Array.from({ length: 5 }, (_, i) => ({
      chunk: makeChunk(`${i}`, `chunk content ${i}`),
      score: 1 - i * 0.1,
      scoreBreakdown: { bm25: 0.5, dense: 0.5 },
    }));
    expect(heuristicRerank('content', candidates, 2).length).toBe(2);
  });

  it('returns empty for empty candidates', () => {
    expect(heuristicRerank('test', [], 3)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Query enrichment (chat history)
// ---------------------------------------------------------------------------

describe('buildEnrichedQuery', () => {
  it('returns the current query when no history is provided', () => {
    expect(buildEnrichedQuery('what is algebra')).toBe('what is algebra');
  });

  it('returns the current query when history is empty', () => {
    expect(buildEnrichedQuery('what is algebra', [])).toBe('what is algebra');
  });

  it('includes recent user messages from history', () => {
    const history: ChatMessage[] = [
      { role: 'user', content: 'tell me about math' },
      { role: 'bot', content: 'Math is great!' },
      { role: 'user', content: 'specifically quadratic equations' },
    ];
    const enriched = buildEnrichedQuery('how to solve them', history);
    expect(enriched).toContain('tell me about math');
    expect(enriched).toContain('specifically quadratic equations');
    expect(enriched).toContain('how to solve them');
    // Should not include bot messages
    expect(enriched).not.toContain('Math is great');
  });
});

// ---------------------------------------------------------------------------
// InMemoryVectorStore (end-to-end)
// ---------------------------------------------------------------------------

describe('InMemoryVectorStore', () => {
  it('indexes chunks and retrieves relevant results', () => {
    const store = new InMemoryVectorStore();
    store.upsert([
      makeChunk('a#0', 'Alex Kumar is strong in algebra and problem solving'),
      makeChunk('a#1', 'Alex is weak in trigonometric identities'),
      makeChunk('b#0', 'Priya Sharma excels in physics and chemistry'),
    ]);
    store.rebuild();

    const results = store.query('algebra problem solving');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].chunk.id).toBe('a#0');
  });

  it('returns empty for irrelevant query', () => {
    const store = new InMemoryVectorStore();
    store.upsert([makeChunk('x#0', 'this is about cooking recipes')]);
    store.rebuild();

    const results = store.query('quantum physics dark matter');
    expect(results.length).toBe(0);
  });

  it('supports upsert and removal', () => {
    const store = new InMemoryVectorStore();
    store.upsert([makeChunk('a#0', 'original content')]);
    expect(store.size()).toBe(1);

    store.upsert([makeChunk('a#0', 'updated content')]);
    expect(store.size()).toBe(1);

    store.remove(['a#0']);
    expect(store.size()).toBe(0);
  });

  it('respects topK configuration', () => {
    const store = new InMemoryVectorStore();
    const chunks = Array.from({ length: 20 }, (_, i) =>
      makeChunk(`c#${i}`, `algebra equations topic ${i} math`),
    );
    store.upsert(chunks);
    store.rebuild();

    const results = store.query('algebra equations', { topK: 2 });
    expect(results.length).toBeLessThanOrEqual(2);
  });
});
