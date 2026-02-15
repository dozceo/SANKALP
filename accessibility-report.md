# Accessibility Violation Report

Generated on: 2/15/2026, 7:09:29 PM

Total Violations: 2

## button-name (critical)
**Description**: Ensure buttons have discernible text

**Help**: [Buttons must have discernible text](https://dequeuniversity.com/rules/axe/4.11/button-name?application=playwright)

### Affected Elements:
- **Target**: `#no-label`
  - **HTML**: `<button type="button" role="checkbox" aria-checked="false" data-state="unchecked" value="on" class="peer h-4 w-4 shrink-..." id="no-label">`
  - **Failure**: Fix any of the following:
  Element does not have inner text that is visible to screen readers
  aria-label attribute does not exist or is empty
  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
  Element has no title attribute
  Element does not have an implicit (wrapped) <label>
  Element does not have an explicit <label>
  Element's default semantics were not overridden with role="none" or role="presentation"

---

## color-contrast (serious)
**Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds

**Help**: [Elements must meet minimum color contrast ratio thresholds](https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=playwright)

### Affected Elements:
- **Target**: `.bg-primary.text-primary-foreground.hover\:bg-primary\/90:nth-child(1)`
  - **HTML**: `<button class="inline-flex items-ce...">`
  - **Failure**: Fix any of the following:
  Element has insufficient color contrast of 4.35 (foreground color: #f8fafc, background color: #347ab7, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1

- **Target**: `.bg-destructive`
  - **HTML**: `<button class="inline-flex items-ce...">`
  - **Failure**: Fix any of the following:
  Element has insufficient color contrast of 3.59 (foreground color: #f8fafc, background color: #ef4444, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1

- **Target**: `.text-primary`
  - **HTML**: `<button class="inline-flex items-ce...">`
  - **Failure**: Fix any of the following:
  Element has insufficient color contrast of 4.15 (foreground color: #347ab7, background color: #f2f5f8, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1

- **Target**: `span`
  - **HTML**: `<span>Icon</span>`
  - **Failure**: Fix any of the following:
  Element has insufficient color contrast of 4.35 (foreground color: #f8fafc, background color: #347ab7, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1

---
