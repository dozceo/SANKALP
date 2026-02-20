# Prompt: Chatbot Context Window Health Audit

## Objective
Evaluate SANKALP's AI chatbot flows for context window overflow risks and session continuity gaps. Simulate unbounded history growth to identify where token limits could be exceeded.

## Actions to Execute

1. **Run** `scripts/audit-chatbot-context.ts`
2. **Identify** which flows are stateless (no conversation history) and which maintain state
3. **Simulate** history growth at 10, 50, 100, and 500 turns — report estimated token counts and risk levels
4. **Find** any truncation logic in the flows — if absent, document the risk
5. **Assess** where session state is stored (localStorage, server DB) and its implications
6. **Recommend** a sliding-window history strategy with specific character/token limits

## Expected Output
A chatbot context window health report with overflow simulation results, missing truncation findings, and concrete implementation recommendations.
