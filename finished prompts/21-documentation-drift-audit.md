# Prompt: Documentation Drift Detection

## Objective
Detect drift between SANKALP's README documentation claims and the actual codebase state. Verify that documented features are actually implemented and identify any features that are implemented but undocumented.

## Actions to Execute

1. **Run** `scripts/audit-doc-drift.ts`
2. **For each feature** claimed in README.md, verify whether implementation exists in the source
3. **List** VERIFIED features (documented and implemented)
4. **List** DRIFTED features (documented but missing or broken in code)
5. **List** UNDOCUMENTED features (implemented but not mentioned in README)
6. **Produce** a diff-style summary of documentation vs. reality

## Expected Output
A documentation drift report with feature-by-feature verification status and a recommended README update.
