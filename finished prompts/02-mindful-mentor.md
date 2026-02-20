# Prompt: Mindful Mentor Counseling System Analysis

## Objective
Analyze the Mindful Mentor AI flow in the SANKALP platform. This flow provides empathetic counseling and motivational support to students. Examine its implementation, prompt design, safety considerations, and effectiveness.

## Actions to Execute

1. **Review the flow implementation** at `src/ai/flows/mindful-mentor.ts`
   - Document the input schema fields and their types
   - Document the output schema fields and their types
   - Describe the multi-step prompt template used

2. **Evaluate the prompt design**
   - Does the prompt adequately guide sentiment analysis?
   - Are the five-step counseling instructions clear and comprehensive?
   - Is the tone guidance (conversational, warm, supportive) effective?

3. **Assess safety and ethical considerations**
   - Does the prompt handle crisis situations (self-harm, severe mental distress)?
   - Are there escalation paths for serious emotional concerns?
   - What safeguards exist against harmful advice?

4. **Evaluate educational and psychological effectiveness**
   - Does the prompt cover key student stress scenarios (exam anxiety, burnout, motivation)?
   - Is the Pomodoro technique and task-breaking advice appropriate?
   - Does the prompt balance empathy with actionable guidance?

5. **Recommend improvements**
   - Suggest safety guardrails
   - Identify missing emotional scenarios
   - Propose output schema enhancements (e.g., severity level, escalation flag)

## Expected Output
A comprehensive analysis report documenting all findings, with emphasis on safety and effectiveness.
