# Prompt: Adaptive Quiz Engine Analysis

## Objective
Analyze the Adaptive Quiz Engine AI flow in the SANKALP platform. Examine its implementation, prompt design, input/output schema, and identify strengths, weaknesses, and improvement opportunities.

## Actions to Execute

1. **Review the flow implementation** at `src/ai/flows/adaptive-quiz-engine.ts`
   - Document the input schema fields and their types
   - Document the output schema fields and their types
   - Describe the LLM prompt template used

2. **Evaluate the prompt quality**
   - Is the prompt clear and specific?
   - Does it enforce the output format adequately?
   - Are there any ambiguities that could lead to inconsistent outputs?

3. **Identify edge cases and failure modes**
   - What happens when the LLM returns invalid JSON?
   - What topics or difficulty levels might produce poor results?
   - Are there any fallback mechanisms?

4. **Assess educational effectiveness**
   - Does the prompt produce educationally sound questions?
   - Is the difficulty differentiation adequate?
   - Are there missing fields (e.g., explanations for correct answers)?

5. **Recommend improvements**
   - Suggest prompt enhancements
   - Identify missing output fields
   - Propose validation strategies

## Expected Output
A comprehensive analysis report documenting all findings from the above actions.
