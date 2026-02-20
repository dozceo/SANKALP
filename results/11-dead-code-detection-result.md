# Result: Dead Code Detection

**Prompt executed:** `prompts/11-dead-code-detection.md`  
**Date:** 2026-02-20  
**Script run:** `scripts/detect-dead-code.ts`  
**Report generated:** `DEAD_CODE_INVENTORY.md`

---

## Action 1 + 2: Script executed — summary

- **Potential dead code items found:** 49
- **Scan scope:** `src/components` (components) and `src/lib` (lib utilities)
- **Method:** Heuristic string search for each export name across full `src/`

---

## Action 3: Full inventory (49 items)

### Components (TypeScript type exports — likely false positives)
| Name | File |
|------|------|
| `BadgeProps` | `src/components/ui/badge.tsx` |
| `ButtonProps` | `src/components/ui/button.tsx` |
| `CalendarProps` | `src/components/ui/calendar.tsx` |
| `ChartConfig` | `src/components/ui/chart.tsx` |

### Auth utilities (`src/lib/auth.ts`)
| Name | Notes |
|------|-------|
| `signInWithEmail` | Not called in any page/component — UI uses Firebase Auth directly |
| `signUpWithEmail` | Same |
| `resetPassword` | Same |
| `updateUserProfile` | Same |
| `getCurrentUser` | Same |

### Firebase utilities (`src/lib/firestore.ts`)
| Name | Notes |
|------|-------|
| `FirestoreDocument`, `getDocument`, `getDocuments`, `createDocument`, `setDocument`, `updateDocument`, `deleteDocument`, `subscribeToDocument`, `subscribeToCollection` | Generic Firestore wrappers — used in db-helpers indirectly |

### Storage utilities (`src/lib/storage.ts`)
| Name | Notes |
|------|-------|
| `uploadFile`, `uploadFileWithProgress`, `deleteFile`, `getFileURL`, `listFiles`, `getUserUploadPath`, `uploadUserFile`, `createStorageRef` | No file upload UI found in codebase |

### Other high-confidence dead code
| Name | File | Notes |
|------|------|-------|
| `MENTOR_FALLBACKS` | `src/lib/chat-fallback.ts` | Only `getMentorFallback()` is called, not the array directly |
| `emailSchema`, `passwordSchema`, `nameSchema` | `src/lib/validations/auth.ts` | Imported by auth forms but exported unnecessarily |
| `Trend` | `src/lib/trend-utils.ts` | Type used internally only |

---

## Action 4: Zero-usage flag assessment

**Highest confidence dead code:**
- All 8 `src/lib/storage.ts` exports — no file upload feature exists in the UI
- All 5 `src/lib/auth.ts` utilities — auth flows appear to use Firebase Auth hooks directly
- `GRAPH_COLORS` from `src/lib/styles/graph-tokens.ts` — not imported anywhere in components

---

## Action 5: Impact of removal

| Group | Lines saved (est.) | Risk |
|-------|--------------------|------|
| `src/lib/storage.ts` | ~120 lines | Low — no UI feature uses it |
| `src/lib/auth.ts` utilities | ~60 lines | Medium — verify no API routes use them |
| `src/lib/firestore.ts` generics | ~80 lines | High — may be used via indirect imports |
| UI component `*Props` types | ~10 lines | Low — TypeScript only, no runtime cost |

---

## Action 6: False positives

- **`*Props` component type exports**: These are TypeScript types — no runtime cost. They are false positives for "dead code" in a runtime sense (used by consumers who import the type).
- **`src/lib/firestore.ts` wrappers**: Used indirectly by `db-helpers.ts` which re-exports higher-level functions. Requires tracing the call graph further.
- **Zod schemas** (`emailSchema`, etc.): These may be used in forms via object destructuring which the string-search heuristic misses.
