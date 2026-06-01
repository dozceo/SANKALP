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
## 2026-06-01 - Line-by-line enforcement of icon-button-label
**Learning:** The custom accessibility audit script (`scripts/audit-radix-a11y.ts`) evaluates `icon-button-label` violations line-by-line rather than parsing an AST. When adding an `aria-label` to a Shadcn UI `<Button>` with `size="icon"`, the `aria-label` attribute must be placed on the exact same line as the `size="icon"` declaration to pass the audit. Moving existing `aria-label` declarations to the same line as `size="icon"` is required for buttons that already have them.
**Action:** Always ensure `aria-label` is on the same line as `size="icon"` when fixing `icon-button-label` violations to satisfy line-by-line custom audit scripts.
