# Prompt for Production-Ready Script Upgrade

**Goal:** Refactor the scripts `scripts/validate-weak-area-patterns.ts`, `scripts/detect-hallucinations.ts`, and `scripts/audit-env-vars.ts` to be production-ready, robust, and CI/CD compatible.

**Requirements:**

1.  **General Improvements:**
    *   **Modular Architecture:** Separate logic (feature extraction, detection, auditing) from execution (CLI runners).
    *   **Error Handling:** Implement robust `try-catch` blocks with specific error types and graceful degradation.
    *   **Logging:** Use a structured logger pattern (e.g., `winston` or `pino`) instead of `console.log`, allowing for JSON output in CI environments.
    *   **Configuration:** Support execution arguments via a CLI library (like `commander`) or environment variables (e.g., `LOG_LEVEL`, `OUTPUT_DIR`).
    *   **Exit Codes:** Ensure proper non-zero exit codes on failure for CI pipeline integration.

2.  **Specific Script Enhancements:**

    *   **`validate-weak-area-patterns.ts`**:
        *   **Dynamic Scenarios:** Instead of hardcoded arrays, allow generating $N$ random scenarios based on statistical distributions (normal vs. uniform).
        *   **Statistical Significance:** Implement a t-test or similar metric to quantify the confidence of the distinction between "weak area" and "random error".
        *   **Model Versioning:** Log the model version/hash being tested to track regression over time.

    *   **`detect-hallucinations.ts`**:
        *   **Pluggable Verifier:** Create an interface `FactChecker` that supports multiple backends:
            *   `HeuristicChecker` (Current regex-based).
            *   `LLMChecker` (Uses a trusted LLM to verify facts).
        *   **Data Source:** Load samples from an external JSON/CSV file rather than a hardcoded array.
        *   **Metric:** Calculate F1-score if ground truth labels are provided.

    *   **`audit-env-vars.ts`**:
        *   **AST Analysis:** Replace regex parsing with a proper TypeScript AST parser (using `ts-morph` or `typescript` compiler API) to accurately detect `process.env` usage, respecting scope and comments.
        *   **Config Support:** Audit non-TS files if relevant (e.g., `.env.example` vs `.env.local` sync check).
        *   **Ignore List:** Allow an `.env-audit-ignore` file to suppress false positives.

3.  **Output:**
    *   All reports should be generated in a dedicated `reports/` directory.
    *   Support JSON output format for programmatic consumption by other tools.

**Execution:**
Refactor the code in place, ensuring no existing functionality is lost, and update the `package.json` scripts if arguments change.
