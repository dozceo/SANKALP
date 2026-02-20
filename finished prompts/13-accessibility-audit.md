# Prompt: Static Accessibility Audit

## Objective
Perform a static accessibility analysis of all UI components in SANKALP. Identify WCAG violations that can be detected without a browser (missing forwardRef on Radix wrappers, icon-only buttons without aria-label, images without alt text).

## Actions to Execute

1. **Run** `scripts/audit-a11y-static.ts` against `src/components/ui`
2. **List** every accessibility violation with file name, rule ID, and description
3. **For each violation**, explain the WCAG criterion it violates
4. **Provide** the specific code fix for each violation
5. **Check** for `<img>` tags without `alt` attributes across the full `src/` directory

## Expected Output
A static accessibility violation report with WCAG criterion references and code-level fixes for every finding.
