# Prompt: Chatbot Hallucination Detection

## Objective
Audit SANKALP's chatbot AI flows for factual accuracy. Run the hallucination detection script against pre-defined ground truth interactions and report any cases where the AI output contradicts or omits expected facts.

## Actions to Execute

1. **Run** `scripts/audit-chatbot-hallucinations.ts`
2. **For each test interaction**, report: context, AI output, expected fact, whether the fact is present, and pass/fail status
3. **Identify** any interactions where the AI contradicts known facts (hallucinations)
4. **Assess** the reliability of the current ground truth dataset — is it sufficient?
5. **Recommend** additional test cases that would increase hallucination coverage

## Expected Output
A hallucination detection report listing all test interactions, their pass/fail status, any confirmed hallucinations, and recommendations for expanding the test dataset.
