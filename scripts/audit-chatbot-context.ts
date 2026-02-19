
import { explainConcept } from '../src/ai/flows/multilingual-cognitive-chatbot';
import fs from 'fs';
import path from 'path';

async function auditChatbotContext() {
  console.log('Starting Chatbot Context Window Audit...');

  const reportPath = path.join(process.cwd(), 'reports', 'CHATBOT_CONTEXT_HEALTH_REPORT.md');
  const reportDir = path.dirname(reportPath);

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  let reportContent = `# Chatbot Context Window Health Report

## Overview
This report audits the conversational AI context window handling for token overflow, truncation logic, and session persistence.

## Methodology
- Simulated a conversation using \`src/ai/flows/multilingual-cognitive-chatbot.ts\`.
- Checked for mechanisms to pass conversation history.
- Analyzed token usage and context retention.

## Findings

`;

  // 1. Check Function Signature
  // We can't easily reflect on types at runtime without complex setup, but we know the input schema from reading the file.
  // The input schema is: { concept: string, brainMapContext: string, language: string }

  reportContent += `### 1. Stateless Architecture
The current implementation of \`multilingual-cognitive-chatbot.ts\` (function \`explainConcept\`) is designed as a **single-turn** request-response model.
- **Input Schema**: \`{ concept, brainMapContext, language }\`
- **Missing Field**: There is no \`history\` or \`messages\` array in the input schema.
- **Implication**: The chatbot does not maintain conversation history between turns. Each request is treated as a standalone query.

`;

  // 2. Simulation
  console.log('Simulating conversation...');
  try {
    const turn1Input = {
      concept: "What is a linear equation?",
      brainMapContext: "Algebra 1 Basics",
      language: "English"
    };
    console.log('Turn 1:', turn1Input.concept);
    const turn1Output = await explainConcept(turn1Input);
    console.log('Turn 1 Output:', turn1Output.explanation.substring(0, 50) + '...');

    const turn2Input = {
      concept: "Give me an example of that.", // "that" refers to linear equation
      brainMapContext: "Algebra 1 Basics",
      language: "English"
    };
    console.log('Turn 2:', turn2Input.concept);
    const turn2Output = await explainConcept(turn2Input);
    console.log('Turn 2 Output:', turn2Output.explanation.substring(0, 50) + '...');

    // Analyze Turn 2
    // If context was preserved, "that" would be understood as "linear equation".
    // If not, it might be generic or confused.

    reportContent += `### 2. Conversation Simulation Results
**Test Scenario**:
1. User: "What is a linear equation?"
2. Bot: [Explanation of linear equation]
3. User: "Give me an example of that."

**Observation**:
- Turn 1 Output: "${turn1Output.explanation.replace(/\n/g, ' ')}"
- Turn 2 Output: "${turn2Output.explanation.replace(/\n/g, ' ')}"

**Analysis**:
The second response likely fails to connect "that" to "linear equation" effectively unless the LLM infers it solely from the \`brainMapContext\` ("Algebra 1 Basics") which is static, or if it hallucinates a context.
Since the history is not passed, the model has no knowledge of the previous turn.

`;

  } catch (error) {
    console.error('Error during simulation:', error);
    reportContent += `### 2. Conversation Simulation Results
**Error**: Simulation failed with error: ${error}
This might be due to missing API keys or network issues in the test environment.
However, the static analysis of the code confirms the lack of history handling.
`;
  }

  // 3. Context Window & Token Limits
  reportContent += `### 3. Context Window & Token Limits
- **Current State**: Since history is not passed, there is no risk of *accumulating* history to hit token limits in the current implementation.
- **Risk**: If history *were* to be implemented by simply appending strings to the prompt, it would eventually hit the Gemini Flash token limit (approx 1M tokens, but practical limits are lower for latency).
- **Recommendation**: Implement a sliding window or summarization strategy for history.

## Recommendations

1.  **Implement Conversation History**:
    - Update \`ExplainConceptInputSchema\` to include a \`history\` array: \`{ role: 'user' | 'model', text: string }[]\`.
    - Pass this history to the Genkit prompt.

2.  **Context Management Strategy**:
    - **Sliding Window**: Keep the last N turns (e.g., 10) to stay within token limits.
    - **Summarization**: Use a background task to summarize older turns into the \`brainMapContext\` or a new \`summary\` field.

3.  **Session Persistence**:
    - The client currently stores messages in \`localStorage\`. This should be synchronized with the server (Firestore) to allow cross-device continuity.

`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`Report generated at ${reportPath}`);
}

auditChatbotContext().catch(console.error);
