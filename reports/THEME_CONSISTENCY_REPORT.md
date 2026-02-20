# Theme Switching & Dark Mode Consistency Audit

**Generated:** 2026-02-19T19:11:51.958Z

## Executive Summary
This audit analyzes the usage of colors in the codebase to ensure consistency with the design system and support for dark mode.

- **Total Files Scanned:** 187
- **Files using `dark:` modifier:** 5 (3%)
- **Hardcoded Color Instances:** 12

## detailed Findings

### Hardcoded Colors (Arbitrary Values)
These instances bypass the theme system (CSS variables) and may not adapt correctly to dark mode.

| File | Line | Content |
|------|------|---------|
| `src/app/(main)/teacher/page.tsx` | 68 | `#ef4444` |
| `src/components/InteractiveGraph.tsx` | 356 | `#ffffff` |
| `src/components/InteractiveGraph.tsx` | 356 | `#a1a1aa` |
| `src/components/InteractiveGraph.tsx` | 468 | `bg-[hsl(var(--graph-bg))]` |
| `src/components/PersonalKnowledgeGraph.tsx` | 170 | `#ffffff` |
| `src/components/PersonalKnowledgeGraph.tsx` | 170 | `#d1d5db` |
| `src/components/ui/chart.tsx` | 55 | `#ccc` |
| `src/components/ui/chart.tsx` | 55 | `#fff` |
| `src/components/ui/chart.tsx` | 55 | `#ccc` |
| `src/components/ui/chart.tsx` | 55 | `#ccc` |
| `src/components/ui/chart.tsx` | 55 | `#fff` |
| `src/lib/color-utils.ts` | 8 | `#9333EA` |

## Recommendations
1. **Replace Hardcoded Colors:** Move distinct colors to `globals.css` as CSS variables or use standard Tailwind colors (e.g., `bg-primary`, `text-muted-foreground`).
2. **Verify Dark Mode:** Ensure components without `dark:` modifiers rely on semantic classes (like `bg-background`, `text-foreground`) which handle switching automatically.
