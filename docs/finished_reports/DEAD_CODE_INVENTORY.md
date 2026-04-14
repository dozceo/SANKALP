# Dead Code Inventory

Generated on: 2026-02-19T19:09:12.466Z

This report lists files in `src/components` and `src/lib` that are **never imported** by any entry point (Next.js pages, API routes, etc.).

**Total Unreachable Files:** 18

| File Path |
|---|
| `src/components/ui/accordion.tsx` |
| `src/components/ui/alert-dialog.tsx` |
| `src/components/ui/alert.tsx` |
| `src/components/ui/calendar.tsx` |
| `src/components/ui/carousel.tsx` |
| `src/components/ui/collapsible.tsx` |
| `src/components/ui/dropdown-menu.tsx` |
| `src/components/ui/menubar.tsx` |
| `src/components/ui/popover.tsx` |
| `src/components/ui/slider.tsx` |
| `src/components/ui/table.tsx` |
| `src/components/ui/toast.tsx` |
| `src/lib/auth.ts` |
| `src/lib/firestore.ts` |
| `src/lib/middleware/auth.ts` |
| `src/lib/rewards/calculateRewards.ts` |
| `src/lib/storage.ts` |
| `src/lib/validations/auth.ts` |

## Analysis Method
1. **Entry Points:** `page.tsx`, `layout.tsx`, `route.ts`, `actions/`, `instrumentation.ts`, `ai/dev.ts`, Sentry configs.
2. **Graph Traversal:** Built import graph using Regex parsing (independent of TypeScript compiler).
3. **Reachability:** Marked all files reachable from entry points.
4. **Scope:** Only files in `src/components` and `src/lib` are reported as dead.
