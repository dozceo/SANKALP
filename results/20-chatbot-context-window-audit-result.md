# Result: Chatbot Context Window Health Audit

**Prompt executed:** `prompts/20-chatbot-context-window-audit.md`  
**Date:** 2026-02-20  
**Script run:** `scripts/audit-chatbot-context.ts`  
**Report generated:** `CHATBOT_CONTEXT_HEALTH_REPORT.md`

---

## Action 2: Stateless vs. stateful flows

| Flow | Stateful | Notes |
|------|---------|-------|
| Multilingual Cognitive Chatbot | No — stateless | Input: `concept` + `brainMapContext` only; no history array |
| Custom Cognitive Chatbot | No — stateless | Same as above + personality/customInstructions |
| Mindful Mentor | Pseudo-stateful | Accepts `studentHistory: string` (must be provided by caller) |
| Speech-to-Speech | No — stateless | Each turn is independent |
| Smart Revision Planner | DB-backed | Fetches full quiz history from Firestore — not a context window concern |

---

## Action 3: History growth simulation for Mindful Mentor

| Turns | Est. Characters | Est. Tokens | Risk Level | Status |
|-------|----------------|------------|-----------|--------|
| 10 | 890 | 223 | LOW | SAFE |
| 50 | 4,490 | 1,123 | LOW | SAFE |
| 100 | 8,990 | 2,248 | LOW | SAFE |
| 500 | 45,390 | 11,348 | CRITICAL | OVERFLOW |

**Threshold:** At ~500 turns (45K characters / 11K tokens), the `studentHistory` string alone would exceed a typical 8K token context window, causing the Gemini API to return a context length error.

---

## Action 4: Truncation logic

Source file read: `src/ai/flows/mindful-mentor.ts`  
**Finding:** No truncation logic. The `studentHistory` string is injected directly:
```typescript
Relevant background: "{{{studentHistory}}}"
```
No character limit, no token counting, no sliding window.

---

## Action 5: Session state storage

| Feature | Storage | Notes |
|---------|---------|-------|
| Chat history | `localStorage` | `src/app/(main)/chat/page.tsx` — device-local only |
| Syllabus state | `sessionStorage` | `src/app/(main)/syllabus/page.tsx` — tab-local only |
| All other pages | In-memory `useState` | Lost on navigation |

`localStorage` chat history is fragile: cleared on browser data wipe, not synced across devices. For an educational platform used on school computers, this is a significant UX concern.

---

## Action 6: Recommended sliding-window strategy

**Add to `mindful-mentor.ts` before prompt injection:**
```typescript
const MAX_HISTORY_CHARS = 2000;
const truncatedHistory = input.studentHistory.length > MAX_HISTORY_CHARS
  ? '...' + input.studentHistory.slice(-MAX_HISTORY_CHARS)
  : input.studentHistory;
```

**For chat history persistence:**
- Move from `localStorage` to Firestore `chatHistory` collection
- Store last 20 turns server-side per student
- Fetch the last 10 turns on each session load
