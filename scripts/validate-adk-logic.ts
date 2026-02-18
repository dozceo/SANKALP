import {
  makeRevisionDecision,
  makeInterventionDecision,
} from "../src/ai/adk/decision-engine";
import {
  DecisionContext,
  MLSignals,
  DecisionAction,
  ContentStrategy,
} from "../src/ai/adk/types";
import fs from "fs";
import path from "path";

// 1. Define Discrete Input Values based on decision logic boundaries
const STATE_SPACE = {
  daysUntilExam: [2, 5, undefined], // <=3 (Cramming), >3 (Normal), undefined
  mastery_probability: [0.2, 0.35, 0.5, 0.65, 0.75, 0.9], // <0.3, <0.4, 0.4-0.6, 0.6-0.7, >=0.7
  days_since_last_revision: [5, 10, 15, 30], // <=7, >7, >10, >14
  days_until_forget: [2, 5, 999], // <3, >=3
  attention_risk: ["LOW", "HIGH"] as ("LOW" | "HIGH")[], // HIGH triggers rules
  attempts_count: [3, 6], // >5 triggers intervention
  dropout_probability: [0.5, 0.7], // >0.6 triggers intervention
};

type DecisionResult = {
  revisionAction: DecisionAction;
  interventionSeverity: string | null;
  adkFlags: string[];
};

type AnalysisStats = {
  totalCombinations: number;
  ruleActivation: Record<string, number>;
  unreachableRules: string[];
  contradictions: {
    state: string;
    revision: string;
    intervention: string;
    reason: string;
  }[];
};

function describeState(context: DecisionContext): string {
  const { mlSignals, daysUntilExam } = context;
  return `Exam:${daysUntilExam ?? "None"} | Mastery:${mlSignals.mastery_probability.toFixed(
    2
  )} | RevDays:${mlSignals.days_since_last_revision} | Forget:${
    mlSignals.days_until_forget
  } | Attn:${mlSignals.attention_risk} | Attempts:${
    mlSignals.attempts_count
  } | Dropout:${mlSignals.dropout_probability}`;
}

function runAnalysis() {
  const stats: AnalysisStats = {
    totalCombinations: 0,
    ruleActivation: {},
    unreachableRules: [],
    contradictions: [],
  };

  // Helper to iterate combinations
  const iterate = (
    keys: (keyof typeof STATE_SPACE)[],
    current: Partial<Record<keyof typeof STATE_SPACE, any>>
  ) => {
    if (keys.length === 0) {
      // Base case: execute logic
      const mlSignals: MLSignals = {
        mastery_probability: current.mastery_probability,
        confidence: 0.8, // Fixed for simplicity
        days_until_forget: current.days_until_forget,
        attention_risk: current.attention_risk,
        dropout_probability: current.dropout_probability,
        days_since_last_revision: current.days_since_last_revision,
        attempts_count: current.attempts_count,
      };

      const context: DecisionContext = {
        studentId: "test-student",
        topic: "test-topic",
        currentDate: new Date(),
        examDate: current.daysUntilExam
          ? new Date(Date.now() + current.daysUntilExam * 86400000)
          : undefined,
        daysUntilExam: current.daysUntilExam,
        mlSignals,
      };

      const revisionDecision = makeRevisionDecision(context);
      const interventionSignal = makeInterventionDecision(context);

      stats.totalCombinations++;

      // Track Rule Activation (Approximation via Flags/Actions)
      // Since we can't inspect which 'if' block ran directly without modifying code,
      // we infer from adkFlags or Action/Strategy combos which map 1:1 to rules in the current implementation.
      const ruleKey = revisionDecision.adkFlags.join("+");
      stats.ruleActivation[ruleKey] = (stats.ruleActivation[ruleKey] || 0) + 1;

      // Check Contradictions
      // 1. Revision says "Progress Allowed" but Intervention says "Critical"
      if (
        revisionDecision.action === DecisionAction.PROGRESS_ALLOWED &&
        interventionSignal?.severity === "CRITICAL"
      ) {
        stats.contradictions.push({
          state: describeState(context),
          revision: revisionDecision.action,
          intervention: interventionSignal.severity,
          reason: "Logic Error: Allowing progress on critical risk student",
        });
      }

      // 2. Revision says "Progress Allowed" but Intervention says "High"
      if (
        revisionDecision.action === DecisionAction.PROGRESS_ALLOWED &&
        interventionSignal?.severity === "HIGH"
      ) {
        stats.contradictions.push({
          state: describeState(context),
          revision: revisionDecision.action,
          intervention: interventionSignal.severity,
          reason: "Risk Mismatch: Progress allowed despite high intervention risk",
        });
      }

      // 3. Urgent Revision (Cramming) vs Critical Intervention (Long term failure)
      // This is subjective. Cramming might be needed even if failing?
      // But if intervention says "Suggested Action: Immediate 1-on-1", maybe automated cramming is moot?
      // We'll log it as a potential conflict if Action is SHORT_FORM (quick fix) but Severity is CRITICAL.
       if (
        revisionDecision.contentStrategy === ContentStrategy.SHORT_FORM &&
        interventionSignal?.severity === "CRITICAL"
      ) {
         stats.contradictions.push({
          state: describeState(context),
          revision: revisionDecision.contentStrategy,
          intervention: interventionSignal.severity,
          reason: "Strategy Conflict: Quick fix (Short Form) suggested for Critical failure case",
        });
      }

      return;
    }

    const key = keys[0];
    const values = STATE_SPACE[key];
    for (const val of values) {
      iterate(keys.slice(1), { ...current, [key]: val });
    }
  };

  iterate(Object.keys(STATE_SPACE) as (keyof typeof STATE_SPACE)[], {});

  return stats;
}

function generateReport(stats: AnalysisStats) {
  const report = [
    "# ADK Decision Logic Coverage Report",
    `Generated on: ${new Date().toISOString()}`,
    "",
    "## 1. Summary",
    `- Total State Combinations Tested: ${stats.totalCombinations}`,
    `- Unique Decision Paths Activated: ${Object.keys(stats.ruleActivation).length}`,
    `- Contradictions Found: ${stats.contradictions.length}`,
    "",
    "## 2. Rule Activation Frequency",
    "| Rule (Flags) | Count | Share |",
    "|---|---|---|",
    ...Object.entries(stats.ruleActivation)
      .sort(([, a], [, b]) => b - a)
      .map(
        ([rule, count]) =>
          `| \`${rule}\` | ${count} | ${((count / stats.totalCombinations) * 100).toFixed(1)}% |`
      ),
    "",
    "## 3. Contradictions & Logical Conflicts",
    stats.contradictions.length === 0
      ? "✅ No contradictions found."
      : stats.contradictions
          .map(
            (c) =>
              `### ${c.reason}\n- **State**: \`${c.state}\`\n- **Revision**: ${c.revision}\n- **Intervention**: ${c.intervention}\n`
          )
          .join("\n"),
    "",
    "## 4. Unreachable States / Missing Handlers",
    "Determined by analyzing which expected flags were NEVER seen.",
    "",
    "Expected Flags vs Observed:",
    "- `CRAMMING_MODE`: " + (Object.keys(stats.ruleActivation).some(k => k.includes("CRAMMING")) ? "✅ Covered" : "❌ UNREACHABLE"),
    "- `URGENT_REVISION`: " + (Object.keys(stats.ruleActivation).some(k => k.includes("URGENT") && !k.includes("CRAMMING")) ? "✅ Covered" : "❌ UNREACHABLE"), // Distinguish from cramming if possible, logic uses URGENT for both action but diff flags
    "- `ADAPTIVE_TEACHING`: " + (Object.keys(stats.ruleActivation).some(k => k.includes("ADAPTIVE")) ? "✅ Covered" : "❌ UNREACHABLE"),
    "- `SPACED_REPETITION`: " + (Object.keys(stats.ruleActivation).some(k => k.includes("SPACED")) ? "✅ Covered" : "❌ UNREACHABLE"),
    "- `MASTERY_ACHIEVED`: " + (Object.keys(stats.ruleActivation).some(k => k.includes("MASTERY")) ? "✅ Covered" : "❌ UNREACHABLE"),
    "- `ROUTINE_REVISION`: " + (Object.keys(stats.ruleActivation).some(k => k.includes("ROUTINE")) ? "✅ Covered" : "❌ UNREACHABLE"),
  ];

  fs.writeFileSync("ADK_DECISION_COVERAGE.md", report.join("\n"));
  console.log("Report generated: ADK_DECISION_COVERAGE.md");
}

const stats = runAnalysis();
generateReport(stats);
