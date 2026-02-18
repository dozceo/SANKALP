
import fs from 'fs';
import path from 'path';

/**
 * Flow Integrity Check Script
 *
 * Verifies the robustness of the Smart Revision Planner flow against failure modes.
 * Simulates the flow execution with mocked dependencies to ensure graceful degradation.
 *
 * Usage:
 *   npx tsx scripts/check-flow-integrity.ts [options]
 *
 * Options:
 *   --output <path>     Path to output report file (default: FLOW_INTEGRITY_REPORT.md)
 *   --json              Output result as JSON to stdout
 *   --fail-on-error     Exit with code 1 if any test case fails
 */

const DEFAULTS = {
  REPORT_FILE: 'FLOW_INTEGRITY_REPORT.md',
};

// --- Types ---

interface SmartRevisionPlannerInput {
  brainMap: string;
  studentId: string;
}

interface RevisionTask {
  topic: string;
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  masteryScore?: number;
}

interface SmartRevisionPlannerOutput {
  revisionList: RevisionTask[];
}

type FlowState = 'INIT' | 'HISTORY_FETCHED' | 'ML_DECISIONS_MADE' | 'LLM_CALLED' | 'OUTPUT_GENERATED' | 'ERROR';

interface FlowContext {
  getStudent: (id: string) => Promise<any>;
  getQuizResults: (id: string, limit: number) => Promise<any[]>;
  extractMasteryFeatures: (topic: string, history: any) => any;
  predictMastery: (features: any) => Promise<any>;
  makeRevisionDecision: (context: any) => any;
  makeInterventionDecision: (context: any) => void;
  logDecision: (context: any, decision: any) => void;
  explanationPrompt: (input: { topicsToExplain: string }) => Promise<any>;
}

interface TestCase {
  name: string;
  input: SmartRevisionPlannerInput;
  mocks: Partial<FlowContext>;
  expectedState: FlowState;
  check: (result: SmartRevisionPlannerOutput) => boolean;
}

// --- Mock Logic ---

let currentState: FlowState = 'INIT';

async function smartRevisionPlannerFlow(input: SmartRevisionPlannerInput, context: FlowContext): Promise<SmartRevisionPlannerOutput> {
  currentState = 'INIT';
  const {
    getStudent, getQuizResults, extractMasteryFeatures, predictMastery,
    makeRevisionDecision, makeInterventionDecision, logDecision, explanationPrompt
  } = context;

  // Parse brain map
  let brainMapData;
  try {
    brainMapData = JSON.parse(input.brainMap);
  } catch {
    brainMapData = { topics: [] };
  }

  // Fetch student history
  let studentHistory;
  try {
    const student = await getStudent(input.studentId);
    if (student) {
      const quizResults = await getQuizResults(input.studentId, 100);
      studentHistory = {
        studentId: input.studentId,
        quizResults: quizResults.map((qr: any) => ({
          topic: qr.topic,
          score: qr.score,
          timestamp: qr.timestamp,
          timeSpent: qr.timeSpent,
          questionsAttempted: qr.questionsAttempted,
        })),
        lastLoginDate: student.lastLoginDate,
        registrationDate: student.registrationDate,
      };
    } else {
      // Fallback
      studentHistory = {
        studentId: input.studentId,
        quizResults: brainMapData.quizResults || [],
        lastLoginDate: new Date(),
        registrationDate: new Date(),
      };
    }
    currentState = 'HISTORY_FETCHED';
  } catch (error) {
    // Fallback
    studentHistory = {
      studentId: input.studentId,
      quizResults: brainMapData.quizResults || [],
      lastLoginDate: new Date(),
      registrationDate: new Date(),
    };
    currentState = 'HISTORY_FETCHED'; // It recovers
  }

  // ML Decisions
  const mlDecisions = await makeRevisionDecisions(brainMapData, studentHistory, context);
  currentState = 'ML_DECISIONS_MADE';

  if (mlDecisions.length === 0) {
    currentState = 'OUTPUT_GENERATED';
    return { revisionList: [] };
  }

  const topicsToExplain = mlDecisions
    .slice(0, 5)
    .map(
      (d: any) =>
        `${d.topic} (mastery: ${(d.masteryProbability * 100).toFixed(0)}%, priority: ${d.priority}, reason_code: ${d.adkDecision?.action || 'FALLBACK'})`
    )
    .join(', ');

  let llmExplanations: { topic: string; reason: string }[] = [];
  try {
    const { output } = await explanationPrompt({ topicsToExplain });
    llmExplanations = output?.explanations || [];
    currentState = 'LLM_CALLED';
  } catch (error) {
    // Fallback logic
    console.warn("LLM Call Failed, using fallback explanations");
  }

  const revisionList = mlDecisions.slice(0, 5).map((decision: any, idx: number) => {
    const explanation = llmExplanations.find((e) => e.topic === decision.topic);
    let fallbackReason = 'Recommended for revision based on your learning history.';
    if (!decision.adkDecision) {
        fallbackReason = 'It has been a while since you practiced this topic.';
    } else if (decision.adkDecision.action === 'URGENT_REVISION') {
        fallbackReason = 'Urgent: Your mastery is critically low.';
    } else if (decision.adkDecision.action === 'SCHEDULED_REVISION') {
        fallbackReason = 'Spaced repetition: Time to review this to prevent forgetting.';
    }

    return {
      topic: decision.topic,
      reason: explanation?.reason || fallbackReason,
      priority: decision.priority,
      masteryScore: decision.masteryProbability,
    };
  });

  currentState = 'OUTPUT_GENERATED';
  return { revisionList };
}

async function makeRevisionDecisions(brainMapData: any, studentHistory: any, context: FlowContext) {
  const { extractMasteryFeatures, predictMastery, makeRevisionDecision, makeInterventionDecision, logDecision } = context;
  const decisions = [];

  for (const topic of brainMapData.topics || []) {
    try {
      const features = extractMasteryFeatures(topic.name, studentHistory);
      const mlPrediction = await predictMastery({
        avg_quiz_score: features.avg_quiz_score,
        attempts_per_topic: features.attempts_per_topic,
        days_since_last_revision: features.days_since_last_revision,
        quiz_score_variance: features.quiz_score_variance,
        time_spent_per_question: features.time_spent_per_question,
      });

      const mlSignals = {
        mastery_probability: mlPrediction.mastery_probability,
        confidence: mlPrediction.confidence,
        days_since_last_revision: features.days_since_last_revision,
        attempts_count: features.attempts_per_topic,
        performance_trend: "STABLE", // Simplified
      };

      const adkDecision = makeRevisionDecision({
        studentId: studentHistory.studentId || "unknown",
        topic: topic.name,
        currentDate: new Date(),
        examDate: brainMapData.examDate ? new Date(brainMapData.examDate) : undefined,
        daysUntilExam: brainMapData.daysUntilExam,
        mlSignals,
      });

      logDecision({}, adkDecision);

      const shouldRevise = [
        'URGENT_REVISION',
        'SCHEDULED_REVISION',
        'ADAPTIVE_TEACHING',
      ].includes(adkDecision.action);

      if (shouldRevise) {
        decisions.push({
          topic: topic.name,
          masteryProbability: mlPrediction.mastery_probability,
          priority: adkDecision.priority,
          daysSinceRevision: features.days_since_last_revision,
          adkDecision,
        });
      }

      makeInterventionDecision({});

    } catch (error) {
      if (topic.daysSinceLastRevision && topic.daysSinceLastRevision > 10) {
        decisions.push({
          topic: topic.name,
          masteryProbability: 0.5,
          priority: "MEDIUM",
          daysSinceRevision: topic.daysSinceLastRevision,
          adkDecision: null,
        });
      }
    }
  }

  return decisions.sort((a: any, b: any) => {
    const priorityOrder: any = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.masteryProbability - b.masteryProbability;
  });
}

// --- Test Definitions ---

const TEST_CASES: TestCase[] = [
  {
    name: "Happy Path - Normal Operation",
    input: {
      brainMap: JSON.stringify({ topics: [{ name: "Algebra", daysSinceLastRevision: 5 }] }),
      studentId: "student1"
    },
    mocks: {
      getStudent: async () => ({ lastLoginDate: new Date() }),
      getQuizResults: async () => [],
      extractMasteryFeatures: () => ({ avg_quiz_score: 0.5, attempts_per_topic: 1, days_since_last_revision: 5 }),
      predictMastery: async () => ({ mastery_probability: 0.4, confidence: 0.8 }),
      makeRevisionDecision: () => ({ action: 'URGENT_REVISION', priority: 'HIGH', contentStrategy: 'SHORT_FORM' }),
      explanationPrompt: async () => ({ output: { explanations: [{ topic: "Algebra", reason: "AI Reason" }] } })
    },
    expectedState: 'OUTPUT_GENERATED',
    check: (result) => result.revisionList.length === 1 && result.revisionList[0].topic === "Algebra"
  },
  {
    name: "ML Service Failure (Graceful Degradation)",
    input: {
      brainMap: JSON.stringify({ topics: [{ name: "Geometry", daysSinceLastRevision: 15 }] }),
      studentId: "student2"
    },
    mocks: {
      getStudent: async () => ({}),
      getQuizResults: async () => [],
      extractMasteryFeatures: () => ({}),
      predictMastery: async () => { throw new Error("ML Service Down"); },
      makeRevisionDecision: () => ({}),
      explanationPrompt: async () => ({ output: { explanations: [] } })
    },
    expectedState: 'OUTPUT_GENERATED',
    check: (result) => result.revisionList.length === 1 && result.revisionList[0].priority === "MEDIUM"
  },
  {
    name: "LLM Explanation Failure",
    input: {
      brainMap: JSON.stringify({ topics: [{ name: "Calculus", daysSinceLastRevision: 2 }] }),
      studentId: "student3"
    },
    mocks: {
      getStudent: async () => ({}),
      getQuizResults: async () => [],
      extractMasteryFeatures: () => ({ avg_quiz_score: 0.2, days_since_last_revision: 2 }),
      predictMastery: async () => ({ mastery_probability: 0.1 }),
      makeRevisionDecision: () => ({ action: 'URGENT_REVISION', priority: 'HIGH' }),
      explanationPrompt: async () => { throw new Error("LLM Quota Exceeded"); }
    },
    expectedState: 'OUTPUT_GENERATED',
    check: (result) => result.revisionList.length === 1 && result.revisionList[0].reason.startsWith("Urgent:")
  },
  {
      name: "High Mastery (No Revision Needed)",
      input: {
        brainMap: JSON.stringify({ topics: [{ name: "Physics", daysSinceLastRevision: 1 }] }),
        studentId: "student4"
      },
      mocks: {
        getStudent: async () => ({}),
        getQuizResults: async () => [],
        extractMasteryFeatures: () => ({ avg_quiz_score: 0.9, days_since_last_revision: 1 }),
        predictMastery: async () => ({ mastery_probability: 0.95 }),
        makeRevisionDecision: () => ({ action: 'PROGRESS_ALLOWED', priority: 'LOW' }),
        explanationPrompt: async () => ({ output: { explanations: [] } })
      },
      expectedState: 'OUTPUT_GENERATED',
      check: (result) => result.revisionList.length === 0
  }
];

// --- Runner ---

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    outputPath: path.join(process.cwd(), DEFAULTS.REPORT_FILE),
    jsonOutput: false,
    failOnError: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--output':
        config.outputPath = path.resolve(args[++i]);
        break;
      case '--json':
        config.jsonOutput = true;
        break;
      case '--fail-on-error':
        config.failOnError = true;
        break;
    }
  }
  return config;
}

async function run() {
  const config = parseArgs();
  const results = [];
  let passedCount = 0;

  for (const test of TEST_CASES) {
    // Merge mocks with defaults
    const context: FlowContext = {
      getStudent: async () => ({}),
      getQuizResults: async () => [],
      extractMasteryFeatures: () => ({}),
      predictMastery: async () => ({ mastery_probability: 0.5 }),
      makeRevisionDecision: () => ({ action: 'SCHEDULED_REVISION', priority: 'MEDIUM' }),
      makeInterventionDecision: () => {},
      logDecision: () => {},
      explanationPrompt: async () => ({ output: { explanations: [] } }),
      ...test.mocks
    };

    let result;
    let error;
    let passed = false;

    try {
      result = await smartRevisionPlannerFlow(test.input, context);
      passed = (currentState === test.expectedState) && test.check(result);
    } catch (e: any) {
      error = e.message;
      passed = false;
    }

    if (passed) passedCount++;

    results.push({
      name: test.name,
      passed,
      expectedState: test.expectedState,
      actualState: currentState,
      output: result,
      error
    });
  }

  const reportData = {
    timestamp: new Date().toLocaleString(),
    totalTests: TEST_CASES.length,
    passedCount,
    failedCount: TEST_CASES.length - passedCount,
    results
  };

  if (config.jsonOutput) {
    console.log(JSON.stringify(reportData, null, 2));
  } else {
    // Generate Markdown
    let md = `# Smart Revision Planner Flow Integrity Report\n\n`;
    md += `**Generated:** ${reportData.timestamp}\n\n`;
    md += `## Summary\n`;
    md += `- **Total Tests:** ${reportData.totalTests}\n`;
    md += `- **Passed:** ${reportData.passedCount}\n`;
    md += `- **Failed:** ${reportData.failedCount}\n`;

    const status = reportData.failedCount === 0 ? '✅ FLOW INTEGRITY VERIFIED' : '⚠️ FLOW INTEGRITY ISSUES DETECTED';
    md += `\n**Overall Status:** ${status}\n\n`;

    md += `## Test Cases\n\n`;
    results.forEach(r => {
      md += `### ${r.name}\n`;
      md += `- **Result:** ${r.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
      if (!r.passed) {
        md += `  - Expected State: ${r.expectedState}\n`;
        md += `  - Actual State: ${r.actualState}\n`;
        if (r.error) md += `  - Error: ${r.error}\n`;
      }
      md += `- **Final State:** ${r.actualState}\n`;
      if (r.output) {
        const simplifiedOutput = r.output.revisionList.map((item: any) => ({
             topic: item.topic,
             priority: item.priority,
             reason: item.reason.length > 50 ? item.reason.substring(0, 47) + '...' : item.reason
        }));
        md += `- **Output:** \`${JSON.stringify(simplifiedOutput)}\`\n`;
      }
      md += `\n`;
    });

    fs.writeFileSync(config.outputPath, md);
    console.log(`Report generated at ${config.outputPath}`);
  }

  if (config.failOnError && reportData.failedCount > 0) {
    console.error('Failure: Flow integrity tests failed.');
    process.exit(1);
  }
}

run();
