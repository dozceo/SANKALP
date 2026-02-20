# Prompt: Mobile Responsiveness Audit

## Objective
Audit the SANKALP frontend for mobile responsiveness gaps. Identify fixed pixel/rem sizes and missing responsive Tailwind breakpoint variants that could cause layout issues on small screens.

## Actions to Execute

1. **Run** `scripts/audit-responsive-design.ts` against `src/app` and `src/components`
2. **List** every file and line where fixed width/height/padding classes are used without responsive variants
3. **Categorize** findings by type: Fixed Width, Fixed Height, Large Padding, Fixed Font Size
4. **Count** total violations per file and identify the most affected pages
5. **Provide** the responsive Tailwind replacement pattern for the top 10 violations

## Expected Output
A mobile responsiveness report grouped by file, showing fixed classes, their line numbers, and suggested responsive alternatives.
