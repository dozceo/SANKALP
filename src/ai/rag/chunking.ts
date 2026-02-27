/**
 * @fileOverview Context-aware chunking for the production RAG pipeline.
 *
 * Instead of fixed-length character slicing, this module splits documents on
 * natural paragraph / section boundaries so that each chunk is semantically
 * coherent.  Target size is 512–1024 tokens (~2000–4000 characters) with
 * configurable overlap to avoid losing context at boundaries.
 */

import type { DocumentChunk } from './types';
import { DEFAULT_RAG_CONFIG } from './types';
import { tokenise } from './scoring';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Split text on double-newlines (markdown paragraph separator). */
function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/**
 * Detect the markdown section heading (## Heading) that a paragraph belongs to.
 * Returns the heading text or undefined if none is found above the paragraph.
 */
function detectSection(fullText: string, paragraphStart: number): string | undefined {
  const before = fullText.slice(0, paragraphStart);
  const headingMatch = before.match(/^#{1,3}\s+(.+)$/gm);
  if (headingMatch && headingMatch.length > 0) {
    return headingMatch[headingMatch.length - 1].replace(/^#+\s*/, '').trim();
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Split a document into context-aware chunks that respect paragraph and
 * section boundaries.
 *
 * Algorithm:
 *   1. Split the document by double-newlines (paragraphs).
 *   2. Accumulate consecutive paragraphs into a chunk until the target size
 *      is reached.
 *   3. When a chunk is full, emit it and start a new chunk that overlaps by
 *      including the last paragraph(s) from the previous chunk.
 *
 * @param text   - The full text of the source document.
 * @param source - Human-readable source identifier (e.g. file name stem).
 * @param config - Optional overrides for chunk sizing.
 * @returns An array of {@link DocumentChunk} objects.
 */
export function chunkDocument(
  text: string,
  source: string,
  config: { chunkTargetChars?: number; chunkOverlapChars?: number } = {},
): DocumentChunk[] {
  const targetChars = config.chunkTargetChars ?? DEFAULT_RAG_CONFIG.chunkTargetChars;
  const overlapChars = config.chunkOverlapChars ?? DEFAULT_RAG_CONFIG.chunkOverlapChars;

  const paragraphs = splitParagraphs(text);
  if (paragraphs.length === 0) return [];

  const chunks: DocumentChunk[] = [];
  let buffer: string[] = [];
  let bufferLen = 0;
  let chunkIndex = 0;

  // Track position in original text for section detection
  let scanPos = 0;
  const paraPositions: number[] = [];
  for (const p of paragraphs) {
    const idx = text.indexOf(p, scanPos);
    paraPositions.push(idx >= 0 ? idx : scanPos);
    scanPos = (idx >= 0 ? idx : scanPos) + p.length;
  }

  const emit = (paragraphTexts: string[], firstParaIndex: number) => {
    const chunkText = paragraphTexts.join('\n\n');
    if (chunkText.trim().length === 0) return;
    const section = detectSection(text, paraPositions[firstParaIndex] ?? 0);
    chunks.push({
      id: `${source}#${chunkIndex}`,
      source,
      text: chunkText,
      tokens: tokenise(chunkText),
      section,
    });
    chunkIndex++;
  };

  let firstParaIdx = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    buffer.push(para);
    bufferLen += para.length;

    if (bufferLen >= targetChars || i === paragraphs.length - 1) {
      emit(buffer, firstParaIdx);

      // Build overlap: keep trailing paragraphs whose combined length ≤ overlapChars
      const overlap: string[] = [];
      let overlapLen = 0;
      for (let j = buffer.length - 1; j >= 0; j--) {
        if (overlapLen + buffer[j].length > overlapChars && overlap.length > 0) break;
        overlap.unshift(buffer[j]);
        overlapLen += buffer[j].length;
      }

      buffer = overlap;
      bufferLen = overlapLen;
      firstParaIdx = i + 1 - overlap.length;
    }
  }

  return chunks;
}
