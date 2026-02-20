# Prompt: Custom Cognitive Chatbot Analysis

## Objective
Analyze the Custom Cognitive Chatbot AI flow in the SANKALP platform. This flow allows teachers to customize chatbot personality and instructions for concept explanation. Examine its implementation, customization capabilities, and potential risks.

## Actions to Execute

1. **Review the flow implementation** at `src/ai/flows/custom-cognitive-chatbot.ts`
   - Document all input schema fields (concept, brainMapContext, language, personality, customInstructions)
   - Document the output schema
   - Describe how teacher customizations are injected into the prompt

2. **Evaluate customization security**
   - Can teachers inject malicious instructions via the `customInstructions` field?
   - Is there prompt injection risk from user-supplied `personality` or `customInstructions`?
   - What validation is performed on teacher-supplied inputs?

3. **Assess Brain Map integration**
   - How is the `brainMapContext` used in the prompt?
   - Is context length a potential issue?
   - Does the prompt adequately leverage the brain map data?

4. **Compare with multilingual chatbot**
   - What are the key differences from `multilingual-cognitive-chatbot.ts`?
   - What features are unique to the custom chatbot?
   - Could the two flows be merged or unified?

5. **Recommend improvements**
   - Suggest input sanitization strategies
   - Identify prompt injection mitigations
   - Propose personality constraint mechanisms

## Expected Output
A comprehensive analysis report documenting all findings with emphasis on security and customization quality.
