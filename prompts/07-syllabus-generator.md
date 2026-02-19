# Prompt: Syllabus Generator Analysis

## Objective
Analyze the Syllabus Generator AI flow in the SANKALP platform. This flow generates structured academic syllabi with topics, study strategies, and reference links. Examine its prompt effectiveness, output quality, and the reliability of AI-generated reference URLs.

## Actions to Execute

1. **Review the flow implementation** at `src/ai/flows/syllabus-generator.ts`
   - Document the input schema (query string)
   - Document the output schema (title, structure, strategy, references, isFallback)
   - Describe the multi-task prompt template

2. **Evaluate the prompt design**
   - Does the prompt adequately guide structured syllabus generation?
   - Is the requirement for "AT LEAST FIVE (5)" reference links achievable?
   - Are the four tasks (identify, breakdown, strategy, references) clearly separated?

3. **Assess reference link reliability**
   - AI models frequently hallucinate URLs — how is this handled?
   - Is there any URL validation in the flow?
   - What is the `isFallback` flag intended to signal?

4. **Analyze output structure quality**
   - Does the `structure` field use consistent markdown formatting?
   - Is the `strategy` field actionable and timeline-based?
   - Are the reference links constrained to trusted domains?

5. **Evaluate coverage for Indian education context**
   - Does the flow handle Indian curricula (CBSE, ICSE, NEET, JEE, UPSC)?
   - Are there specific exam board URLs that should be hardcoded?
   - How does it handle queries in Hindi or regional languages?

6. **Recommend improvements**
   - Suggest URL validation mechanisms
   - Identify prompt enhancements for Indian exam context
   - Propose output schema additions (e.g., exam board, difficulty level)

## Expected Output
A comprehensive analysis report covering prompt quality, URL reliability risks, Indian education context, and actionable improvements.
