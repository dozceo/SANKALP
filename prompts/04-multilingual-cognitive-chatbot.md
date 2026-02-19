# Prompt: Multilingual Cognitive Chatbot Analysis

## Objective
Analyze the Multilingual Cognitive Chatbot AI flow in the SANKALP platform. This flow explains concepts to students in their target language using the Brain Map as context. Examine its multilingual capabilities, prompt design, and language coverage.

## Actions to Execute

1. **Review the flow implementation** at `src/ai/flows/multilingual-cognitive-chatbot.ts`
   - Document the input schema fields (concept, brainMapContext, language)
   - Document the output schema (explanation)
   - Describe the prompt template and its language handling approach

2. **Evaluate multilingual support**
   - Does the prompt adequately instruct the LLM to respond in the target language?
   - Are there language detection or validation mechanisms?
   - What languages are supported? Are there known limitations?

3. **Assess Brain Map context utilization**
   - How does the brainMapContext guide concept explanations?
   - Is there a risk of context overflow for large brain maps?
   - How is the relationship between concept and brain map context leveraged?

4. **Analyze output quality**
   - Does the prompt ensure culturally appropriate explanations?
   - Is there a mechanism for mathematical notation in different language contexts?
   - How does it handle concepts with no direct translation?

5. **Recommend improvements**
   - Suggest explicit language validation in the prompt
   - Identify cultural localization enhancements
   - Propose output schema additions (e.g., detected language, confidence)

## Expected Output
A comprehensive analysis report focusing on multilingual effectiveness and educational quality.
