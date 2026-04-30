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
## 2026-04-30 - Added accessible Clear buttons to Search Inputs\n**Learning:** When using text inputs for search, providing a visually intuitive 'clear' button inside the input field improves UX. The  is crucial to return focus to the input after clearing, allowing the user to seamlessly type a new query without an extra click.\n**Action:** Ensure all future search/filter inputs incorporate an accessible internal clear button (, ARIA label, conditional rendering, ref focusing) instead of relying solely on external "Clear Filters" buttons.
## 2026-04-30 - Added accessible Clear buttons to Search Inputs
**Learning:** When using text inputs for search, providing a visually intuitive 'clear' button inside the input field improves UX. The `useRef` is crucial to return focus to the input after clearing, allowing the user to seamlessly type a new query without an extra click.
**Action:** Ensure all future search/filter inputs incorporate an accessible internal clear button (`type="button"`, ARIA label, conditional rendering, ref focusing) instead of relying solely on external "Clear Filters" buttons.
