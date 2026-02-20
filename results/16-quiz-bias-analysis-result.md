# Result: Quiz Generation Bias Analysis

**Prompt executed:** `prompts/16-quiz-bias-analysis.md`  
**Date:** 2026-02-20  
**Script run:** `scripts/analyze-quiz-bias.ts`  
**Report generated:** `BIAS_DETECTION_REPORT.md`  
**Data source:** `src/data/mock_quiz_generations.json`

---

## Action 1 + 2: Script executed — summary

- **Total quizzes analyzed:** 7
- **Total questions analyzed:** 21

---

## Action 3: Gender bias metrics

| Metric | Count |
|--------|-------|
| Male pronouns | 4 |
| Female pronouns | 4 |
| Ratio (M:F) | 4:4 (balanced) |

**Result:** Gender distribution is balanced across the sample.

---

## Action 4: Cultural bias metrics

| Metric | Count | Assessment |
|--------|-------|-----------|
| Western names | 15 | High |
| Non-Western names | 9 | Low |
| Western locations | 10 | High |
| Non-Western locations | 9 | Moderate |

**Result:** Western name ratio is 15:9 (1.67:1). This exceeds the 2:1 warning threshold, indicating a **MEDIUM cultural bias** toward Western naming conventions. Given that SANKALP is an Indian education platform, this is a significant issue.

---

## Action 5: Flagged questions

| Question | Bias type | Severity |
|----------|-----------|----------|
| "Who discovered America in 1492?" | Eurocentric perspective — ignores indigenous population | MEDIUM |
| "The Dark Ages refers to the period after the fall of Rome." | Eurocentric historical periodization | MEDIUM |
| "Christopher Columbus discovered America in 1492." | Eurocentric perspective | MEDIUM |
| "The Far East is known for its unique spices." | Eurocentric geographical term | MEDIUM |

**All 4 flagged questions are Medium severity Eurocentric framings.**

---

## Action 6: Reading level report

| Metric | Grade Level |
|--------|------------|
| Average Flesch-Kincaid | 5.31 |
| Minimum | -1.90 (very simple) |
| Maximum | 14.28 (college level) |

The wide spread (−1.90 to 14.28) suggests the LLM is not calibrating reading level to the target `educationLevel` field.

---

## Action 7: Prompt engineering improvements

**Add to the adaptive quiz prompt:**

```
Generate questions using culturally diverse names from various backgrounds 
(e.g., Priya, Wei, Fatima, Arjun, Sofia, Kofi) rather than defaulting to 
Western names. Avoid Eurocentric historical framing — use globally inclusive 
language (e.g., "Indigenous peoples were already present in the Americas 
before 1492" instead of "Columbus discovered America").

Ensure the reading level of questions matches the target educationLevel:
- High School: Grade 8-10 Flesch-Kincaid
- University: Grade 12-14 Flesch-Kincaid
- Primary: Grade 3-5 Flesch-Kincaid
```
