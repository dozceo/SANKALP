# Result: Genkit Security Assessment

**Prompt executed:** `prompts/10-genkit-security-assessment.md`  
**Date:** 2026-02-20  
**Script run:** `scripts/audit-genkit-security.ts`  
**Report generated:** `GENKIT_SECURITY_ASSESSMENT.md`

---

## Action 1 + 2: Environment guard check on `src/ai/dev.ts`

File `src/ai/dev.ts` was read. Content (lines 1–8):
```typescript
import { config } from 'dotenv';
config({ path: '.env.local' });

import '@/ai/flows/multilingual-cognitive-chatbot.ts';
import '@/ai/flows/smart-revision-planner.ts';
// ... (all 8 flow files imported)
```

**Finding:** No `if (process.env.NODE_ENV === 'development')` guard exists in `dev.ts`. The script assessment flagged:
```
⚠️ No explicit environment guard found in `src/ai/dev.ts`.
```

However, `dev.ts` is the entry point for the `genkit:dev` NPM script only (`npx genkit start -- tsx src/ai/dev.ts`). It is not imported by any production file.

---

## Action 3: Production code exposure check

Script result:
```
✅ No production code imports `src/ai/dev.ts`.
```

Grep confirmed: no production files in `src/app`, `src/components`, or `src/lib` import `@/ai/dev`.

---

## Action 4: `src/ai/genkit.ts` chaos proxy assessment

The `ai` export is wrapped in a Proxy that intercepts `generate`, `definePrompt`, and `defineFlow` to inject a chaos check before execution (`chaos.checkChaos('genkit')`).

**Security implication:** The proxy also intercepts `definePrompt` and, when `ADVERSARIAL_TEST === 'true'`, logs all prompt inputs to a global array `g.__ADVERSARIAL_LOGS__` and calls `g.__ADVERSARIAL_MOCK_RESOLVER__` if set.

---

## Action 5: `ADVERSARIAL_TEST` handler risk assessment

```typescript
if (process.env.ADVERSARIAL_TEST === 'true') {
  g.__ADVERSARIAL_LOGS__.push(logEntry);
  if (g.__ADVERSARIAL_MOCK_RESOLVER__) {
    return { output: g.__ADVERSARIAL_MOCK_RESOLVER__(args[0]?.name, pArgs[0]) };
  }
}
```

**Risk level: LOW.** This code only activates when `ADVERSARIAL_TEST=true` is set. In a production deployment without this env var, the code is never reached. The global variable approach is test-only.

---

## Action 6: `__ADVERSARIAL_MOCK_RESOLVER__` abuse potential

The global `__ADVERSARIAL_MOCK_RESOLVER__` can only be set by code that has access to the server-side Node.js process (not from client code or user input). No web-accessible endpoint sets it. Risk is **negligible in production**.

---

## Summary

| Check | Result |
|-------|--------|
| `dev.ts` environment guard | MISSING (low risk — not imported in prod) |
| Production imports of `dev.ts` | NONE FOUND |
| `ADVERSARIAL_TEST` in production | NOT ACTIVATED (env var not set) |
| `__ADVERSARIAL_MOCK_RESOLVER__` exposure | NOT EXPLOITABLE from web |

**Recommendation:** Add a guard to `dev.ts` for defence-in-depth:
```typescript
if (process.env.NODE_ENV === 'production') {
  throw new Error('src/ai/dev.ts must not be loaded in production');
}
```
