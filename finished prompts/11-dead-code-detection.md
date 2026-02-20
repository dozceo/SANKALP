# Prompt: Dead Code Detection

## Objective
Identify exported functions, components, types, and utilities in the SANKALP codebase that are defined but never imported or used elsewhere. Generate a dead code inventory to support cleanup decisions.

## Actions to Execute

1. **Run** `scripts/detect-dead-code.ts` against `src/components` and `src/lib`
2. **List** all exported items (by name, file, and type: component or lib)
3. **Search** the full `src/` directory for each export's usage via string matching
4. **Flag** exports with zero usages as potential dead code
5. **Estimate** the impact of removing each flagged item
6. **Note** false positives (e.g., TypeScript types used only at compile time)

## Expected Output
A complete dead code inventory with file paths, export names, and removal recommendations.
