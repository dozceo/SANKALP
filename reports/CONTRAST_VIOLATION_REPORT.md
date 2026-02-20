# Contrast Violation Report

## Executive Summary
- **Total Color Pairs Checked**: 8
- **Violations Found**: 6

## Recommendations
1. **Increase Contrast**: Ensure all text/background combinations meet WCAG AA (4.5:1 ratio).
2. **Avoid Low Opacity Backgrounds**: Low opacity backgrounds on text often reduce contrast significantly.
3. **Review Color Palette**: Check if primary colors need adjustment for better accessibility.

## Detailed Violations
| Violation |
|---|
| File: src/app/(auth)/onboarding/page.tsx - Contrast violation: bg-primary/10 vs text-primary. Ratio: 2.96 |
| File: src/components/ErrorBoundary.tsx - Contrast violation: bg-primary vs text-primary-foreground. Ratio: 3.13 |
| File: src/components/PersonalKnowledgeGraph.tsx - Contrast violation: bg-secondary/80 vs text-muted-foreground. Ratio: 2.99 |
| File: src/components/PersonalKnowledgeGraph.tsx - Contrast violation: bg-secondary/80 vs text-muted-foreground. Ratio: 2.99 |
| File: src/components/PersonalKnowledgeGraph.tsx - Contrast violation: bg-secondary/80 vs text-muted-foreground. Ratio: 2.99 |
| File: src/components/PersonalKnowledgeGraph.tsx - Contrast violation: bg-secondary/80 vs text-muted-foreground. Ratio: 2.99 |
