# Third-Party Embed Security & Privacy Audit

**Generated:** 2026-02-19T19:11:13.894Z

## Executive Summary
This report enumerates all detected third-party embeds (scripts, iframes) and external resource references in the codebase.
It also checks for Content Security Policy (CSP) configuration.

## CSP Configuration Check
- ⚠️ **No explicit Content Security Policy (CSP) detected** in `next.config.ts`. This is a security risk.
  - Recommendation: Implement a strict CSP using `next.config.js` headers or middleware.

## Findings

### EXTERNAL_URL Usage (22)
| File | Line | Content |
|------|------|---------|
| `src/ai/flows/schema-regression.test.ts` | 83 | `https://example.com/1` |
| `src/ai/flows/schema-regression.test.ts` | 84 | `https://example.com/2` |
| `src/ai/flows/schema-regression.test.ts` | 85 | `https://example.com/3` |
| `src/ai/flows/schema-regression.test.ts` | 86 | `https://example.com/4` |
| `src/ai/flows/schema-regression.test.ts` | 87 | `https://example.com/5` |
| `src/app/(auth)/login/page.tsx` | 152 | `http://www.w3.org/2000/svg` |
| `src/components/planner/AddStudyMaterial.tsx` | 194 | `https://example.com` |
| `src/lib/syllabus-fallback.ts` | 30 | `https://www.khanacademy.org/math` |
| `src/lib/syllabus-fallback.ts` | 31 | `https://en.wikipedia.org/wiki/Mathematics` |
| `src/lib/syllabus-fallback.ts` | 32 | `https://www.wolframalpha.com/` |
| `src/lib/syllabus-fallback.ts` | 33 | `https://brilliant.org/` |
| `src/lib/syllabus-fallback.ts` | 34 | `https://www.mathway.com/` |
| `src/lib/syllabus-fallback.ts` | 53 | `https://www.nature.com/scitable` |
| `src/lib/syllabus-fallback.ts` | 54 | `https://www.khanacademy.org/science/biology` |
| `src/lib/syllabus-fallback.ts` | 55 | `https://en.wikipedia.org/wiki/Biology` |
| `src/lib/syllabus-fallback.ts` | 56 | `https://www.biologysimulations.com/` |
| `src/lib/syllabus-fallback.ts` | 57 | `https://www.biointeractive.org/` |
| `src/lib/syllabus-fallback.ts` | 72 | `https://en.wikipedia.org/wiki/Main_Page` |
| `src/lib/syllabus-fallback.ts` | 73 | `https://www.khanacademy.org/` |
| `src/lib/syllabus-fallback.ts` | 74 | `https://www.coursera.org/` |
| `src/lib/syllabus-fallback.ts` | 75 | `https://www.edx.org/` |
| `src/lib/syllabus-fallback.ts` | 76 | `https://ocw.mit.edu/` |

## Privacy & Security Implications
- **External Scripts:** Can execute arbitrary code, track users, and exfiltrate data. Ensure all are trusted and necessary.
- **Iframes:** Can introduce clickjacking risks or leak data via URL parameters. Use `sandbox` attributes.
- **External URLs:** Images/Media from third parties can leak IP addresses and usage patterns.
