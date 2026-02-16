# Accessibility Violation Report

Generated on: 2/16/2026, 7:30:56 PM

Total Violations: 3

## aria-input-field-name (serious)
**Description**: Ensure every ARIA input field has an accessible name

**Help**: [ARIA input fields must have an accessible name](https://dequeuniversity.com/rules/axe/4.11/aria-input-field-name?application=playwright)

### Affected Elements:
- **Target**: `.border-primary`
  - **HTML**: `<span role="slider" aria-valuemin="0" aria-valuemax="100" aria-orientation="horizontal" data-orientation="horizontal" tabindex="0" class="block h-5 w-5 rounde..." style="" data-radix-collectio...="" aria-valuenow="50">`
  - **Failure**: Fix any of the following:
  aria-label attribute does not exist or is empty
  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
  Element has no title attribute

---

## button-name (critical)
**Description**: Ensure buttons have discernible text

**Help**: [Buttons must have discernible text](https://dequeuniversity.com/rules/axe/4.11/button-name?application=playwright)

### Affected Elements:
- **Target**: `.focus\:outline-none`
  - **HTML**: `<button type="button" role="combobox" aria-controls="radix-_R_2h5esndlb_" aria-expanded="false" aria-autocomplete="none" dir="ltr" data-state="closed" data-placeholder="" class="flex h-10 items-cent...">`
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
- **Target**: `.text-primary-foreground.hover\:bg-primary\/90.bg-primary:nth-child(1)`
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

- **Target**: `.w-10 > span`
  - **HTML**: `<span>Icon</span>`
  - **Failure**: Fix any of the following:
  Element has insufficient color contrast of 4.35 (foreground color: #f8fafc, background color: #347ab7, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1

- **Target**: `#radix-_R_2n5esndlb_-trigger-password`
  - **HTML**: `<button type="button" role="tab" aria-selected="false" aria-controls="radix-_R_2n5esndlb_-..." data-state="inactive" id="radix-_R_2n5esndlb_-..." class="inline-flex items-ce..." tabindex="-1" data-orientation="horizontal" data-radix-collectio...="">`
  - **Failure**: Fix any of the following:
  Element has insufficient color contrast of 4.34 (foreground color: #64748b, background color: #f1f5f9, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1

---
