
import fs from 'fs';
import path from 'path';

// Cost Constants (Gemini 1.5/2.0 Flash)
const COST_INPUT_PER_1M = 0.075;
const COST_OUTPUT_PER_1M = 0.30;
const COST_STT_PER_MIN = 0.006;
const COST_TTS_PER_1M_CHARS = 15.00;

// Usage Assumptions (Monthly per 1k Users)
const USAGE_PER_USER_DAILY = {
  default: 1,
  'adaptive-quiz-engine': 2,
  'custom-cognitive-chatbot': 10,
  'mindful-mentor': 5,
  'multilingual-cognitive-chatbot': 5,
  'smart-revision-planner': 1,
  'speech-to-speech': 1,
  'syllabus-generator': 0.1,
  'text-to-speech': 2,
};

const FLOWS_DIR = path.join(process.cwd(), 'src/ai/flows');

interface FlowAnalysis {
  name: string;
  inputTokens: number;
  outputTokens: number;
  audioCost: number;
  totalCostPerCall: number;
  monthlyCost1kUsers: number;
}

function estimateTokens(text: string): number {
  // Simple heuristic: 1 word ~ 1.3 tokens
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words * 1.3);
}

function analyzeFlow(filename: string): FlowAnalysis | null {
  const content = fs.readFileSync(path.join(FLOWS_DIR, filename), 'utf-8');
  const name = filename.replace('.ts', '');

  // 1. Extract Prompt
  // Look for ai.definePrompt({ ... prompt: `...` })
  const promptMatch = content.match(/prompt:\s*`([\s\S]*?)`/);
  let promptText = '';
  if (promptMatch) {
    promptText = promptMatch[1];
  } else {
    // Fallback: look for prompt: "..."
    const promptMatchDouble = content.match(/prompt:\s*"([\s\S]*?)"/);
    if (promptMatchDouble) {
      promptText = promptMatchDouble[1];
    }
  }

  // Add estimation for input schema (zod descriptions)
  // Heuristic: count lines with "z." in them
  const schemaLines = content.split('\n').filter(line => line.includes('z.') && line.includes('describe(')).length;
  const schemaTokens = schemaLines * 20; // Approx 20 tokens per described field

  const inputTokens = estimateTokens(promptText) + schemaTokens + 100; // +100 for system overhead

  // 2. Estimate Output
  // Look for output schema definitions
  const outputSchemaMatch = content.match(/outputSchema:\s*([a-zA-Z0-9_]+)/);
  let outputTokens = 150; // Default fallback

  if (outputSchemaMatch) {
    // Basic heuristic based on known flow types
    if (name.includes('quiz')) outputTokens = 600;
    else if (name.includes('syllabus')) outputTokens = 1200;
    else if (name.includes('chat')) outputTokens = 250;
    else if (name.includes('planner')) outputTokens = 200;
  }

  // 3. Audio Costs (Special Handling)
  let audioCost = 0;
  if (name === 'speech-to-speech') {
    // STT (10s) + TTS (200 chars)
    const sttCost = (10 / 60) * COST_STT_PER_MIN;
    const ttsCost = (200 / 1000000) * COST_TTS_PER_1M_CHARS;
    audioCost = sttCost + ttsCost;
  } else if (name === 'text-to-speech') {
    // TTS (200 chars)
    audioCost = (200 / 1000000) * COST_TTS_PER_1M_CHARS;
  }

  // 4. Calculate Total Cost
  const inputCost = (inputTokens / 1000000) * COST_INPUT_PER_1M;
  const outputCost = (outputTokens / 1000000) * COST_OUTPUT_PER_1M;
  const totalCostPerCall = inputCost + outputCost + audioCost;

  // 5. Monthly Projection (1k users)
  const dailyCalls = USAGE_PER_USER_DAILY[name as keyof typeof USAGE_PER_USER_DAILY] || USAGE_PER_USER_DAILY.default;
  const monthlyCost1kUsers = totalCostPerCall * dailyCalls * 1000 * 30;

  return {
    name,
    inputTokens,
    outputTokens,
    audioCost,
    totalCostPerCall,
    monthlyCost1kUsers
  };
}

function generateReport() {
  const files = fs.readdirSync(FLOWS_DIR).filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'));
  const report: FlowAnalysis[] = [];

  console.log('Analyzing flows in:', FLOWS_DIR);
  console.log('----------------------------------------------------------------');
  console.log(
    'Flow Name'.padEnd(30) +
    'In/Out Tokens'.padEnd(15) +
    'Audio Cost($)'.padEnd(15) +
    'Cost/Call($)'.padEnd(15) +
    'Monthly(1k Users)($)'
  );
  console.log('----------------------------------------------------------------');

  let totalMonthly = 0;

  for (const file of files) {
    try {
      const analysis = analyzeFlow(file);
      if (analysis) {
        report.push(analysis);
        totalMonthly += analysis.monthlyCost1kUsers;

        console.log(
          analysis.name.substring(0, 28).padEnd(30) +
          `${analysis.inputTokens}/${analysis.outputTokens}`.padEnd(15) +
          analysis.audioCost.toFixed(5).padEnd(15) +
          analysis.totalCostPerCall.toFixed(5).padEnd(15) +
          analysis.monthlyCost1kUsers.toFixed(2)
        );
      }
    } catch (err) {
      console.error(`Error analyzing ${file}:`, err);
    }
  }

  console.log('----------------------------------------------------------------');
  console.log('TOTAL PROJECTED MONTHLY COST (1k Users):'.padEnd(75) + `$${totalMonthly.toFixed(2)}`);
  console.log('----------------------------------------------------------------');
}

generateReport();
