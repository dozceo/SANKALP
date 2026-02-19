import fs from 'fs';
import path from 'path';

// --- Cost Constants (Monthly) ---
const PRICING = {
  GEMINI_FLASH: {
    INPUT_PER_1M: 0.075,
    OUTPUT_PER_1M: 0.30,
  },
  FIRESTORE: {
    READ_PER_100K: 0.036,
    WRITE_PER_100K: 0.108,
    STORAGE_GB_MONTH: 0.18,
  },
  VERCEL_SERVERLESS: {
    GB_HOUR: 0.60, // Standard Function Duration
    REQUESTS_PER_1M: 0.20,
  },
};

// --- Usage Profiles ---
// Assumptions for Active User
const STUDENT_PROFILE = {
  SYLLABUS_GEN_PER_MONTH: 4, // Once a week
  QUIZZES_PER_DAY: 2,
  CHAT_MESSAGES_PER_DAY: 5,
  DASHBOARD_VIEWS_PER_DAY: 10,
};

const TEACHER_PROFILE = {
  DASHBOARD_VIEWS_PER_DAY: 5,
  INTERVENTIONS_PER_WEEK: 5,
};

// --- Operation Cost Models ---

// 1. LLM Costs
const LLM_OPERATIONS = {
  QUIZ_GEN: {
    inputTokens: 400,
    outputTokens: 1500,
  },
  SYLLABUS_GEN: {
    inputTokens: 300,
    outputTokens: 2000,
  },
  CHATBOT: {
    inputTokens: 1000, // System prompt + history + brain map
    outputTokens: 200,
  },
  EXPLANATION: {
    inputTokens: 500,
    outputTokens: 300,
  },
};

// 2. ML Costs
// Assumption: Python subprocess adds significant overhead to cold starts
const ML_OPERATIONS = {
  PREDICT_MASTERY: {
    computeTimeMs: 100, // Warm execution
    coldStartOverheadMs: 3000, // Python spawn + model load
    coldStartRate: 0.2, // 20% of requests hit a cold start (conservative for serverless)
    memoryGB: 1.0, // Python process needs memory
  },
};

// 3. Database Costs
const DB_OPERATIONS = {
  QUIZ_GEN: { reads: 0, writes: 1 },
  SYLLABUS_GEN: { reads: 0, writes: 1 },
  CHATBOT: { reads: 1, writes: 1 }, // Read context, write history
  ML_PREDICTION: { reads: 1, writes: 1 }, // Read features, write cache
  DASHBOARD_LOAD: { reads: 20, writes: 0 }, // Fetch user, classes, recent quizzes, ML predictions
  QUIZ_SUBMIT: { reads: 0, writes: 1 },
};

// --- Helper Functions ---

function calculateLLMCostPerOp(opName: keyof typeof LLM_OPERATIONS) {
  const op = LLM_OPERATIONS[opName];
  const inputCost = (op.inputTokens / 1_000_000) * PRICING.GEMINI_FLASH.INPUT_PER_1M;
  const outputCost = (op.outputTokens / 1_000_000) * PRICING.GEMINI_FLASH.OUTPUT_PER_1M;
  return inputCost + outputCost;
}

function calculateMLCostPerOp(opName: keyof typeof ML_OPERATIONS) {
  const op = ML_OPERATIONS[opName];
  const avgDurationSeconds =
    (op.computeTimeMs * (1 - op.coldStartRate) +
      (op.computeTimeMs + op.coldStartOverheadMs) * op.coldStartRate) /
    1000;

  const computeCost = (op.memoryGB * avgDurationSeconds / 3600) * PRICING.VERCEL_SERVERLESS.GB_HOUR;
  const requestCost = (1 / 1_000_000) * PRICING.VERCEL_SERVERLESS.REQUESTS_PER_1M;

  return computeCost + requestCost;
}

function calculateDBCostPerOp(opName: keyof typeof DB_OPERATIONS) {
  const op = DB_OPERATIONS[opName];
  const readCost = (op.reads / 100_000) * PRICING.FIRESTORE.READ_PER_100K;
  const writeCost = (op.writes / 100_000) * PRICING.FIRESTORE.WRITE_PER_100K;
  return readCost + writeCost;
}

// --- Main Analysis ---

function generateReport() {
  const reportPath = path.join(process.cwd(), 'reports', 'COST_OPTIMIZATION_REPORT.md');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

  let markdown = `# Cost Optimization & Resource Efficiency Report

## Executive Summary
This report analyzes the projected costs for the SANKALP platform across LLM, ML, Database, and Serverless infrastructure. It identifies key cost drivers, potential scaling risks, and optimization opportunities.

## 1. Unit Cost Analysis (Per Operation)

| Operation | LLM Cost ($) | ML Cost ($) | DB Cost ($) | Total ($) |
| :--- | :--- | :--- | :--- | :--- |
| **Quiz Generation** | $${calculateLLMCostPerOp('QUIZ_GEN').toFixed(6)} | - | $${calculateDBCostPerOp('QUIZ_GEN').toFixed(6)} | $${(calculateLLMCostPerOp('QUIZ_GEN') + calculateDBCostPerOp('QUIZ_GEN')).toFixed(6)} |
| **Syllabus Generation** | $${calculateLLMCostPerOp('SYLLABUS_GEN').toFixed(6)} | - | $${calculateDBCostPerOp('SYLLABUS_GEN').toFixed(6)} | $${(calculateLLMCostPerOp('SYLLABUS_GEN') + calculateDBCostPerOp('SYLLABUS_GEN')).toFixed(6)} |
| **Chatbot Message** | $${calculateLLMCostPerOp('CHATBOT').toFixed(6)} | - | $${calculateDBCostPerOp('CHATBOT').toFixed(6)} | $${(calculateLLMCostPerOp('CHATBOT') + calculateDBCostPerOp('CHATBOT')).toFixed(6)} |
| **ML Prediction (Mastery)** | - | $${calculateMLCostPerOp('PREDICT_MASTERY').toFixed(6)} | $${calculateDBCostPerOp('ML_PREDICTION').toFixed(6)} | $${(calculateMLCostPerOp('PREDICT_MASTERY') + calculateDBCostPerOp('ML_PREDICTION')).toFixed(6)} |
| **Dashboard Load** | - | - | $${calculateDBCostPerOp('DASHBOARD_LOAD').toFixed(6)} | $${calculateDBCostPerOp('DASHBOARD_LOAD').toFixed(6)} |

**Key Insight:** Quiz and Syllabus generation are the most expensive single operations due to LLM output tokens. ML prediction is relatively cheap per unit *if* warm, but cold starts add up.

## 2. Monthly Cost Projections (at Scale)

Assumptions:
- **Active Users**: 20% of total users are daily active.
- **Student Profile**: 2 quizzes/day, 5 chat/day, 10 dashboard loads/day, 1 syllabus/week.
- **ML Load**: Every dashboard load triggers ~5 topic mastery predictions (batched).

| Metric | 1,000 Users | 10,000 Users | 100,000 Users |
| :--- | :--- | :--- | :--- |
`;

  const scales = [1000, 10000, 100000];
  const dauRate = 0.2;

  // Calculate costs for each scale
  const costs = scales.map(totalUsers => {
    const dau = totalUsers * dauRate;

    // Monthly Volume
    const quizzes = dau * STUDENT_PROFILE.QUIZZES_PER_DAY * 30;
    const syllabus = dau * (STUDENT_PROFILE.SYLLABUS_GEN_PER_MONTH / 30) * 30; // approx
    const chats = dau * STUDENT_PROFILE.CHAT_MESSAGES_PER_DAY * 30;
    const dashboards = dau * STUDENT_PROFILE.DASHBOARD_VIEWS_PER_DAY * 30;
    const mlPredictions = dashboards * 5; // 5 topics per dashboard load

    // Costs
    const llmCost =
      quizzes * calculateLLMCostPerOp('QUIZ_GEN') +
      syllabus * calculateLLMCostPerOp('SYLLABUS_GEN') +
      chats * calculateLLMCostPerOp('CHATBOT');

    const mlCost = mlPredictions * calculateMLCostPerOp('PREDICT_MASTERY');

    const dbCost =
      quizzes * calculateDBCostPerOp('QUIZ_GEN') +
      syllabus * calculateDBCostPerOp('SYLLABUS_GEN') +
      chats * calculateDBCostPerOp('CHATBOT') +
      mlPredictions * calculateDBCostPerOp('ML_PREDICTION') +
      dashboards * calculateDBCostPerOp('DASHBOARD_LOAD');

    const total = llmCost + mlCost + dbCost;

    return { llmCost, mlCost, dbCost, total };
  });

  // Generate Table Rows
  const row1k = costs[0];
  const row10k = costs[1];
  const row100k = costs[2];

  markdown += `| **Total Monthly Cost** | **$${row1k.total.toFixed(2)}** | **$${row10k.total.toFixed(2)}** | **$${row100k.total.toFixed(2)}** |\n`;
  markdown += `| LLM Share | $${row1k.llmCost.toFixed(2)} (${((row1k.llmCost/row1k.total)*100).toFixed(1)}%) | $${row10k.llmCost.toFixed(2)} (${((row10k.llmCost/row10k.total)*100).toFixed(1)}%) | $${row100k.llmCost.toFixed(2)} (${((row100k.llmCost/row100k.total)*100).toFixed(1)}%) |\n`;
  markdown += `| ML Share | $${row1k.mlCost.toFixed(2)} (${((row1k.mlCost/row1k.total)*100).toFixed(1)}%) | $${row10k.mlCost.toFixed(2)} (${((row10k.mlCost/row10k.total)*100).toFixed(1)}%) | $${row100k.mlCost.toFixed(2)} (${((row100k.mlCost/row100k.total)*100).toFixed(1)}%) |\n`;
  markdown += `| DB Share | $${row1k.dbCost.toFixed(2)} (${((row1k.dbCost/row1k.total)*100).toFixed(1)}%) | $${row10k.dbCost.toFixed(2)} (${((row10k.dbCost/row10k.total)*100).toFixed(1)}%) | $${row100k.dbCost.toFixed(2)} (${((row100k.dbCost/row100k.total)*100).toFixed(1)}%) |\n`;

  markdown += `

## 3. Waste Inventory & Risk Analysis

### High-Risk Patterns
1.  **ML Cold Start Penalties**: The current architecture spawns a Python subprocess for ML inference. In a serverless environment (Next.js), this leads to high latency and cost due to repeated environment initialization (loading \`sklearn\`, \`pandas\`, model pickling).
    *   **Est. Waste**: 80% of ML compute time is overhead in cold starts.
2.  **Uncached Syllabus Generation**: Syllabus generation is expensive ($${calculateLLMCostPerOp('SYLLABUS_GEN').toFixed(4)}). Students likely request the same syllabus ("AP Calculus BC") repeatedly.
    *   **Est. Waste**: 90% of requests could be served from cache.
3.  **Dashboard N+1 Queries**: Loading the dashboard fetches user, then classes, then quizzes, then predictions.
    *   **Impact**: Increases Firestore read costs linearly with complexity.

### Token Usage Heatmap
- **Adaptive Quiz**: HIGH (Input + Output). Array structure consumes many tokens.
- **Syllabus**: HIGH (Output). Long structured text.
- **Chatbot**: MEDIUM (Input). Context window (brain map) grows over time.
- **Smart Revision**: LOW.

## 4. Optimization Roadmap

### Phase 1: Low Effort, High Impact (Immediate)
- [ ] **Cache Syllabi**: Implement Firestore caching for generated syllabi keying by standard exam names.
    *   *Savings*: ~90% of Syllabus LLM costs.
- [ ] **Batch ML Predictions**: Ensure the frontend requests predictions for all visible topics in one batch (already partially implemented, but ensure effectively used).
- [ ] **Optimize Prompts**: Reduce verbose instructions in System Prompts. Use shorter field names in JSON schemas (e.g., \`q\` instead of \`question\`, \`ops\` instead of \`options\`) to save output tokens.

### Phase 2: Architectural Improvements (Medium Term)
- [ ] **Deploy ML as Microservice**: Move \`src/ml\` to a dedicated FastAPI service (e.g., on Cloud Run or persistent container).
    *   *Benefit*: Eliminates Python spawn overhead. Keeps model in memory (Warm start). Reduces latency from ~3s to ~100ms.
- [ ] **Database Denormalization**: Store a summary "Dashboard Object" in Firestore that is updated only when necessary (e.g., after a quiz), rather than re-aggregating on every read.

### Phase 3: Advanced Optimization (Long Term)
- [ ] **Model Quantization**: Compress the ML model to reduce memory footprint and load time.
- [ ] **Edge Caching**: Cache API responses for static content (e.g., class lists) at the edge.

## 5. Budget Alert System Spec

### Thresholds
- **Global Daily Budget**: $50 (Soft Alert), $100 (Critical Alert).
- **Per-User Monthly Limit**: $5.00 (stops expensive features like Syllabus Gen).

### Monitoring Logic
1.  **Token Counter Middleware**: Intercept all calls to \`ai.generate\`. Log token usage to a \`usage_logs\` Firestore collection.
2.  **Cost Aggregator**: A scheduled Cloud Function runs hourly to sum up costs from \`usage_logs\`.
3.  **Alert Dispatch**: If \`current_daily_cost > threshold\`, send email/Slack notification to admin.

`;

  fs.writeFileSync(reportPath, markdown);
  console.log(`Report generated at: ${reportPath}`);
}

generateReport();
