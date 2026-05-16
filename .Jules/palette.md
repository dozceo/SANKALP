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
## 2025-02-23 - Critical Focus Visible Styles on Custom Button Form Controls
**Learning:** When using `<button>` elements to create custom radio or checkbox inputs (like the Grade, Subject, and Study Time selectors in `StudentProfileForm`), they often lack default visible focus states, which breaks keyboard accessibility. This makes it impossible for users relying on keyboard navigation to see which option is currently focused before selecting it.
**Action:** Always ensure that custom button-based form controls include explicit focus styles. In this project, consistently apply `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background` to all such buttons to maintain the application's accessibility standards.
