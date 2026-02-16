# Hallucination Detection Report

**Date:** 2026-02-16T19:19:01.101Z

## Methodology
The audit checks chatbot outputs against a set of expected key facts (Ground Truth).
- **Pass:** Output contains the expected fact.
- **Fail (Potential Hallucination):** Output misses the expected fact or contains contradictory information.

## Findings

### Interaction 1: Photosynthesis
- **Context:** Biology: Plant processes
- **Output:** "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods from carbon dioxide and water. It generally involves the green pigment chlorophyll and generates oxygen as a byproduct."
- **Expected Fact (Truth):** "sunlight"
- **Type:** FACTUAL
- **Is Fact Present?** true
- **Status:** **PASS**
- **Detail:** Correctly verified factual content.

### Interaction 2: French Revolution
- **Context:** History: European History
- **Output:** "The French Revolution was a period of radical political and societal change in France that began with the Estates General of 1789 and ended with the formation of the French Consulate in November 1799."
- **Expected Fact (Truth):** "1789"
- **Type:** FACTUAL
- **Is Fact Present?** true
- **Status:** **PASS**
- **Detail:** Correctly verified factual content.

### Interaction 3: Moon Landing
- **Context:** History: Space Race
- **Output:** "The first manned moon landing took place on July 20, 1969, by the Apollo 11 mission. Neil Armstrong was the first person to walk on the moon."
- **Expected Fact (Truth):** "1969"
- **Type:** FACTUAL
- **Is Fact Present?** true
- **Status:** **PASS**
- **Detail:** Correctly verified factual content.

### Interaction 4: Water Molecule
- **Context:** Chemistry: Molecules
- **Output:** "A water molecule is composed of two hydrogen atoms and one oxygen atom."
- **Expected Fact (Truth):** "two hydrogen"
- **Type:** FACTUAL
- **Is Fact Present?** true
- **Status:** **PASS**
- **Detail:** Correctly verified factual content.

### Interaction 5: Great Wall of China
- **Context:** History: China
- **Output:** "The Great Wall of China was built solely during the Ming Dynasty and is visible from the moon with the naked eye."
- **Expected Fact (Truth):** "not visible"
- **Type:** HALLUCINATION
- **Is Fact Present?** false
- **Status:** **DETECTED**
- **Detail:** System correctly flagged potential hallucination (missing/wrong fact).

### Interaction 6: Pythagorean Theorem
- **Context:** Math: Geometry
- **Output:** "The Pythagorean theorem states that a^2 + b^2 = c^3."
- **Expected Fact (Truth):** "c^2"
- **Type:** HALLUCINATION
- **Is Fact Present?** false
- **Status:** **DETECTED**
- **Detail:** System correctly flagged potential hallucination (missing/wrong fact).


## Summary
- **Total Interactions Audited:** 6
- **Successful Validations (True Positives + True Negatives):** 6
- **Failed Validations:** 0
- **Detection Accuracy:** 100%
