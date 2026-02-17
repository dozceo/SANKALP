
import { extractMasteryFeatures, calculatePerformanceTrend as calculateTrendFeatures, type StudentHistory } from "../src/ml/features/student_features";
import { predictMastery } from "../src/ml/inference/ml-bridge";
import { makeRevisionDecision } from "../src/ai/adk/decision-engine";
import { type MLSignals, type ADKDecision, DecisionAction, ContentStrategy } from "../src/ai/adk/types";

// Copied from src/ai/flows/smart-revision-planner.ts for comparison
function calculateTrendPlanner(
  topic: string,
  history: StudentHistory
): "IMPROVING" | "STABLE" | "DECLINING" {
  const topicQuizzes = history.quizResults
    .filter((r) => r.topic === topic)
    // Sort by timestamp descending (newest first)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (topicQuizzes.length < 2) {
    return "STABLE";
  }

  let recent: number[] = [];
  let previous: number[] = [];

  // Determine window size based on available history
  if (topicQuizzes.length >= 6) {
    // Compare last 3 vs previous 3
    recent = topicQuizzes.slice(0, 3).map((q) => q.score);
    previous = topicQuizzes.slice(3, 6).map((q) => q.score);
  } else if (topicQuizzes.length >= 4) {
    // Compare last 2 vs previous 2
    recent = topicQuizzes.slice(0, 2).map((q) => q.score);
    previous = topicQuizzes.slice(2, 4).map((q) => q.score);
  } else {
    // Split remaining in half (e.g. 3 -> 1 vs 1, 2 -> 1 vs 1)
    const midpoint = Math.floor(topicQuizzes.length / 2);
    recent = topicQuizzes.slice(0, midpoint).map((q) => q.score);
    previous = topicQuizzes.slice(midpoint, midpoint * 2).map((q) => q.score);
  }

  const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
  const previousAvg = previous.reduce((s, v) => s + v, 0) / previous.length;

  const threshold = 0.1; // 10% change required to indicate a trend

  if (recentAvg > previousAvg + threshold) {
    return "IMPROVING";
  } else if (recentAvg < previousAvg - threshold) {
    return "DECLINING";
  }

  return "STABLE";
}


async function runTrace() {
  console.log("Starting Causal Integrity Trace...");

  const scenarios = [
    {
      name: "Happy Path - High Mastery",
      history: createHistory([1.0, 0.9, 0.95, 1.0, 0.9]), // Consistent high scores
      topic: "Calculus",
      expectedAction: DecisionAction.PROGRESS_ALLOWED
    },
    {
      name: "Happy Path - Low Mastery",
      history: createHistory([0.2, 0.3, 0.1, 0.4, 0.2]), // Consistent low scores
      topic: "Calculus",
      expectedAction: DecisionAction.URGENT_REVISION
    },
    {
        name: "ML Failure Simulation",
        history: createHistory([0.5, 0.5, 0.5]),
        topic: "Calculus",
        mockML: { mastery_probability: 0, confidence: 0, predicted_class: "error" as const, error: "Simulated Error" },
        expectedAction: "Should handle gracefully"
    },
    {
        name: "Feature Drift Simulation (Negative Time)",
        history: createHistory([0.8], -100), // Negative time spent
        topic: "Calculus",
        expectedAction: "Should validate features"
    },
    {
        name: "Trend Calculation Divergence",
        // Create a scenario where slope (features) differs from window avg (planner)
        // e.g. 0.4, 0.5, 0.6, 0.7, 0.8 (Improving linearly)
        // Planner compares (0.8, 0.7) avg=0.75 vs (0.6, 0.5) avg=0.55 -> Diff 0.2 -> IMPROVING
        // Slope calculation: 5 points, clearly improving.
        // Let's try something jagged: 0.1, 0.9, 0.1, 0.9
        // Sorted desc: 0.9, 0.1, 0.9, 0.1
        // Planner: (0.9, 0.1) avg=0.5 vs (0.9, 0.1) avg=0.5 -> STABLE
        // Slope: might be near 0 -> STABLE
        // Let's try: 0.5, 0.6, 0.4, 0.7 (increasing variance but similar mean)
        history: createHistory([0.5, 0.6, 0.4, 0.7]),
        topic: "Calculus",
        expectedAction: "Check Consistency"
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n=== Scenario: ${scenario.name} ===`);

    // 1. Feature Extraction
    console.log("--- Step 1: Feature Extraction ---");
    const features = extractMasteryFeatures(scenario.topic, scenario.history);
    console.log("Features:", JSON.stringify(features, null, 2));

    // Check for feature validity
    if (features.time_spent_per_question < 0) {
        console.error("FAIL: Negative time_spent_per_question detected.");
    }

    // Trend Comparison
    const trendFeatures = calculateTrendFeatures(scenario.history.quizResults);
    const trendPlanner = calculateTrendPlanner(scenario.topic, scenario.history);
    console.log(`Trend (Features): ${trendFeatures}`);
    console.log(`Trend (Planner): ${trendPlanner}`);

    if (trendFeatures !== trendPlanner) {
        console.error(`DRIFT: Trend calculation mismatch! Features=${trendFeatures}, Planner=${trendPlanner}`);
    }

    // 2. ML Prediction
    console.log("--- Step 2: ML Prediction ---");
    let mlOutput;
    if (scenario.mockML) {
        console.log("Using Mock ML Output");
        mlOutput = scenario.mockML;
    } else {
        try {
            mlOutput = await predictMastery(features);
        } catch (e) {
            console.error("ML Prediction failed:", e);
            mlOutput = { mastery_probability: 0, confidence: 0, predicted_class: "error", error: String(e) };
        }
    }
    console.log("ML Output:", JSON.stringify(mlOutput, null, 2));

    // 3. ADK Decision
    console.log("--- Step 3: ADK Decision ---");
    const mlSignals: MLSignals = {
        mastery_probability: mlOutput.mastery_probability,
        confidence: mlOutput.confidence,
        days_since_last_revision: features.days_since_last_revision,
        attempts_count: features.attempts_per_topic,
        performance_trend: trendFeatures, // Using the feature extraction one as per student_features.ts usage
    };

    const decision = makeRevisionDecision({
        studentId: "test-student",
        topic: scenario.topic,
        mlSignals,
        currentDate: new Date(),
        // mock context
        daysUntilExam: 10
    });
    console.log("ADK Decision:", JSON.stringify(decision, null, 2));

    // Semantic Validation
    validateCoherence(mlOutput, decision);

    // 4. LLM Generation (Simulation)
    console.log("--- Step 4: LLM Generation (Simulated) ---");
    // We check if the ADK decision properties would generate a valid prompt
    if (!decision.llmContext) {
        console.error("FAIL: Missing llmContext in decision.");
    } else {
        console.log("LLM Context:", JSON.stringify(decision.llmContext, null, 2));
    }
  }
}

function createHistory(scores: number[], timeSpent = 60): StudentHistory {
    const now = new Date();
    return {
        studentId: "test",
        quizResults: scores.map((s, i) => ({
            topic: "Calculus",
            score: s,
            timestamp: new Date(now.getTime() - i * 86400000), // 1 day apart
            timeSpent: timeSpent,
            questionsAttempted: 10
        })),
        lastLoginDate: now,
        registrationDate: new Date(now.getTime() - 100000000)
    };
}

function validateCoherence(ml: any, adk: ADKDecision) {
    // Rule: High Mastery (> 0.8) should not result in URGENT_REVISION unless Cramming Mode
    if (ml.mastery_probability > 0.8 && adk.action === DecisionAction.URGENT_REVISION) {
        // Check for cramming exception (handled in makeRevisionDecision logic but we can flag it)
        if (!adk.reasoning.includes("Exam imminent")) {
             console.error("VIOLATION: High Mastery (>0.8) -> URGENT_REVISION (Non-Cramming)");
        }
    }

    // Rule: ML Error (0 probability) should be handled.
    // If ML fails (prob=0, class=error), ADK treats it as 0.
    // This usually triggers Rule 1 or 2 (Low Mastery).
    if (ml.predicted_class === "error") {
        console.warn(`OBSERVATION: ML Error resulted in action: ${adk.action}. Reasoning: ${adk.reasoning}`);
        if (adk.action === DecisionAction.URGENT_REVISION || adk.action === DecisionAction.ADAPTIVE_TEACHING) {
             console.error("SILENT FAILURE: ML Error propagated as 'Low Mastery' decision.");
        }
    }
}

runTrace().catch(console.error);
