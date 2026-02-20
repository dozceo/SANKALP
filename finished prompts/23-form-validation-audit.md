# Prompt: Form Validation Error Message Clarity Audit

## Objective
Audit every form in SANKALP for the clarity and user-friendliness of its validation error messages. Test each field schema with invalid inputs and score the resulting error messages on a 1–5 scale.

## Actions to Execute

1. **Run** `scripts/audit-form-errors.ts`
2. **For each form schema** (Sign Up, Login, Join Class, etc.), test every field with: empty string, too-short string, invalid format
3. **Report** the Zod validation error message produced for each test
4. **Score** each message 1–5 for clarity (1 = technical/confusing, 5 = user-friendly)
5. **Flag** any messages scoring 1–3 as needing improvement
6. **Provide** improved alternative messages for any flagged errors

## Expected Output
A form validation audit table showing schema, field, test input, current error message, clarity score, and recommended improvement for every tested field.
