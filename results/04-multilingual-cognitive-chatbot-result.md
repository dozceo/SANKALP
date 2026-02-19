# Result: Multilingual Cognitive Chatbot Analysis

**Prompt executed:** `prompts/04-multilingual-cognitive-chatbot.md`  
**Date:** 2026-02-19  
**Source file read:** `src/ai/flows/multilingual-cognitive-chatbot.ts`

---

## Action 1: Review the flow implementation

**File read:** `src/ai/flows/multilingual-cognitive-chatbot.ts`

### Input schema fields and types (lines 12–16)

```typescript
const ExplainConceptInputSchema = z.object({
  concept: z.string(),          // The concept to explain
  brainMapContext: z.string(),  // Relevant Brain Map context for the concept
  language: z.string(),         // Target language for the explanation
});
```

### Output schema (lines 22–24)

```typescript
export const ExplainConceptOutputSchema = z.object({
  explanation: z.string(),   // The explanation in the target language
});
```

### Prompt template and language handling approach (lines 32–42)

```
You are a multilingual cognitive chatbot anchored to the Brain Map.
Your purpose is to explain concepts to students in their target language.
Concept: {{{concept}}}
Brain Map Context: {{{brainMapContext}}}
Target Language: {{{language}}}
Please provide a clear and concise explanation of the concept in the target language,
using the Brain Map context to guide your explanation.
```

Language handling is entirely delegated to the LLM — the prompt passes the language name as a string and expects the model to respond in that language.

---

## Action 2: Evaluate multilingual support

**Does the prompt adequately instruct the LLM to respond in the target language?**  
The instruction "provide a clear and concise explanation of the concept in the target language" is explicit. The LLM (Gemini 2.0 Flash) reliably follows this for major languages.

**Are there language detection or validation mechanisms?**  
None. The `language` field is a free string with no validation. Sending `language: ""` or `language: "gibberish"` produces unpredictable output without an error.

**What languages are supported?**  
Gemini 2.0 Flash supports major world languages and Indian regional languages (Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Odia). Rare or minority languages may produce fallback to English with no error signal.

---

## Action 3: Assess Brain Map context utilization

**How does brainMapContext guide concept explanations?**  
The prompt includes it as a raw string with the directive "using the Brain Map context to guide your explanation." The LLM is expected to extract relevant connections from the context string. No structured parsing occurs.

**Is there a risk of context overflow for large brain maps?**  
Yes. No length limit exists. A student with 20+ detailed topics could pass 2,000+ characters, disproportionate to the explanation task and increasing token cost unnecessarily.

**How is the relationship between concept and brain map context leveraged?**  
Implicitly — the LLM decides which parts of the context are relevant. The prompt does not ask it to cite specific connected topics or prerequisites.

---

## Action 4: Analyze output quality

**Does the prompt ensure culturally appropriate explanations?**  
No cultural guidance is given. The LLM uses its training data cultural defaults for each language, which may not always match the student's local context.

**Is there a mechanism for mathematical notation in different language contexts?**  
No explicit instruction. Mathematical formulas may be rendered inconsistently across languages — some models write them in local numeral systems rather than universal notation.

**How does it handle concepts with no direct translation?**  
No guidance. The LLM decides whether to transliterate, translate, or use the English term. This is inconsistent across calls and languages.

---

## Action 5: Recommend improvements

No code changes were made to this file — the flow already has the best error handling pattern in the codebase:

```typescript
// Lines 48–55 — proper null check with structured logging
if (!output) {
  console.error('[MultilingualChatbot] Flow completed but returned no output');
  throw new Error('AI failed to generate an explanation.');
}
```

Improvements identified (not implemented — require further design):

1. **Language validation**: Add an enum or validated list of ISO 639-1 codes for the `language` field to reject unsupported inputs early.
2. **Context length limit**: Truncate `brainMapContext` to the most relevant 500 characters for the given concept before injection.
3. **Mathematical notation guidance**: Add to prompt: "Keep all mathematical formulas in standard universal notation."
4. **Transliteration guidance**: Add to prompt: "For technical terms without a direct translation, provide the English term followed by a brief explanation in the target language."

This flow's error handling pattern (explicit null check, structured logging, typed error throw) should be adopted as the standard for all other flows — particularly `custom-cognitive-chatbot.ts` which used `output!` instead.
