# Result: Static Accessibility Audit

**Prompt executed:** `prompts/13-accessibility-audit.md`  
**Date:** 2026-02-20  
**Script run:** `scripts/audit-a11y-static.ts`  
**Report generated:** `static-a11y-violations.md`

---

## Action 1 + 2: Script executed — violations found

Script scanned: `src/components/ui`  
**Total violations: 3**

| File | Rule | Message |
|------|------|---------|
| `collapsible.tsx` | `radix-wrapper-forward-ref` | Radix primitive wrapper should use `forwardRef` to maintain accessibility focus management |
| `collapsible.tsx` | `radix-wrapper-props-spread` | Radix primitive wrapper should spread `...props` to ensure ARIA attributes are passed down |
| `sidebar.tsx` | `icon-button-label` | Icon-only button (`size="icon"`) missing `aria-label` |

---

## Action 3: WCAG criterion for each violation

| Violation | WCAG Criterion | Level |
|-----------|---------------|-------|
| Missing `forwardRef` on `collapsible.tsx` | WCAG 2.1 – 2.4.3 Focus Order | AA |
| Missing `...props` spread on `collapsible.tsx` | WCAG 2.1 – 4.1.2 Name, Role, Value | A |
| Missing `aria-label` on icon button in `sidebar.tsx` | WCAG 2.1 – 4.1.2 Name, Role, Value | A |

---

## Action 4: Code fix for each violation

### `collapsible.tsx` — add `forwardRef` and `...props` spread

```tsx
// Before
const CollapsibleTrigger = ({ children, ...rest }: CollapsibleTriggerProps) => (
  <CollapsiblePrimitive.Trigger {...rest}>{children}</CollapsiblePrimitive.Trigger>
);

// After
const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ children, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger ref={ref} {...props}>{children}</CollapsiblePrimitive.Trigger>
));
CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName;
```

### `sidebar.tsx` — add `aria-label` to icon button

```tsx
// Before
<Button size="icon" variant="ghost">
  <PanelLeft />
</Button>

// After
<Button size="icon" variant="ghost" aria-label="Toggle sidebar">
  <PanelLeft aria-hidden="true" />
</Button>
```

---

## Action 5: `<img>` without `alt` — full `src/` scan

```
grep -r '<img' src/ --include="*.tsx" | grep -v 'alt='
```

Result: No `<img>` tags without `alt` attributes found in source files. The codebase uses `next/image` (`<Image>`) throughout which requires `alt` at the TypeScript level.
