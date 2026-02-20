
import fs from 'fs';
import path from 'path';

// --- Configuration & Constants ---

// Pricing (Gemini 1.5 Flash - illustrative)
// Prices are per 1 Million Tokens
const PRICE_INPUT_PER_1M = 0.075;
const PRICE_OUTPUT_PER_1M = 0.30;

// Usage Assumptions (Monthly per Active User)
const USAGE_PROFILE = {
  adaptiveQuiz: 10,       // 10 quizzes/month
  syllabus: 2,            // 2 syllabi/month
  revisionPlanner: 30,    // Daily usage
  chatbot: 50,            // 50 interactions/month
  mindfulMentor: 5,       // 5 interactions/month
  speechToSpeech: 10,     // 10 voice interactions/month
};

// Flow Definitions & Estimates
// Based on analysis of src/ai/flows/*.ts
const FLOWS = [
  {
    name: 'Adaptive Quiz',
    file: 'src/ai/flows/adaptive-quiz-engine.ts',
    inputTokens: 200, // Template + topic + params
    outputTokens: 600, // JSON array of 10 questions (~60 tokens/question)
    monthlyFrequency: USAGE_PROFILE.adaptiveQuiz,
    description: 'Generates a 10-question quiz in JSON format based on a topic.',
  },
  {
    name: 'Syllabus Generator',
    file: 'src/ai/flows/syllabus-generator.ts',
    inputTokens: 300, // Template + detailed query
    outputTokens: 1200, // Structured syllabus with sections, strategy, references
    monthlyFrequency: USAGE_PROFILE.syllabus,
    description: 'Generates a comprehensive study syllabus with structure and strategy.',
  },
  {
    name: 'Smart Revision Planner',
    file: 'src/ai/flows/smart-revision-planner.ts',
    inputTokens: 500, // Template + list of 5 topics with metadata
    outputTokens: 250, // 5 explanations (~50 tokens each)
    monthlyFrequency: USAGE_PROFILE.revisionPlanner,
    description: 'Generates motivational explanations for daily revision topics.',
  },
  {
    name: 'Cognitive Chatbot (Custom & Multilingual)',
    file: 'src/ai/flows/custom-cognitive-chatbot.ts',
    inputTokens: 800, // Template + heavy context (Brain Map, History) + Query
    outputTokens: 400, // Detailed explanation
    monthlyFrequency: USAGE_PROFILE.chatbot,
    description: 'Interactive chat explanations with context awareness.',
  },
  {
    name: 'Mindful Mentor',
    file: 'src/ai/flows/mindful-mentor.ts',
    inputTokens: 600, // Template + student concern + recent history
    outputTokens: 350, // Empathetic advice
    monthlyFrequency: USAGE_PROFILE.mindfulMentor,
    description: 'Provides emotional support and actionable advice.',
  },
  {
    name: 'Speech-to-Speech (LLM Only)',
    file: 'src/ai/flows/speech-to-speech.ts',
    inputTokens: 150, // "You are CognitoBot..." + transcribed query
    outputTokens: 150, // Concise spoken response
    monthlyFrequency: USAGE_PROFILE.speechToSpeech,
    description: 'Text generation step for voice interactions (excluding Audio STT/TTS costs).',
  },
];

// --- Calculation Logic ---

function calculateCost(tokens: number, pricePer1M: number): number {
  return (tokens / 1_000_000) * pricePer1M;
}

function generateReport() {
  let report = `# LLM Token Usage Cost Projection

**Generated on:** ${new Date().toISOString().split('T')[0]}
**Scope:** \`src/ai/flows/\` (Genkit LLM calls)
**Model Basis:** Gemini 1.5 Flash
**Pricing Assumptions:**
- Input: $${PRICE_INPUT_PER_1M.toFixed(4)} / 1M tokens
- Output: $${PRICE_OUTPUT_PER_1M.toFixed(4)} / 1M tokens

---

## 1. Per-Feature Token Analysis

Estimates based on prompt templates and typical usage patterns.

| Feature | Input Tokens | Output Tokens | Total Tokens | Est. Cost / Call |
| :--- | :---: | :---: | :---: | :---: |
`;

  FLOWS.forEach(flow => {
    const totalTokens = flow.inputTokens + flow.outputTokens;
    const cost = calculateCost(flow.inputTokens, PRICE_INPUT_PER_1M) +
                 calculateCost(flow.outputTokens, PRICE_OUTPUT_PER_1M);

    report += `| **${flow.name}** | ${flow.inputTokens} | ${flow.outputTokens} | ${totalTokens} | $${cost.toFixed(6)} |\n`;
  });

  report += `

---

## 2. Monthly Usage Profile (Active Student)

Assumed frequency of feature usage per active student per month.

| Feature | Monthly Frequency | Total Monthly Tokens | Monthly Cost / User |
| :--- | :---: | :---: | :---: |
`;

  let totalMonthlyCostPerUser = 0;
  let totalMonthlyTokensPerUser = 0;

  FLOWS.forEach(flow => {
    const monthlyTokens = (flow.inputTokens + flow.outputTokens) * flow.monthlyFrequency;
    const costPerCall = calculateCost(flow.inputTokens, PRICE_INPUT_PER_1M) +
                        calculateCost(flow.outputTokens, PRICE_OUTPUT_PER_1M);
    const monthlyCost = costPerCall * flow.monthlyFrequency;

    totalMonthlyCostPerUser += monthlyCost;
    totalMonthlyTokensPerUser += monthlyTokens;

    report += `| ${flow.name} | ${flow.monthlyFrequency} | ${monthlyTokens.toLocaleString()} | $${monthlyCost.toFixed(4)} |\n`;
  });

  report += `| **TOTAL** | - | **${totalMonthlyTokensPerUser.toLocaleString()}** | **$${totalMonthlyCostPerUser.toFixed(4)}** |

---

## 3. Cost Projection by Scale

Projected monthly infrastructure costs at different user scales.

| Scale (Active Users) | Monthly Token Volume | Monthly Cost | Yearly Run Rate |
| :--- | :---: | :---: | :---: |
`;

  const scales = [100, 1000, 10000, 100000];

  scales.forEach(users => {
    const totalTokens = totalMonthlyTokensPerUser * users;
    const totalCost = totalMonthlyCostPerUser * users;
    const yearlyCost = totalCost * 12;

    report += `| **${users.toLocaleString()}** | ${totalTokens.toLocaleString()} | **$${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}** | $${yearlyCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} |\n`;
  });

  report += `

## 4. Recommendations for Cost Control

1.  **Cache Heavy Responses:** Implement caching for immutable generations like Syllabi (already partly implemented).
2.  **Optimize System Prompts:** Reduce verbose instructions in frequent flows like *Smart Revision Planner*.
3.  **Tiered Usage:** Limit expensive features (e.g., unlimited Chatbot) to premium tiers.
4.  **Token Budgeting:** Implement per-user daily token quotas to prevent abuse.
5.  **Model Distillation:** Fine-tune smaller models for specific high-volume tasks (e.g., Quiz Generation) to reduce latency and potentially cost (though Flash is already very cheap).

`;

  // Write Report to File
  const outputPath = path.join(process.cwd(), 'LLM_TOKEN_USAGE_COST_PROJECTION.md');
  fs.writeFileSync(outputPath, report);
  console.log(`Report generated at: ${outputPath}`);
}

generateReport();
