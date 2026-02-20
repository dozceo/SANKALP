# Result: Chatbot Hallucination Detection

**Prompt executed:** `prompts/19-chatbot-hallucination-detection.md`  
**Date:** 2026-02-20  
**Script run:** `scripts/audit-chatbot-hallucinations.ts`  
**Report generated:** `HALLUCINATION_DETECTION_REPORT.md`

---

## Action 1 + 2: Script executed — all test interactions

| # | Topic | Output excerpt | Expected fact | Fact present | Status |
|---|-------|---------------|---------------|-------------|--------|
| 1 | Photosynthesis | "...use sunlight to synthesize foods from carbon dioxide and water..." | "sunlight" | Yes | PASS |
| 2 | French Revolution | "...Estates General of 1789 and ended with...French Consulate in November 1799" | "1789" | Yes | PASS |
| 3 | Moon Landing | "July 20, 1969, by the Apollo 11 mission. Neil Armstrong was the first..." | "1969" | Yes | PASS |
| 4 | Water Molecule | "A water molecule is composed of two hydrogen atoms and one oxygen atom" | "two hydrogen" | Yes | PASS |
| 5 | Great Wall of China | "The Great Wall of China was built solely during the Ming Dynasty and is **visible from the moon**..." | "not visible" | No | **HALLUCINATION DETECTED** |
| 6 | Pythagorean Theorem | "a^2 + b^2 = **c^3**" | "c^2" | No | **HALLUCINATION DETECTED** |

---

## Action 3: Confirmed hallucinations

**Interaction 5 — Great Wall of China:**
- The claim "visible from the moon with the naked eye" is a widely-known myth. NASA has confirmed it is not visible from the moon.
- The AI output contradicts the expected fact "not visible" — this is a **factual hallucination**.

**Interaction 6 — Pythagorean Theorem:**
- The formula `a^2 + b^2 = c^3` is mathematically incorrect. The correct formula is `a^2 + b^2 = c^2`.
- This is a **mathematical error** that could mislead students.

---

## Action 4: Summary statistics

| Metric | Value |
|--------|-------|
| Total interactions audited | 6 |
| Passes | 4 |
| Hallucinations detected | 2 |
| Detection accuracy | 100% (system correctly flagged both) |

---

## Action 5: Ground truth dataset assessment

The current dataset has 6 interactions covering 5 subjects. This is **insufficient** for a production educational system. Recommended expansions:

| New test case | Why important |
|---------------|--------------|
| Indian history (Mughal Empire, Independence) | Platform serves Indian students; biases likely here |
| Mathematics (calculus, algebra) | High hallucination risk for formula-based answers |
| Biology (NEET topics: cell division, DNA) | Critical for Indian competitive exam prep |
| Chemistry (NEET: reactions, periodic table) | Formula-heavy — high error risk |
| Physics (JEE: laws of motion, electromagnetism) | Multi-step reasoning required |

**Recommendation:** Expand ground truth dataset to at least 50 test cases covering all major CBSE/NEET/JEE topic areas, with 10 intentional wrong outputs to verify detection recall.
