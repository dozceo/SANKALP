# Result: Colour Contrast Audit

**Prompt executed:** `prompts/14-colour-contrast-audit.md`  
**Date:** 2026-02-20  
**Script run:** `scripts/audit-contrast.ts`  
**Report generated:** `contrast-violation-report.md`

---

## Action 1 + 2: Script executed — violations found

**Total violations: 6**

| File | Foreground | Background | Estimated Ratio |
|------|-----------|-----------|----------------|
| `src/app/(auth)/onboarding/page.tsx` | `text-primary` | `bg-primary/10` | 2.96 |
| `src/components/ErrorBoundary.tsx` | `text-primary-foreground` | `bg-primary` | 3.13 |
| `src/components/PersonalKnowledgeGraph.tsx` (×4) | `text-muted-foreground` | `bg-secondary/80` | 2.99 |

---

## Action 3: WCAG classification

| Violation | Type | Required Ratio | Passes? |
|-----------|------|---------------|---------|
| `onboarding/page.tsx` — `primary/10` bg | Normal text | 4.5:1 | FAIL (2.96) |
| `ErrorBoundary.tsx` — `primary` bg | Normal text | 4.5:1 | FAIL (3.13) |
| `PersonalKnowledgeGraph.tsx` — `secondary/80` bg (×4) | Normal text | 4.5:1 | FAIL (2.99) |

All 6 violations are for **normal-size body text** and require a minimum 4.5:1 ratio under WCAG 2.1 AA.

---

## Action 4: Tailwind token analysis

| Violation | Root cause |
|-----------|-----------|
| `bg-primary/10 text-primary` | Using primary on primary-tinted background creates low contrast. The `/10` opacity makes the background too close in lightness to the text |
| `bg-primary text-primary-foreground` | The `primary-foreground` token is not sufficiently contrasting against the project's `primary` colour value |
| `bg-secondary/80 text-muted-foreground` | `muted-foreground` is a low-contrast grey designed for subtle secondary text; using it on a saturated background at 80% opacity fails |

---

## Action 5: Recommended colour replacements

| Current | Replacement | Notes |
|---------|------------|-------|
| `bg-primary/10 text-primary` | `bg-primary/10 text-primary-foreground` or increase tint to `bg-primary/5` | Use full-strength foreground token |
| `bg-primary text-primary-foreground` | Verify CSS variable `--primary-foreground` meets 4.5:1 against `--primary`; adjust in `globals.css` if not | |
| `bg-secondary/80 text-muted-foreground` | `bg-secondary/80 text-secondary-foreground` | `secondary-foreground` is designed to contrast against `secondary` backgrounds |

**File to update:** `src/app/globals.css` — review the CSS custom property values for `--primary`, `--primary-foreground`, `--secondary`, `--muted-foreground` and ensure they meet 4.5:1 contrast ratios.
