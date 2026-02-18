# Production Refactor Prompt

Use the following prompt to guide an AI agent or developer in refactoring the audit scripts for production environments.

---

## Prompt

**Role:** Senior DevOps Engineer / TypeScript Specialist

**Task:** Refactor the existing static analysis scripts (`scripts/typography-analysis.ts`, `scripts/color-contrast-check.ts`, `scripts/interactive-state-audit.ts`) to meet production-grade standards for reliability, performance, and maintainability.

**Context:**
The current scripts are functional prototypes using synchronous file I/O and regex-based parsing. They need to be robust enough to run in a CI/CD pipeline (e.g., GitHub Actions) and handle the entire codebase without timing out or crashing on edge cases.

**Requirements:**

1.  **CI/CD Integration & Exit Codes**
    *   Ensure all scripts return a **non-zero exit code** (e.g., `process.exit(1)`) if any violations are found.
    *   Implement a `--ci` flag. When enabled:
        *   Disable interactive prompts (if any).
        *   Output results in JSON format to `stdout` or a specified file for machine parsing.
        *   Suppress verbose logging.

2.  **Performance & I/O**
    *   Replace `fs.readFileSync` with `fs.promises` or Node.js Streams.
    *   Implement **concurrent file processing** (e.g., using `p-limit` or chunked `Promise.all`) to speed up execution on large repositories.

3.  **Parsing Robustness**
    *   **Typography & Interactive State:** Evaluate moving from Regex to **AST-based parsing** (using `ts-morph` or `typescript` Compiler API). This is critical to correctly identify:
        *   Conditional classes (e.g., `clsx('text-sm', condition && 'text-lg')`).
        *   Props passed via spread syntax.
        *   Components defined in variables/functions, not just JSX literals.
    *   **Color Contrast:** Improve the CSS variable resolution logic. Handle `rgba`, `hsla`, and opacity modifiers in Tailwind classes (e.g., `bg-primary/50`) by calculating the effective blended color against a white/dark background assumption.

4.  **Architecture & Shared Utilities**
    *   Create a shared module `scripts/lib/audit-utils.ts` to house:
        *   File walking logic (globbing).
        *   Common regex/AST helpers.
        *   Report generation helpers (Markdown/JSON formatting).
    *   Define strict TypeScript interfaces for all Report artifacts.

5.  **Configuration**
    *   Move hardcoded paths (`src/app`, `src/components`) and thresholds (e.g., WCAG 4.5) to a configuration file (e.g., `audit.config.json`) or accept them as CLI arguments.

**Deliverables:**
*   Refactored `.ts` files for all three scripts.
*   New `scripts/lib/` directory with shared utilities.
*   Updated `package.json` scripts to include the new CLI flags (e.g., `"audit:typography": "tsx scripts/typography-analysis.ts --ci"`).
