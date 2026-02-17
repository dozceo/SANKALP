# Color Contrast Violation Report

Audit of text/background color combinations against WCAG 2.1 AA standards (Minimum 4.5:1 ratio for normal text).

Total pairs checked found: 10 violations found (in either Light or Dark mode).

| File | Background | Text | Light Mode Ratio | Dark Mode Ratio | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `src/app/(auth)/login/page.tsx` | `bg-background` | `text-muted-foreground` | **4.35** (FAIL) | **7.80** (PASS) | ⚠️ |
| `src/app/(main)/brain-map/page.tsx` | `bg-secondary/50` | `text-muted-foreground` | **4.34** (FAIL) | **5.71** (PASS) | ⚠️ |
| `src/app/(main)/classes/page.tsx` | `bg-destructive` | `text-destructive-foreground` | **3.60** (FAIL) | **9.58** (PASS) | ⚠️ |
| `src/app/(main)/classes/page.tsx` | `bg-muted/30` | `text-muted-foreground` | **4.34** (FAIL) | **5.71** (PASS) | ⚠️ |
| `src/app/(main)/home/page.tsx` | `bg-destructive/10` | `text-destructive` | **1.00** (FAIL) | **1.00** (FAIL) | ⚠️ |
| `src/components/ErrorBoundary.tsx` | `bg-primary` | `text-primary-foreground` | **4.35** (FAIL) | **3.13** (FAIL) | ⚠️ |
| `src/components/PersonalKnowledgeGraph.tsx` | `bg-secondary/80` | `text-muted-foreground` | **4.34** (FAIL) | **5.71** (PASS) | ⚠️ |
| `src/components/PersonalKnowledgeGraph.tsx` | `bg-secondary/80` | `text-muted-foreground` | **4.34** (FAIL) | **5.71** (PASS) | ⚠️ |
| `src/components/PersonalKnowledgeGraph.tsx` | `bg-secondary/80` | `text-muted-foreground` | **4.34** (FAIL) | **5.71** (PASS) | ⚠️ |
| `src/components/PersonalKnowledgeGraph.tsx` | `bg-secondary/80` | `text-muted-foreground` | **4.34** (FAIL) | **5.71** (PASS) | ⚠️ |

## Notes
- Colors derived from CSS variables in `src/app/globals.css`.
- Opacity modifiers (e.g., `bg-primary/50`) are ignored in static analysis (assumed 100%), which may affect actual contrast.
- Only checks explicit `bg-*` and `text-*` pairs on the same element. Inherited backgrounds are not tracked.
