
## 2024-05-15 - Clear Search Button Pattern
**Learning:** Text inputs with search functionality heavily benefit from a 'clear' (X icon) button when text is present. It reduces the interaction cost of clearing a search to zero (one click vs holding backspace).
**Action:** Always add an accessible clear button (with hover, focus-visible states, and `aria-label`) dynamically to search inputs when they contain a value, and ensure the input's right-padding is increased (`pr-10`) to prevent text overlap.
