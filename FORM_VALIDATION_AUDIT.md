# Form Validation Error Message Clarity Audit

**Domain**: Design & UX
**Scope**: `src/app/(auth)/`
**Date**: 2024-05-22

## Overview
This audit evaluates the clarity, actionability, and user-friendliness of form validation error messages within the authentication and onboarding flows. The original prompt suggested an audit of "form components (react-hook-form + zod)", but investigation reveals that the authentication forms currently rely on manual state management and HTML5 validation, with error messages primarily sourced from backend responses (Firebase/API) or hardcoded `toast` notifications.

## Findings

1.  **No Client-Side Schema Validation**: The forms in `src/app/(auth)/` do not use `zod` or `react-hook-form`. Validation is either implicit (HTML `required` attribute) or manual (checking state in `handleSubmit`).
2.  **Reliance on Backend Messages**: Most error messages are passed directly from `error.message` (e.g., from Firebase Auth), which can be technical (e.g., "auth/weak-password").
3.  **Inconsistent Feedback**: Some forms use `toast` notifications for errors, while others disable buttons based on state (`canProceed()`).
4.  **Good Practice**: The onboarding flows (`onboarding/page.tsx`, `teacher-onboarding/page.tsx`) use `generateFriendlyErrorMessage` to attempt to humanize errors, which is a positive step.

## detailed Audit & Recommendations

### 1. Sign Up (`src/app/(auth)/sign-up/page.tsx`)

| Trigger Condition | Current Message (Source) | Issue | Recommended Rewrite |
| :--- | :--- | :--- | :--- |
| Form Submit Error | `error.message` (Dynamic) | Technical jargon possible (e.g., "auth/email-already-in-use"). | Map specific codes to: "This email is already registered. Try signing in instead." |
| Default Catch | "Could not create account" | Vague. | "We couldn't create your account. Please check your details and try again." |
| HTML5 Validation | Browser Default (e.g., "Please fill out this field") | Generic. | Use Zod to show inline: "Please enter your full name." |

### 2. Login (`src/app/(auth)/login/page.tsx`)

| Trigger Condition | Current Message (Source) | Issue | Recommended Rewrite |
| :--- | :--- | :--- | :--- |
| Form Submit Error | `error.message` or "Invalid email or password" | "Invalid email or password" is decent but could be friendlier. | "We couldn't find an account with those details. Please check your email and password." |
| Google Sign In | `error.message` | Technical. | "We couldn't sign you in with Google. Please try again." |

### 3. Join Class (`src/app/(auth)/join-class/page.tsx`)

| Trigger Condition | Current Message (Source) | Issue | Recommended Rewrite |
| :--- | :--- | :--- | :--- |
| User not logged in | "Not authenticated", "Please sign in first" | Technical. | "You need to be signed in to join a class." |
| API Error | `data.error` or "Failed to join class" | "Failed to join class" is generic. | "We couldn't find a class with that code. Please double-check it." |
| Invalid Code Length | (Button Disabled) | No feedback on *why* it's disabled until 6 chars. | Show inline hint: "Class code must be exactly 6 characters." |

### 4. Onboarding (`src/app/(auth)/onboarding/page.tsx`)

| Trigger Condition | Current Message (Source) | Issue | Recommended Rewrite |
| :--- | :--- | :--- | :--- |
| API Error | "Failed to complete onboarding. Please try again." | Generic. | "Something went wrong while saving your profile. Please try again." |
| Catch Block | `generateFriendlyErrorMessage` | Good, but relies on AI/Mapping. | Ensure fallback is: "We encountered an issue. Please refresh and try again." |
| Step Navigation | (Button Disabled) | User doesn't know *what* is missing to proceed. | Show toast/inline error: "Please select at least one subject to continue." |

### 5. Teacher Onboarding (`src/app/(auth)/teacher-onboarding/page.tsx`)

| Trigger Condition | Current Message (Source) | Issue | Recommended Rewrite |
| :--- | :--- | :--- | :--- |
| API Error | "Failed to complete onboarding. Please try again." | Generic. | "We couldn't save your teacher profile. Please try again." |
| Step Navigation | (Button Disabled) | No feedback. | Show toast/inline error: "Please enter your school name." |

## Strategic Recommendations

1.  **Adopt Zod & React Hook Form**:
    *   Migrate `(auth)` forms to use `react-hook-form` and `zod` (already used in `teacher/classes`).
    *   This allows defining custom, plain-language error messages in the schema itself (e.g., `z.string().min(6, "Password must be at least 6 characters")`).
    *   It enables inline error display, which is superior to `toast` notifications for form field validation.

2.  **Standardize Error Mapping**:
    *   Create a utility (or enhance `generateFriendlyErrorMessage`) to map Firebase Auth error codes (`auth/user-not-found`, `auth/wrong-password`) to the recommended rewrites centrally.

3.  **UX Improvement for Disabled States**:
    *   Instead of just disabling the "Next" button, consider keeping it enabled but showing a validation error when clicked if the step is incomplete. This guides the user to the missing field.
