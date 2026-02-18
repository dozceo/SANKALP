# Production Refactoring Prompts

Use the following prompt to upgrade the maintenance scripts in this branch to production standards.

---

**Role:** Senior DevOps & ML Engineer
**Task:** Refactor the following maintenance scripts for production deployment.

**Scripts:**
1. `scripts/audit-form-errors.ts`
2. `scripts/version-prompts.ts`
3. `src/ml/training/generate_data.py`
4. `src/ml/training/train_mastery_model.py`

**Requirements:**

**1. General Engineering Standards:**
*   **CLI Arguments:** Replace hardcoded paths with command-line arguments (use `commander` for TS, `argparse` for Python).
*   **Logging:** Replace `console.log`/`print` with structured logging (include timestamps and log levels).
*   **Error Handling:** Implement graceful failure modes with appropriate exit codes (0 for success, 1 for error).
*   **Atomic Writes:** Ensure all file generation (JSON, CSV, PKL) uses atomic write patterns (write to temp, then rename) to prevent data corruption.

**2. TypeScript Scripts (`scripts/*.ts`):**
*   **`audit-form-errors.ts`:**
    *   Externalize test cases to a `config/form-audit-cases.json` file.
    *   Add a `--fail-on-score <threshold>` flag to break CI if clarity scores are too low.
*   **`version-prompts.ts`:**
    *   Add a `--check` flag that fails if uncommitted prompt changes are detected (for CI pipelines).
    *   Improve regex to strictly match `ai.definePrompt` to avoid false positives.

**3. Python ML Scripts (`src/ml/training/*.py`):**
*   **Type Safety:** Add full type hints and ensure MyPy compliance.
*   **Reproducibility:** Allow passing a specific `seed` and `git_hash` via arguments to override auto-detection (useful for re-running historical builds).
*   **Validation:** Add specific checks for data schema validity before training.
