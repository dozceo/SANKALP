
You are an expert DevOps and Security Engineer. Your task is to refactor the experimental audit scripts in the `scripts/` directory of the `audit-reports-security-ml-data` branch into production-ready, maintainable, and CI/CD-compatible tools.

## Context
The current branch contains the following experimental scripts:
1. `scripts/scan-secrets.ts`: Scans for hardcoded secrets.
2. `scripts/audit-server-actions.ts`: Audits Next.js Server Actions for auth checks.
3. `scripts/simulate-ml-burst.ts`: Simulates high-load ML requests.
4. `scripts/audit-synthetic-data.py`: Analyzes synthetic data quality.

These scripts currently lack error handling, robust logging, configuration options, and automated failure thresholds.

## Objectives
Refactor each script to meet the following production standards:
1. **Modular Architecture:** Extract shared logic (e.g., file walking, reporting) into reusable utilities.
2. **Configuration:** Support CLI arguments and config files (e.g., `.auditrc.json`) for custom rules, ignore patterns, and thresholds.
3. **CI/CD Integration:** Ensure scripts exit with non-zero codes on failure (e.g., finding a secret or failing a performance threshold) to block pipelines.
4. **Structured Logging:** Use a proper logging library (e.g., `winston` for Node, `logging` for Python) with configurable levels.
5. **Type Safety:** Ensure strict TypeScript typing and Python type hinting.
6. **Testing:** Add unit tests for the scanning and auditing logic.

## Specific Requirements per Script

### `scripts/scan-secrets.ts` -> `tools/security/secret-scanner.ts`
- Implement a whitelist system to suppress false positives (e.g., via inline comments or a config file).
- Support custom regex patterns via configuration.
- Integrate with `git` to scan only staged files during pre-commit hooks.

### `scripts/audit-server-actions.ts` -> `tools/security/server-action-auditor.ts`
- Improve AST parsing (using `ts-morph` or similar) instead of simple regex to accurately detect `auth()` calls within function scopes.
- classify risks more granularly (e.g., Public vs. Protected actions).

### `scripts/simulate-ml-burst.ts` -> `tools/performance/ml-load-test.ts`
- Make concurrency and total requests configurable via CLI flags.
- Output results in JSON format for easy parsing by CI tools.
- Implement a "dry run" mode.

### `scripts/audit-synthetic-data.py` -> `tools/data/quality-check.py`
- standardise on `pydantic` for schema validation if applicable.
- Allow defining expected distributions and thresholds in a YAML config.
- Generate HTML reports in addition to Markdown for better visualization.

## Output
Please provide the refactored code for these tools, organized in a `tools/` directory structure, along with a `package.json` update to include necessary dependencies and a `README.md` explaining how to run them in a CI environment.
