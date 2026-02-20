
import { predictMastery } from "../src/ml/inference/ml-bridge";
import { makeRevisionDecision, makeInterventionDecision } from "../src/ai/adk/decision-engine";
import { MLSignals, DecisionContext, ADKDecision, TeacherInterventionSignal } from "../src/ai/adk/types";
import fs from "fs";
import path from "path";

// ------------------------------------------------------------------
// 1. Synthetic Data Generation: Behavioral Archetypes
// ------------------------------------------------------------------

interface StudentProfile {
  id: string;
  archetype: string;
  // Core ML Features
  avg_quiz_score: number;
  attempts_per_topic: number;
  days_since_last_revision: number;
  quiz_score_variance: number;
  time_spent_per_question: number;
  // Additional context for ADK
  daysUntilExam: number;
}

class StudentProfileGenerator {
  generateCohort(baseScore: number): StudentProfile[] {
    const profiles: StudentProfile[] = [];

    // 1. The "Standard" Student
    profiles.push({
      id: `std-${baseScore.toFixed(2)}`,
      archetype: "Standard",
      avg_quiz_score: baseScore,
      attempts_per_topic: 2,
      days_since_last_revision: 3,
      quiz_score_variance: 0.1,
      time_spent_per_question: 45, // seconds
      daysUntilExam: 14,
    });

    // 2. The "Slow Pacer" / Perfectionist (Same score, but takes longer)
    profiles.push({
      id: `slow-${baseScore.toFixed(2)}`,
      archetype: "Slow Pacer",
      avg_quiz_score: baseScore,
      attempts_per_topic: 1, // Get it right first time usually
      days_since_last_revision: 5,
      quiz_score_variance: 0.05, // Consistent
      time_spent_per_question: 120, // Long time
      daysUntilExam: 14,
    });

    // 3. The "Fast Pacer" / Guesser (Same score, but fast)
    profiles.push({
      id: `fast-${baseScore.toFixed(2)}`,
      archetype: "Fast Pacer",
      avg_quiz_score: baseScore,
      attempts_per_topic: 4, // Takes multiple tries
      days_since_last_revision: 2,
      quiz_score_variance: 0.2, // Erratic
      time_spent_per_question: 15, // Very fast
      daysUntilExam: 14,
    });

    // 4. The "Crammer" (Same score, but recent intense activity)
    profiles.push({
      id: `cram-${baseScore.toFixed(2)}`,
      archetype: "Crammer",
      avg_quiz_score: baseScore,
      attempts_per_topic: 5,
      days_since_last_revision: 0,
      quiz_score_variance: 0.15,
      time_spent_per_question: 30,
      daysUntilExam: 2, // Exam imminent
    });

    // 5. The "Consistent Reviewer" (Same score, but spaced out)
    profiles.push({
      id: `rev-${baseScore.toFixed(2)}`,
      archetype: "Consistent Reviewer",
      avg_quiz_score: baseScore,
      attempts_per_topic: 2,
      days_since_last_revision: 10, // Haven't seen it in a while
      quiz_score_variance: 0.08,
      time_spent_per_question: 50,
      daysUntilExam: 30,
    });

    return profiles;
  }
}

// ------------------------------------------------------------------
// 2. Pipeline Simulation & Analysis
// ------------------------------------------------------------------

interface PipelineResult {
  profile: StudentProfile;
  mlPrediction: {
    mastery_probability: number;
    confidence: number;
  };
  adkDecision: ADKDecision;
  intervention?: TeacherInterventionSignal | null;
  attentionRisk: string;
}

async function runPipeline() {
  console.log("🚀 Starting Fairness & Bias Cascade Audit...");

  const generator = new StudentProfileGenerator();
  const results: PipelineResult[] = [];

  // Generate cohorts across performance bands
  const scoreLevels = [0.3, 0.5, 0.7, 0.9];

  for (const score of scoreLevels) {
    const cohort = generator.generateCohort(score);

    for (const profile of cohort) {
      // 1. ML Prediction
      // Note: We need to handle potential failures if ML bridge isn't perfect,
      // but assuming environment is set up.
      let prediction;
      try {
        prediction = await predictMastery({
          avg_quiz_score: profile.avg_quiz_score,
          attempts_per_topic: profile.attempts_per_topic,
          days_since_last_revision: profile.days_since_last_revision,
          quiz_score_variance: profile.quiz_score_variance,
          time_spent_per_question: profile.time_spent_per_question
        });
      } catch (e) {
        console.error(`ML Prediction failed for ${profile.id}:`, e);
        prediction = { mastery_probability: 0, confidence: 0, predicted_class: "error" };
      }

      // 2. Derive Signals (Heuristic for Attention Risk)
      // Simulating a separate "Attention Model"
      let attention_risk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
      if (profile.time_spent_per_question < 20 && profile.attempts_per_topic > 3) {
        attention_risk = "HIGH"; // Fast guessing
      } else if (profile.days_since_last_revision > 14) {
        attention_risk = "MEDIUM"; // Disengagement
      }

      const mlSignals: MLSignals = {
        mastery_probability: prediction.mastery_probability,
        confidence: prediction.confidence,
        days_since_last_revision: profile.days_since_last_revision,
        attempts_count: profile.attempts_per_topic * 5, // Approximate total attempts
        attention_risk: attention_risk,
        days_until_forget: profile.avg_quiz_score > 0.6 ? 20 : 5, // Simple heuristic
        dropout_probability: attention_risk === "HIGH" ? 0.8 : 0.1,
      };

      // 3. ADK Decision
      const context: DecisionContext = {
        studentId: profile.id,
        topic: "Algebra 101",
        currentDate: new Date(),
        daysUntilExam: profile.daysUntilExam,
        mlSignals: mlSignals,
      };

      const decision = makeRevisionDecision(context);
      const intervention = makeInterventionDecision(context);

      results.push({
        profile,
        mlPrediction: prediction,
        adkDecision: decision,
        intervention,
        attentionRisk: attention_risk,
      });
    }
  }

  // ------------------------------------------------------------------
  // 3. Fairness Analysis & Reporting
  // ------------------------------------------------------------------

  let report = "# Fairness & Bias Cascade Report\n\n";
  report += "Analysis of ML predictions, ADK decisions, and LLM contexts across behavioral archetypes.\n\n";

  // A. Outcome Disparity Matrix
  report += "## 1. Outcome Disparity Matrix\n";
  report += "Comparing outcomes for students with **identical quiz scores** but different behaviors.\n\n";

  for (const score of scoreLevels) {
    report += `### Cohort: Score ${score.toFixed(1)}\n`;
    report += "| Archetype | Mastery Prob | Attention Risk | ADK Action | Priority | LLM Tone | LLM Strategy |\n";
    report += "|---|---|---|---|---|---|---|\n";

    const cohortResults = results.filter(r => r.profile.avg_quiz_score === score);

    // Check for disparities
    const baseProb = cohortResults.find(r => r.profile.archetype === "Standard")?.mlPrediction.mastery_probability || 0;

    for (const res of cohortResults) {
      const probDiff = res.mlPrediction.mastery_probability - baseProb;
      const probStr = `${res.mlPrediction.mastery_probability.toFixed(3)} (${probDiff > 0 ? '+' : ''}${probDiff.toFixed(3)})`;

      report += `| ${res.profile.archetype} | ${probStr} | ${res.attentionRisk} | ${res.adkDecision.action} | ${res.adkDecision.priority} | ${res.adkDecision.llmContext.tone} | ${res.adkDecision.llmContext.strategy} |\n`;
    }
    report += "\n";
  }

  // B. False Positive Rate Analysis
  report += "## 2. Attention Risk False Positive Rate\n";
  report += "Identifying high-performing students (Score >= 0.7) flagged as 'At Risk'.\n\n";

  const highPerformers = results.filter(r => r.profile.avg_quiz_score >= 0.7);
  const falsePositives = highPerformers.filter(r => r.attentionRisk === "HIGH" || r.adkDecision.priority === "HIGH");

  if (falsePositives.length > 0) {
    report += `**Found ${falsePositives.length} high-performing students flagged with HIGH priority/risk:**\n\n`;
    falsePositives.forEach(fp => {
      report += `- **${fp.profile.archetype}** (Score: ${fp.profile.avg_quiz_score}): Flagged due to ${fp.adkDecision.reasoning}\n`;
    });
  } else {
    report += "No false positives detected among high performers.\n";
  }
  report += "\n";

  // C. Intervention Bias
  report += "## 3. Intervention Suggestion Disparity\n";
  report += "Analyzing if certain behaviors trigger interventions disproportionately.\n\n";

  const interventions = results.filter(r => r.intervention);
  report += `Total Interventions Triggered: ${interventions.length}\n\n`;

  if (interventions.length > 0) {
    report += "| Archetype | Score | Severity | Reason |\n";
    report += "|---|---|---|---|\n";
    interventions.forEach(i => {
      report += `| ${i.profile.archetype} | ${i.profile.avg_quiz_score} | ${i.intervention?.severity} | ${i.intervention?.reason} |\n`;
    });
  }
  report += "\n";

  // D. Explanation Quality/Tone Parity
  report += "## 4. Explanation Quality Parity (LLM Context Audit)\n";
  report += "Checking if LLM instructions differ for valid learning styles.\n\n";

  // Compare "Slow Pacer" vs "Fast Pacer" at same score
  const slowPacers = results.filter(r => r.profile.archetype === "Slow Pacer");
  const fastPacers = results.filter(r => r.profile.archetype === "Fast Pacer");

  let disparityFound = false;

  for (let i = 0; i < slowPacers.length; i++) {
    const slow = slowPacers[i];
    const fast = fastPacers.find(f => f.profile.avg_quiz_score === slow.profile.avg_quiz_score);

    if (fast && (slow.adkDecision.llmContext.tone !== fast.adkDecision.llmContext.tone || slow.adkDecision.llmContext.difficulty !== fast.adkDecision.llmContext.difficulty)) {
      disparityFound = true;
      report += `### Disparity at Score ${slow.profile.avg_quiz_score}:\n`;
      report += `- **Slow Pacer**: Tone=${slow.adkDecision.llmContext.tone}, Diff=${slow.adkDecision.llmContext.difficulty}\n`;
      report += `- **Fast Pacer**: Tone=${fast.adkDecision.llmContext.tone}, Diff=${fast.adkDecision.llmContext.difficulty}\n`;
      report += `  *Potential Bias:* System treats speed differences as proficiency differences.\n\n`;
    }
  }

  if (!disparityFound) {
    report += "No systematic tone/difficulty disparities found between Fast and Slow pacers.\n";
  }

  // E. Forgetting Curve Universality Test
  report += "## 5. Forgetting Curve Universality Test\n";
  report += "Testing if the system's forgetting assumptions fit all learning styles.\n\n";

  // Compare Standard vs Consistent Reviewer (same score, different gap)
  const consistentReviewers = results.filter(r => r.profile.archetype === "Consistent Reviewer");
  let forgettingBiasFound = false;

  for (const reviewer of consistentReviewers) {
    const standard = results.find(r => r.profile.archetype === "Standard" && r.profile.avg_quiz_score === reviewer.profile.avg_quiz_score);
    if (standard) {
      const reviewerProb = reviewer.mlPrediction.mastery_probability;
      const standardProb = standard.mlPrediction.mastery_probability;

      // If reviewer is penalized more than 20% for the time gap despite same quiz score
      if (reviewerProb < standardProb * 0.8) {
        forgettingBiasFound = true;
        report += `- **Bias Detected at Score ${reviewer.profile.avg_quiz_score}**: 'Consistent Reviewer' (10 day gap) has mastery probability ${reviewerProb.toFixed(3)} vs 'Standard' (3 day gap) ${standardProb.toFixed(3)}.\n`;
        report += `  *Impact:* System assumes rapid decay for all students, potentially forcing unnecessary review for those with strong retention.\n`;
      }
    }
  }

  if (!forgettingBiasFound) {
    report += "No significant bias detected in forgetting curve assumptions across tested profiles.\n";
  }
  report += "\n";

  // F. Dynamic Recommendations
  report += "## 6. Recommendations\n";
  report += "Based on the audit findings:\n\n";

  if (falsePositives.length > 0) {
    report += "1. **Calibrate Attention Risk**: High-performing 'Fast Pacers' are being flagged as 'High Risk'. Ensure `attention_risk` logic accounts for high mastery.\n";
  }

  if (disparityFound) {
    report += "2. **Tone Consistency**: Detected tone disparities for 'Fast Pacer' vs 'Slow Pacer'. Ensure speed does not dictate the 'Supportive' vs 'Neutral' tone of explanations.\n";
  }

  if (forgettingBiasFound) {
    report += "3. **Personalize Forgetting Parameters**: The system penalizes 'Consistent Reviewers' with longer gaps between sessions. Consider using a personalized decay rate rather than a global one.\n";
  }

  if (results.some(r => r.attentionRisk === "HIGH" && r.profile.avg_quiz_score > 0.6)) {
     report += "4. **Normalize Time-Based Features**: `time_spent_per_question` triggers risk flags even for successful students. Normalize against student's personal history.\n";
  }

  report += "\n*Note: LLM analysis is based on ADK Prompt Context instructions. Actual generated text was not sampled to avoid API costs, but instruction disparity is a strong proxy for output bias.*\n";

  // Write Report
  fs.writeFileSync("FAIRNESS_BIAS_CASCADE_REPORT.md", report);
  console.log("✅ Report generated: FAIRNESS_BIAS_CASCADE_REPORT.md");

  // Force exit to close any lingering ML bridge processes
  process.exit(0);
}

runPipeline().catch(console.error);
