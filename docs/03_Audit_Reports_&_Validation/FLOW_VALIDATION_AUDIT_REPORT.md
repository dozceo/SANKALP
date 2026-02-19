# Genkit Flow Input Schema Validation Audit

**Domain:** Engineering Core
**Scope:** src/ai/flows/
**Method:** Static Analysis (Regex/AST simulation)
**Date:** 2026-02-15

## Executive Summary
This report identifies potential security risks in Genkit flows, specifically focusing on input validation gaps (unbounded strings) and prompt injection vulnerabilities (unsafe variable interpolation).

## Detailed Findings

| Flow File | Input Schema Validation Status | Prompt Construction Risk | Verdict |
| :--- | :--- | :--- | :--- |
| `adaptive-quiz-engine.ts` | ⚠️ **Weak** (Unbounded strings detected) | ✅ **Safe** | WARNING |
| `custom-cognitive-chatbot.ts` | ⚠️ **Weak** (Unbounded strings detected) | 🟠 **Medium** (Triple Brace Unescaped) | WARNING |
| `mindful-mentor.ts` | ⚠️ **Weak** (Unbounded strings detected) | 🟠 **Medium** (Triple Brace Unescaped) | WARNING |
| `multilingual-cognitive-chatbot.ts` | ⚠️ **Weak** (Unbounded strings detected) | 🟠 **Medium** (Triple Brace Unescaped) | WARNING |
| `smart-revision-planner.ts` | ⚠️ **Weak** (Unbounded strings detected) | 🟠 **Medium** (Triple Brace Unescaped) | WARNING |
| `speech-to-speech.ts` | ⚠️ **Weak** (Unbounded strings detected) | 🔴 **High** (Direct Template Literal Injection) | FAIL |
| `syllabus-generator.ts` | ⚠️ **Weak** (Unbounded strings detected) | 🟠 **Medium** (Triple Brace Unescaped) | WARNING |
| `text-to-speech.ts` | ⚠️ **Weak** (Unbounded strings detected) | ✅ **Safe** | WARNING |

## Vulnerability Details

### 1. Unbounded String Inputs
**Risk:** Denial of Service (DoS), Token Exhaustion, Cost Spikes.
**Finding:** Most flows use `z.string()` without `.max()` or `.min()` constraints. Malicious actors could send extremely large inputs.
**Recommendation:** Enforce `.max(N)` on all string inputs.

### 2. Unsafe Prompt Construction
**Risk:** Prompt Injection.
**Finding:**
- **High Risk:** Direct interpolation of user input into template literals (e.g., `${userInput}`) allows bypassing all prompt structure.
- **Medium Risk:** Use of triple braces `{{{var}}}` prevents HTML escaping. While sometimes necessary for formatted text, it increases injection risk if input is not sanitized.
**Recommendation:**
- Avoid template literals for prompts; use Genkit's variable substitution (double braces `{{var}}`).
- Sanitize inputs before passing to LLM if using triple braces.
- Use strict Zod schemas to reject injection patterns.

## Conclusion
The audit reveals that while basic schema validation exists, it lacks strict constraints. Several flows exhibit medium-to-high risk patterns in prompt construction, particularly regarding direct string interpolation.
