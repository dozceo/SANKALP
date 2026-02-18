# AI Prompt: Generate UX Fixes for "Sankalp" Educational Platform

**Role:** Expert Full-Stack Engineer (Next.js, TypeScript, Tailwind CSS, Shadcn UI) & UX Specialist.

**Context:**
You are working on "Sankalp", an adaptive learning platform. A recent UX Entropy Analysis (`UX_FLOW_ENTROPY_REPORT.md`) identified several critical issues in the user journey, including broken navigation links for teachers, high cognitive load on dashboard pages, and "dead-end" states for students.

**Goal:**
Generate production-ready code to resolve the prioritized issues listed below. The code must be robust, accessible, and follow the existing design patterns (Shadcn UI, Lucide icons).

---

## Task 1: Fix Broken Teacher Navigation (P0)
The following routes are linked in the sidebar but return 404s. Create basic placeholder pages for them.

1.  **Create `src/app/(main)/teacher/interventions/page.tsx`**
    *   **Content:** A dashboard page titled "Student Interventions".
    *   **Features:**
        *   An empty state illustration (use a Lucide icon like `AlertTriangle` or `HelpingHand`).
        *   Text: "AI-driven intervention suggestions coming soon."
        *   A "View At-Risk Students" button that links back to `/teacher/students`.
2.  **Create `src/app/(main)/teacher/analytics/page.tsx`**
    *   **Content:** A dashboard page titled "Class Analytics".
    *   **Features:**
        *   Placeholder for charts (use `Card` components).
        *   Text: "Detailed performance metrics will appear here."

## Task 2: Revive "Dead End" Pages (P1)
Students currently reach these pages and have no clear next step. Add "Call to Action" (CTA) buttons to guide them.

1.  **Modify `src/app/(main)/rewards/page.tsx`**:
    *   Add a primary button at the top (next to the title or in a prominent card): "Earn More Points".
    *   **Action:** Link to `/quiz` with `variant="default"`.
2.  **Modify `src/app/(main)/brain-map/page.tsx`** (if exists) or ensure the page structure supports navigation.
    *   Add a button: "Test Knowledge" -> Link to `/quiz`.

## Task 3: Reduce Cognitive Load on Teacher Classes (P2)
The page `src/app/(main)/teacher/classes/page.tsx` is overloaded (Score: 104).

1.  **Refactor the Filters:**
    *   Move the Search, Subject Select, and Grade Select into a `Collapsible` or a `Sheet` component for mobile views (hidden by default on small screens, toggled by a "Filters" button).
    *   On desktop, keep them visible but organize them into a compact row.
2.  **Simplify Cards:**
    *   Ensure the class cards use adequate padding and don't crowd the information.

## Task 4: Fix "Forgot Password" Link (P0)
1.  **Create `src/app/(auth)/forgot-password/page.tsx`**:
    *   **Content:** A simple form with an Email input and a "Reset Password" button.
    *   **Logic:** Use Firebase `sendPasswordResetEmail` (mock or import from `auth` context if available).
    *   **Navigation:** A "Back to Login" link pointing to `/login`.

---

**Output Requirements:**
*   Provide the full file content for new files.
*   Provide `git merge` diff blocks for modifying existing files.
*   Ensure all imports (UI components, icons) match the project structure (`@/components/ui/...`, `lucide-react`).
*   **Strictly** adhere to `use client` directives where necessary.
