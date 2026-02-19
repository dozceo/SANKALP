# Prompt: Smart Revision Planner Analysis

## Objective
Analyze the Smart Revision Planner AI flow in the SANKALP platform. This is the most architecturally complex flow, combining ML predictions, the ADK decision engine, and LLM explanations. Examine the ML-LLM hybrid architecture, decision logic, and revision recommendation quality.

## Actions to Execute

1. **Review the flow implementation** at `src/ai/flows/smart-revision-planner.ts`
   - Document the input schema (brainMap JSON string, studentId)
   - Document the output schema (revisionList with topic, reason, priority, masteryScore)
   - Map the complete data flow: DB fetch → Feature extraction → ML prediction → ADK decision → LLM explanation

2. **Evaluate the ML-ADK-LLM hybrid architecture**
   - How does ML mastery prediction integrate with ADK decision rules?
   - What is the ADK decision engine's role vs. the LLM's role?
   - How are the three components (ML, ADK, LLM) decoupled?

3. **Assess caching and performance**
   - How does the batch prediction caching work?
   - What is the cache TTL and expiration strategy?
   - Are there race conditions in the async cache writes?

4. **Analyze the fallback mechanisms**
   - What happens when ML prediction fails?
   - What happens when the LLM explanation fails?
   - Is the 10-day fallback threshold appropriate?

5. **Evaluate revision prioritization logic**
   - How are HIGH/MEDIUM/LOW priorities assigned?
   - Does the sorting logic (priority + mastery) produce optimal results?
   - Is the 5-topic limit appropriate?

6. **Recommend improvements**
   - Suggest architecture enhancements
   - Identify performance optimization opportunities
   - Propose better fallback strategies

## Expected Output
A comprehensive analysis report covering ML integration, decision engine logic, LLM prompt quality, and overall system architecture.
