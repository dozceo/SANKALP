## 2024-05-19 - Accessible Clear Input Button
**Learning:** Adding a conditionally rendered clear button inside an input wrapper greatly enhances search UX. It must include `type="button"` to avoid form submission, `aria-label` for screen readers, and should use a `useRef` to programmatically restore focus to the `<input>` after clearing, maintaining keyboard navigation flow.
**Action:** Always implement a programmatic focus return when clearing text inputs, and explicitly style `focus-visible` to ensure keyboard accessibility.
