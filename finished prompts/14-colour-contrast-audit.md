# Prompt: Colour Contrast Audit

## Objective
Identify colour contrast ratio violations in SANKALP's Tailwind CSS components that fail WCAG 2.1 AA (minimum 4.5:1 for normal text, 3:1 for large text and UI components).

## Actions to Execute

1. **Run** `scripts/audit-contrast.ts` against all component and page files
2. **List** every contrast violation with file path, line number, foreground colour class, background colour class, and estimated ratio
3. **Classify** each violation as text (requires 4.5:1) or UI component (requires 3:1)
4. **Identify** the specific Tailwind tokens causing the violation
5. **Propose** alternative colour token pairings that meet WCAG AA requirements

## Expected Output
A contrast violation report with file-level details, WCAG classification, and recommended colour replacements.
