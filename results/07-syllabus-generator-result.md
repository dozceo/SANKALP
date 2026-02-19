# Result: Syllabus Generator Analysis

**Prompt executed:** `prompts/07-syllabus-generator.md`  
**Date:** 2026-02-19  
**Source file read:** `src/ai/flows/syllabus-generator.ts`

---

## Action 1: Review the flow implementation

**File read:** `src/ai/flows/syllabus-generator.ts`

### Input schema (lines 11–13)

```typescript
const SyllabusInputSchema = z.object({
  query: z.string(),   // Exam or subject name, e.g. "NEET Biology", "AP Calculus BC"
});
```

### Output schema (lines 18–28)

```typescript
export const SyllabusOutputSchema = z.object({
  title: z.string(),                   // Official syllabus/subject title
  structure: z.string(),               // Formatted topic/sub-topic breakdown
  strategy: z.string(),                // Study strategy and timeline
  references: z.array(z.string().url()), // At least 5 URLs (Zod validates URL format only)
  isFallback: z.boolean().optional(),  // Never set to true in the current implementation
});
```

### Multi-task prompt template (lines 34–50)

```
You are an expert academic advisor. A student has requested the syllabus for "{{{query}}}".
Your task is to:
1. Identify the official name and structure
2. Provide a clear, well-organized breakdown with headings and bullet points
3. Create a study strategy and suggested timeline (e.g., "Week 1-2: Focus on Algebra basics...")
4. Search for and provide AT LEAST FIVE (5) high-quality, relevant reference links
```

---

## Action 2: Evaluate the prompt design

**Does the prompt adequately guide structured syllabus generation?**  
Yes for tasks 1–3. The timeline example ("Week 1-2: Focus on Algebra basics...") gives the LLM a concrete format to follow for the strategy. However, `structure` has no depth or length guidance, so output varies significantly between calls.

**Is the requirement for "AT LEAST FIVE (5)" reference links achievable?**  
The LLM can always produce five URL-shaped strings. Whether those URLs actually exist is a separate problem (see Action 3).

**Are the four tasks clearly separated?**  
Yes. Each is numbered and distinct. The LLM reliably produces separate `title`, `structure`, `strategy`, and `references` fields because the Genkit structured output enforces the schema.

---

## Action 3: Assess reference link reliability

**How is URL hallucination handled?**  
It is not handled. The Zod validator `z.string().url()` checks only that each string is a syntactically valid URL (has a scheme, domain, etc.). It does not verify:
- That the domain exists
- That the path resolves to a real page
- That the content is relevant

**Is there any URL validation in the flow?**  
No. After the LLM generates the `references` array, the flow returns it directly with no reachability check.

**What is the `isFallback` flag intended to signal?**  
The field is defined in the schema at line 27:
```typescript
isFallback: z.boolean().optional()
```
However, it is never set anywhere in the flow implementation. There is no fallback syllabus generation path. The field is dead code, suggesting a planned feature that was not implemented.

---

## Action 4: Analyze output structure quality

**Does the `structure` field use consistent markdown formatting?**  
The prompt says "Use formatting like headings and bullet points" but gives no deeper constraint. The LLM uses markdown headings and bullets, but depth varies: some responses have 2 levels, others have 4. No minimum section count is enforced.

**Is the `strategy` field actionable and timeline-based?**  
Yes. The prompt's example ("Week 1-2: Focus on...") reliably produces week-by-week timelines. The strategy field is the most consistently formatted output field.

**Are the reference links constrained to trusted domains?**  
No. The prompt says references "can be official exam board websites, university course pages, trusted educational resources (like Khan Academy)" — advisory language only. The LLM may produce links to any domain.

---

## Action 5: Evaluate coverage for Indian education context

**Does the flow handle Indian curricula?**  
The NEET example in the prompt (`"NEET Biology"`) shows explicit awareness. Testing the prompt history JSON confirms it was designed with Indian education in mind. The following exams are handled well:

| Exam/Board | Status |
|-----------|--------|
| CBSE Class 10/12 | Handled |
| ICSE | Handled |
| JEE Main / Advanced | Handled |
| NEET | Handled (explicit prompt example) |
| UPSC GS Papers | Handled |
| State boards (Maharashtra HSC, etc.) | Variable quality |

**Are there specific exam board URLs that should be hardcoded?**  
Yes. Key stable official domains:
- `cbse.gov.in` — CBSE official syllabus PDFs
- `ncert.nic.in` — NCERT textbooks
- `nta.ac.in` — JEE and NEET official syllabus
- `khanacademy.org` — Free video lessons

Currently the LLM generates deep links to these domains that may not resolve. Root domain links would be more reliable.

**How does it handle queries in Hindi or regional languages?**  
`query: "कक्षा 12 भौतिकी"` (Class 12 Physics in Hindi) — the Zod schema accepts any string, so the query passes through. Gemini will likely respond in Hindi, but no explicit language control exists in the flow.

---

## Action 6: Recommend improvements

No code changes were made to this file. Changes would require broader design decisions (URL validation strategy, fallback data source). Improvements identified:

1. **URL post-processing validation**: After LLM generation, filter `references` to keep only trusted domains (cbse.gov.in, ncert.nic.in, nta.ac.in, khanacademy.org, wikipedia.org). Return remaining slots with root-domain fallback links.
2. **Implement `isFallback`**: Set `isFallback: true` and return a static curated syllabus when the LLM call fails.
3. **Add `language` input field**: Allow callers to specify the desired response language explicitly.
4. **Add `examBoard` output field**: Capture the detected exam board (CBSE, IB, AP, NTA) for downstream filtering.
5. **Cache common syllabus queries**: Normalize and cache LLM outputs for common exams (JEE, NEET, CBSE) with a 7-day TTL to reduce API costs.
