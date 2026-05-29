1. **Optimize search filtering by hoisting `.toLowerCase()` operations**
   - The files `src/app/(main)/teacher/students/page.tsx`, `src/app/(main)/teacher/classes/page.tsx`, `src/app/(main)/teacher/classes/[classId]/page.tsx`, and `src/components/planner/StudyLibrary.tsx` contain `useMemo` hooks that filter arrays based on a search string.
   - Currently, they call `.toLowerCase()` on the search query *inside* the `.filter()` callback, executing the same string transformation repeatedly for every item in the array.
   - I will hoist `searchTerm.toLowerCase()` or `searchQuery.toLowerCase()` outside the `.filter()` loop.

2. **Run tests**
   - Execute `npx jest` and `pnpm build` to verify that no functional regressions have been introduced.

3. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done**
   - Call `pre_commit_instructions` tool to execute the required pre-commit process.

4. **Submit**
   - Push code and create a PR with the required Bolt PR format (e.g. `⚡ Bolt: [performance improvement]`).
