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

## 2026-05-24 - Accessible Clear Buttons in Search Inputs
**Learning:** Search inputs across the application often lack a way to clear the input quickly, or if they do, the clear buttons may lack proper focus states and ARIA labels. Users rely on 'clear' buttons to quickly reset search states without selecting the text manually.
**Action:** When adding text search inputs, always implement an accessible 'clear' button that conditionally renders. Ensure it has `type="button"`, an `aria-label`, `focus-visible` styling, adds right-padding (`pr-10`) to the input to prevent overlap, and utilizes an input `ref` to programmatically restore focus after clearing.
