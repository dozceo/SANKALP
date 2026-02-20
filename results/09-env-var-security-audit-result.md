# Result: Environment Variable Security Audit

**Prompt executed:** `prompts/09-env-var-security-audit.md`  
**Date:** 2026-02-20  
**Script run:** `scripts/audit-env-vars.ts`  
**Report generated:** `ENV_VAR_SECURITY_REPORT.md`

---

## Action 1 + 2: Script executed — summary

- **Files scanned:** 188
- **Total usages found:** 41
- **Issues identified:** 33

---

## Action 3: Missing fallbacks (33 occurrences)

All 33 issues are classified as **MISSING FALLBACK** — `process.env.VAR` accessed without `|| default` or `?? default`.

Key findings by file:

| File | Variable | Line | Usage context |
|------|----------|------|---------------|
| `src/ai/genkit.ts` | `GOOGLE_GENAI_API_KEY` | 16 | Logged to console (presence check only — acceptable) |
| `src/ai/genkit.ts` | `GEMINI_API_KEY` | 17 | Logged to console (presence check only — acceptable) |
| `src/ai/genkit.ts` | `ADVERSARIAL_TEST` | 47 | Equality check `=== 'true'` — acceptable, falsy default is `undefined` |
| `src/app/api/chaos/route.ts` | `USE_MOCK_DB` | 29 | Equality check — acceptable |
| `src/components/ErrorBoundary.tsx` | `NODE_ENV` | 72 | Standard Next.js check — acceptable |
| `src/lib/firebase.ts` | `NODE_ENV` | 103 | Production environment guard — acceptable |
| `src/sentry.client.config.ts` | `NEXT_PUBLIC_SENTRY_DSN` | 4 | Passed to Sentry — should have `|| ''` fallback to avoid Sentry init errors |

---

## Action 4: `NEXT_PUBLIC_*` exposure assessment

Only one `NEXT_PUBLIC_` variable found: `NEXT_PUBLIC_SENTRY_DSN` (Sentry DSN).
- Sentry DSNs are designed to be public (they only accept error reports, not authenticate)
- **No sensitive key exposure through `NEXT_PUBLIC_*` variables detected**

---

## Action 5: Hardcoded secret defaults

No hardcoded API keys or passwords used as fallback defaults found in source code.

---

## Action 6: Prioritised remediation list

| Priority | Issue | File | Fix |
|----------|-------|------|-----|
| HIGH | `NEXT_PUBLIC_SENTRY_DSN` no fallback | `sentry.client.config.ts:4` | Add `|| ''` or conditional init |
| MEDIUM | 33 vars without fallbacks | Various | Add startup validation (e.g., Zod env schema) |
| LOW | `ADVERSARIAL_TEST`, `USE_MOCK_DB` equality checks | Various | Add `|| 'false'` for explicitness |

**Recommended solution:** Add a centralized env validation at startup using a Zod schema (or T3 Env):
```typescript
// src/env.ts
import { z } from 'zod';
const envSchema = z.object({
  GOOGLE_GENAI_API_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});
export const env = envSchema.parse(process.env);
```
