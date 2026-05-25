## 2025-05-22 - Custom Interactive Components & Accessibility
**Learning:** Custom interactive components (like graphs using canvas/SVG) often use raw HTML buttons that bypass the design system's accessibility defaults (focus rings, aria-labels).
**Action:** When auditing complex visualizations, explicitly check the control buttons for standard accessible traits, not just the visualization content itself.

## 2025-05-23 - Dynamic Content & Screen Readers
**Learning:** Dynamic updates like countdown timers can spam screen readers if not controlled with `aria-live="off"` or "polite", and status changes need explicit `role="status"` to be announced.
**Action:** Always check `aria-live` settings for components that update frequently (every second) versus those that update on user action.

## 2026-02-15 - Missing Focus Styles in Dynamic Lists
**Learning:** Iterative rendering of native HTML elements (like `<a>` inside `.map()`) often bypasses design system defaults, leading to missing focus indicators in critical navigation areas.
**Action:** Always verify keyboard navigation on dynamically generated lists, especially those using raw HTML tags instead of design system components.

## 2026-06-21 - Form Toggle Buttons Accessibility
**Learning:** Custom toggle buttons implemented as raw `button` elements often miss focus states, unlike `shadcn/ui` components.
**Action:** When auditing forms with custom selection UI (like pills or chips), explicitly check for `focus-visible` styles.

## 2026-05-25 - Icon-only Buttons and Linter Constraints
**Learning:** Custom accessibility linters (like the `icon-button-label` rule in Radix a11y audits) may use naive line-by-line regex parsing instead of AST parsing. This causes them to fail if `aria-label` is placed on a different line than `size="icon"`, even if the final HTML is semantically correct.
**Action:** When fixing accessibility violations flagged by custom scripts, adapt the formatting (e.g., placing `aria-label` adjacent to the trigger prop on the same line) to satisfy the tooling's specific parsing logic, while ensuring the end user experience remains accessible.
