# Interaction Feedback Gap Report

Audit of interactive components for missing visual feedback states (hover, focus, disabled).

Total gaps found: 2

| File | Element | Line | Missing States |
| :--- | :--- | :--- | :--- |
| `src/components/PersonalKnowledgeGraph.tsx` | `<button>` | 240 | disabled |
| `src/components/planner/StudyLibrary.tsx` | `<a>` | 218 | focus |

## Notes
- **UI Library (`src/components/ui/`)**: Checked for presence of state modifiers in the file definition.
- **Component Usage**: Checked for raw HTML tags (`<button>`, `<a>`, `<input>`) usage with inline Tailwind classes.
- **States Checked**:
  - Button: `hover`, `focus`, `disabled`
  - Link: `hover`, `focus`
  - Input/Textarea/Select: `focus`, `disabled`
  - Checkbox/Switch: `focus`, `disabled`, `checked`
