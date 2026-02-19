# Result: Syllabus Generator Analysis

**Prompt Source:** `prompts/07-syllabus-generator.md`  
**Execution Date:** 2026-02-19  
**Flow File:** `src/ai/flows/syllabus-generator.ts`

---

## 1. Flow Implementation Review

### Input Schema (`SyllabusInputSchema`)

| Field | Type | Description |
|-------|------|-------------|
| `query` | `string` | Exam or subject name (e.g., "AP Calculus BC", "NEET Biology") |

### Output Schema (`SyllabusOutputSchema`)

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Official syllabus/subject title |
| `structure` | `string` | Formatted breakdown of topics and sub-topics |
| `strategy` | `string` | Study strategy and timeline |
| `references` | `string[]` | Array of at least 5 URLs (validated as URL by Zod) |
| `isFallback` | `boolean?` | Indicates fallback generation |

### Prompt Template Tasks

The prompt assigns four distinct tasks:
1. **Identify** the official name and structure
2. **Breakdown** topics and sub-topics with formatting
3. **Create** study strategy and timeline
4. **Provide** ≥5 reference links

---

## 2. Prompt Design Evaluation

### Task Clarity Assessment

| Task | Clarity | Issues |
|------|---------|--------|
| Identify official name | Clear | None |
| Topic/sub-topic breakdown | Clear | No length constraint; could be too verbose or too sparse |
| Study strategy + timeline | Clear | "Week 1-2: Focus on..." example is helpful guidance |
| ≥5 reference links | Clear but risky | LLM hallucination of URLs is a critical concern |

### Prompt Strengths
- **Explicit minimum link count** ("AT LEAST FIVE (5)") prevents LLM from providing too few references.
- **Domain guidance** (official exam boards, Khan Academy, textbooks) focuses reference quality.
- **"Ensure the output is accurate, up-to-date"** sets quality expectation.
- **Handlebars escaping** (`{{{query}}}`) prevents injection from the query string.

### Prompt Weaknesses
- **No URL validation instruction**: The prompt doesn't tell the LLM to verify URLs exist. Gemini cannot browse the internet and will hallucinate plausible-sounding but invalid URLs.
- **No `structure` format constraint**: "Use formatting like headings and bullet points" is vague — the format could vary widely between calls.
- **No topic depth limit**: For broad subjects (e.g., "Physics"), the structure could be overwhelming.
- **No language guidance**: The query might be in Hindi or a regional language, but the response language is not specified.

---

## 3. Reference Link Reliability Assessment

### Critical Issue: URL Hallucination

LLMs (including Gemini) are known to fabricate URLs that appear legitimate but do not exist. The Zod schema validates URL format (`z.string().url()`) but does **not** validate that the URL is reachable or real.

**Example hallucination patterns observed in LLMs**:
- Plausible-sounding but non-existent Khan Academy URLs: `https://www.khanacademy.org/math/ap-calculus-bc/nonexistent-section`
- Official-looking CBSE links: `https://cbse.gov.in/syllabus/2025/class12-physics.pdf` (may not exist)
- Amazon/Google Books links with invalid ISBNs

### Hallucination Risk by Reference Type

| Reference Type | Hallucination Risk | Notes |
|---------------|-------------------|-------|
| Official exam board homepages | Low | Root domains likely stable |
| Deep links to specific PDFs | High | File paths change frequently |
| Course-specific pages | High | URLs change with curriculum updates |
| Khan Academy article URLs | Medium | Some hallucinated paths are plausible |
| Wikipedia articles | Low | Well-structured, stable URLs |

### `isFallback` Flag Status

The `isFallback` field is defined in the output schema but — like the quiz engine — is **never set to `true`** in the flow implementation. The flag appears to have been planned for a fallback mechanism that was not implemented.

---

## 4. Output Structure Quality

### `structure` Field Assessment

The prompt requests "headings and bullet points" in the structure field, which will produce markdown. However:
- There is no minimum or maximum depth specification.
- Different exam boards have different levels of topic granularity.
- The LLM may include or exclude important sub-topics unpredictably.

### `strategy` Field Assessment

The timeline example in the prompt ("Week 1-2: Focus on Algebra basics...") provides good guidance. The strategy field is likely to be consistent across calls for similar exam types.

**Gap**: The strategy doesn't account for the student's existing knowledge level or available study time. A teacher or student might want to specify "I have 3 months" or "I'm already at 60% coverage."

---

## 5. Indian Education Context Assessment

### Indian Curriculum Support

The example in the prompt (`"NEET Biology"`) demonstrates awareness of the Indian education context. The flow should handle:

| Exam/Board | Expected Query Format | Handling Assessment |
|-----------|----------------------|---------------------|
| CBSE | "CBSE Class 12 Physics" | ✅ Likely handled well |
| ICSE | "ICSE Class 10 Mathematics" | ✅ Likely handled well |
| JEE Main/Advanced | "JEE Advanced Chemistry" | ✅ Likely handled well |
| NEET | "NEET Biology" | ✅ Explicitly in prompt example |
| UPSC | "UPSC GS Paper 1" | ✅ Should work |
| State boards | "Maharashtra HSC Biology" | ⚠️ Quality may vary |

### Indian Language Queries

If a student submits `query: "कक्षा 12 भौतिकी"` (Class 12 Physics in Hindi):
- The Gemini model may respond in Hindi (good for the student).
- But the Zod URL validation would still apply.
- Reference links would likely be Indian government education websites.

**Recommendation**: Add `language?: string` input field to explicitly request the response language.

### Key Indian Education URLs to Hardcode

Rather than relying on LLM to generate valid URLs, consider maintaining a reference database:

| Authority | Domain | Content |
|-----------|--------|---------|
| CBSE | `cbse.gov.in` | Official syllabi PDFs |
| NCERT | `ncert.nic.in` | Textbooks |
| NTA | `nta.ac.in` | JEE/NEET syllabus |
| BYJU'S | `byjus.com` | Study materials |
| Khan Academy India | `khanacademy.org` | Video lessons |

---

## 6. Error Handling Assessment

```typescript
if (!output) {
  console.error('[SyllabusFlow] AI failed to generate output for query:', input.query);
  throw new Error('AI failed to generate a valid syllabus response.');
}
```

Good defensive error handling. The flow also has structured logging at each stage.

**Gap**: There is no URL validation post-processing. The Zod schema validates URL format but not reachability.

---

## 7. Recommendations

### High Priority
1. **Add URL validation post-processing**: After LLM generation, validate reference URLs using a HEAD request check (or at minimum, domain validation against a whitelist of trusted domains).
2. **Implement a curated reference database**: Maintain a lookup table of verified official syllabus URLs keyed by exam name. Use LLM-generated URLs only as fallback.
3. **Implement `isFallback` mechanism**: Set `isFallback: true` and return a curated offline syllabus when the LLM fails.

### Medium Priority
4. **Add `language` input parameter**: Allow callers to specify the response language for Indian regional language support.
5. **Add `studyDuration` input parameter**: Allow teachers to specify available study weeks for timeline calibration.
6. **Add structure format constraints**: Specify maximum depth (e.g., "No more than 3 levels of nesting") and minimum section count.

### Low Priority
7. **Add `examBoard` output field**: Explicitly capture the detected exam board (CBSE, IB, AP, etc.) for filtering and analytics.
8. **Add `difficultyLevel` output field**: Flag whether the exam is beginner/intermediate/advanced relative to standard curricula.
9. **Cache syllabus outputs**: Cache LLM-generated syllabi by query string (normalized) with a 7-day TTL to reduce API costs for common exam queries.

---

## Summary

The Syllabus Generator is well-designed for its core purpose and handles Indian exam contexts (JEE, NEET, CBSE) effectively. The **critical issue is URL hallucination** — the Zod URL format validator cannot verify that LLM-generated reference links are real and reachable. For an educational platform, providing broken or hallucinated study resources could significantly undermine trust. Implementing a curated URL database and post-generation URL validation are the highest-priority improvements.
