module.exports = {

"[project]/.next-internal/server/app/api/intelligence/student/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/@opentelemetry/api [external] (@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("@opentelemetry/api", () => require("@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/src/ml/features/student_features.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/**
 * Feature Engineering for Student Learning Analytics
 *
 * Extracts ML-ready features from raw student interaction data.
 * These features feed into the Topic Mastery, Forgetting Curve, and Attention Risk models.
 */ __turbopack_context__.s({
    "extractAttentionFeatures": (()=>extractAttentionFeatures),
    "extractMasteryFeatures": (()=>extractMasteryFeatures),
    "featuresToArray": (()=>featuresToArray)
});
function extractMasteryFeatures(topic, history) {
    const topicQuizzes = history.quizResults.filter((r)=>r.topic === topic);
    if (topicQuizzes.length === 0) {
        // Default features for new topics
        return {
            avg_quiz_score: 0,
            attempts_per_topic: 0,
            days_since_last_revision: 999,
            quiz_score_variance: 0,
            time_spent_per_question: 0
        };
    }
    // Calculate avg_quiz_score
    const scores = topicQuizzes.map((q)=>q.score);
    const avg_quiz_score = scores.reduce((sum, score)=>sum + score, 0) / scores.length;
    // Calculate attempts_per_topic
    const attempts_per_topic = topicQuizzes.length;
    // Calculate days_since_last_revision
    const lastQuiz = topicQuizzes.sort((a, b)=>b.timestamp.getTime() - a.timestamp.getTime())[0];
    const days_since_last_revision = Math.floor((Date.now() - lastQuiz.timestamp.getTime()) / (1000 * 60 * 60 * 24));
    // Calculate quiz_score_variance
    const mean = avg_quiz_score;
    const variance = scores.reduce((sum, score)=>sum + Math.pow(score - mean, 2), 0) / scores.length;
    const quiz_score_variance = Math.sqrt(variance);
    // Calculate time_spent_per_question
    const totalTime = topicQuizzes.reduce((sum, q)=>sum + q.timeSpent, 0);
    const totalQuestions = topicQuizzes.reduce((sum, q)=>sum + q.questionsAttempted, 0);
    const time_spent_per_question = totalQuestions > 0 ? totalTime / totalQuestions : 0;
    return {
        avg_quiz_score,
        attempts_per_topic,
        days_since_last_revision,
        quiz_score_variance,
        time_spent_per_question
    };
}
function extractAttentionFeatures(history) {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    // Session frequency (quizzes taken in last week)
    const recentQuizzes = history.quizResults.filter((r)=>r.timestamp.getTime() > oneWeekAgo);
    const session_frequency = recentQuizzes.length;
    // Average session duration (avg time per quiz)
    const avg_session_duration = recentQuizzes.length > 0 ? recentQuizzes.reduce((sum, q)=>sum + q.timeSpent, 0) / recentQuizzes.length / 60 : 0;
    // Quiz completion rate (assumed all completed for now - would need start/finish tracking)
    const quiz_completion_rate = 1.0;
    // Days inactive
    const lastActivity = history.quizResults.sort((a, b)=>b.timestamp.getTime() - a.timestamp.getTime())[0];
    const days_inactive = lastActivity ? Math.floor((now - lastActivity.timestamp.getTime()) / (1000 * 60 * 60 * 24)) : 999;
    // Performance trend (compare last 3 quizzes to previous 3)
    let performance_trend = 0;
    if (history.quizResults.length >= 6) {
        const sorted = [
            ...history.quizResults
        ].sort((a, b)=>b.timestamp.getTime() - a.timestamp.getTime());
        const recent3 = sorted.slice(0, 3).map((q)=>q.score);
        const previous3 = sorted.slice(3, 6).map((q)=>q.score);
        const recentAvg = recent3.reduce((s, v)=>s + v, 0) / 3;
        const previousAvg = previous3.reduce((s, v)=>s + v, 0) / 3;
        if (recentAvg > previousAvg + 0.1) performance_trend = 1;
        else if (recentAvg < previousAvg - 0.1) performance_trend = -1;
    }
    return {
        session_frequency,
        avg_session_duration,
        quiz_completion_rate,
        days_inactive,
        performance_trend
    };
}
function featuresToArray(features) {
    return [
        features.avg_quiz_score,
        features.attempts_per_topic,
        features.days_since_last_revision,
        features.quiz_score_variance,
        features.time_spent_per_question
    ];
}
}}),
"[externals]/child_process [external] (child_process, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}}),
"[externals]/path [external] (path, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}}),
"[project]/src/ml/inference/ml-bridge.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/**
 * ML Bridge - Node.js to Python Inference
 * 
 * Spawns Python subprocess to run ML inference and returns predictions.
 * This allows the Next.js app to leverage Python ML models.
 */ __turbopack_context__.s({
    "batchPredictMastery": (()=>batchPredictMastery),
    "predictMastery": (()=>predictMastery)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
const PYTHON_SCRIPT_PATH = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "src", "ml", "inference", "predict_mastery.py");
async function predictMastery(features) {
    return new Promise((resolve, reject)=>{
        // Spawn Python process
        const pythonProcess = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["spawn"])("python", [
            PYTHON_SCRIPT_PATH
        ]);
        let outputData = "";
        let errorData = "";
        // Collect stdout
        pythonProcess.stdout.on("data", (data)=>{
            outputData += data.toString();
        });
        // Collect stderr
        pythonProcess.stderr.on("data", (data)=>{
            errorData += data.toString();
        });
        // Handle process completion
        pythonProcess.on("close", (code)=>{
            if (code !== 0) {
                console.error("Python inference error:", errorData);
                reject(new Error(`Python process exited with code ${code}: ${errorData}`));
                return;
            }
            try {
                const result = JSON.parse(outputData);
                resolve(result);
            } catch (parseError) {
                reject(new Error(`Failed to parse Python output: ${outputData}`));
            }
        });
        // Send input to Python via stdin
        pythonProcess.stdin.write(JSON.stringify(features));
        pythonProcess.stdin.end();
        // Set timeout (prevent hanging)
        setTimeout(()=>{
            pythonProcess.kill();
            reject(new Error("ML inference timeout after 5 seconds"));
        }, 5000);
    });
}
async function batchPredictMastery(topicFeatures) {
    const predictions = await Promise.all(topicFeatures.map(async ({ topic, features })=>{
        try {
            const prediction = await predictMastery(features);
            return {
                topic,
                prediction
            };
        } catch (error) {
            console.error(`Failed to predict mastery for ${topic}:`, error);
            return {
                topic,
                prediction: {
                    mastery_probability: 0,
                    confidence: 0,
                    predicted_class: "error",
                    error: error instanceof Error ? error.message : "Unknown error"
                }
            };
        }
    }));
    return predictions;
}
}}),
"[project]/src/ai/adk/types.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/**
 * ADK (Agent Decision Kit) Type Definitions
 * 
 * Defines the interfaces for the policy-driven decision layer.
 * ADK consumes ML predictions and makes orchestration decisions.
 */ /**
 * ML Signals - Aggregated predictions from ML models
 */ __turbopack_context__.s({
    "ContentStrategy": (()=>ContentStrategy),
    "DecisionAction": (()=>DecisionAction)
});
var DecisionAction = /*#__PURE__*/ function(DecisionAction) {
    // Revision decisions
    DecisionAction["URGENT_REVISION"] = "URGENT_REVISION";
    DecisionAction["SCHEDULED_REVISION"] = "SCHEDULED_REVISION";
    DecisionAction["PROGRESS_ALLOWED"] = "PROGRESS_ALLOWED";
    // Intervention decisions
    DecisionAction["TEACHER_ALERT"] = "TEACHER_ALERT";
    DecisionAction["ADAPTIVE_TEACHING"] = "ADAPTIVE_TEACHING";
    DecisionAction["MOTIVATIONAL_SUPPORT"] = "MOTIVATIONAL_SUPPORT";
    // Content decisions
    DecisionAction["SKIP_TOPIC"] = "SKIP_TOPIC";
    DecisionAction["CHALLENGE_MODE"] = "CHALLENGE_MODE";
    return DecisionAction;
}({});
var ContentStrategy = /*#__PURE__*/ function(ContentStrategy) {
    // Based on attention/mastery
    ContentStrategy["SHORT_FORM"] = "SHORT_FORM";
    ContentStrategy["DEEP_DIVE"] = "DEEP_DIVE";
    ContentStrategy["INTERACTIVE"] = "INTERACTIVE";
    ContentStrategy["MOTIVATIONAL"] = "MOTIVATIONAL";
    ContentStrategy["CHALLENGE"] = "CHALLENGE";
    ContentStrategy["REMEDIAL"] = "REMEDIAL";
    return ContentStrategy;
}({});
}}),
"[project]/src/ai/adk/decision-engine.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/**
 * ADK Decision Engine
 * 
 * Policy-driven orchestration layer that decides WHEN and HOW to use ML and LLM.
 * This replaces ad-hoc decision logic with explicit, auditable policies.
 */ __turbopack_context__.s({
    "logDecision": (()=>logDecision),
    "makeInterventionDecision": (()=>makeInterventionDecision),
    "makeRevisionDecision": (()=>makeRevisionDecision),
    "selectContentStrategy": (()=>selectContentStrategy)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/adk/types.ts [app-route] (ecmascript)");
;
function makeRevisionDecision(context) {
    const { mlSignals, daysUntilExam } = context;
    const { mastery_probability, days_since_last_revision, attention_risk } = mlSignals;
    // POLICY RULE 1: Critical Mastery + Imminent Forgetting
    if (mastery_probability < 0.4 && (mlSignals.days_until_forget ?? 999) < 3) {
        return {
            action: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DecisionAction"].URGENT_REVISION,
            priority: "HIGH",
            contentStrategy: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].SHORT_FORM,
            reasoning: "Low mastery with imminent forgetting risk",
            adkFlags: [
                "URGENT_REVISION",
                "FORGETTING_RISK"
            ],
            llmContext: {
                strategy: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].SHORT_FORM,
                targetDuration: "5-MIN",
                tone: "MOTIVATING",
                includeExamples: true,
                includeVisuals: false,
                difficulty: "BASIC"
            }
        };
    }
    // POLICY RULE 2: Low Mastery + High Attention Risk
    if (mastery_probability < 0.4 && attention_risk === "HIGH") {
        return {
            action: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DecisionAction"].ADAPTIVE_TEACHING,
            priority: "HIGH",
            contentStrategy: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].INTERACTIVE,
            reasoning: "Low mastery with attention challenges - needs engaging format",
            adkFlags: [
                "ADAPTIVE_TEACHING",
                "ATTENTION_RISK"
            ],
            llmContext: {
                strategy: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].INTERACTIVE,
                targetDuration: "2-MIN",
                tone: "MOTIVATING",
                includeExamples: true,
                includeVisuals: true,
                difficulty: "BASIC"
            }
        };
    }
    // POLICY RULE 3: Moderate Mastery + Stale Knowledge
    if (mastery_probability >= 0.4 && mastery_probability < 0.6 && days_since_last_revision > 7) {
        return {
            action: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DecisionAction"].SCHEDULED_REVISION,
            priority: "MEDIUM",
            contentStrategy: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].DEEP_DIVE,
            reasoning: "Moderate mastery but needs refreshing (spaced repetition)",
            adkFlags: [
                "SPACED_REPETITION"
            ],
            llmContext: {
                strategy: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].DEEP_DIVE,
                targetDuration: "10-MIN",
                tone: "NEUTRAL",
                includeExamples: true,
                includeVisuals: false,
                difficulty: "INTERMEDIATE"
            }
        };
    }
    // POLICY RULE 4: High Mastery + Recent Revision
    if (mastery_probability >= 0.7 && days_since_last_revision <= 14) {
        return {
            action: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DecisionAction"].PROGRESS_ALLOWED,
            priority: "LOW",
            contentStrategy: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].CHALLENGE,
            reasoning: "Strong mastery - ready for advanced content",
            adkFlags: [
                "MASTERY_ACHIEVED"
            ],
            llmContext: {
                strategy: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].CHALLENGE,
                targetDuration: "15-MIN",
                tone: "CHALLENGING",
                includeExamples: false,
                includeVisuals: false,
                difficulty: "ADVANCED"
            }
        };
    }
    // POLICY RULE 5: Exam Cramming Mode (< 3 days to exam)
    if (daysUntilExam && daysUntilExam <= 3 && mastery_probability < 0.6) {
        return {
            action: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DecisionAction"].URGENT_REVISION,
            priority: "HIGH",
            contentStrategy: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].SHORT_FORM,
            reasoning: "Exam imminent - high-yield cramming strategy",
            adkFlags: [
                "CRAMMING_MODE",
                "EXAM_IMMINENT"
            ],
            llmContext: {
                strategy: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].SHORT_FORM,
                targetDuration: "5-MIN",
                tone: "SUPPORTIVE",
                includeExamples: true,
                includeVisuals: true,
                difficulty: "BASIC"
            }
        };
    }
    // DEFAULT: Scheduled revision
    return {
        action: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DecisionAction"].SCHEDULED_REVISION,
        priority: "MEDIUM",
        contentStrategy: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].DEEP_DIVE,
        reasoning: "Routine revision recommended",
        adkFlags: [
            "ROUTINE_REVISION"
        ],
        llmContext: {
            strategy: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].DEEP_DIVE,
            targetDuration: "10-MIN",
            tone: "NEUTRAL",
            includeExamples: true,
            includeVisuals: false,
            difficulty: "INTERMEDIATE"
        }
    };
}
function makeInterventionDecision(context) {
    const { studentId, topic, mlSignals } = context;
    const { mastery_probability, attention_risk, days_since_last_revision } = mlSignals;
    // INTERVENTION RULE 1: Critical Risk (multiple red flags)
    if (mastery_probability < 0.3 && attention_risk === "HIGH" && days_since_last_revision > 10) {
        return {
            studentId,
            studentName: `Student ${studentId}`,
            topic,
            severity: "CRITICAL",
            reason: "Multiple risk factors: Very low mastery, high attention risk, prolonged inactivity",
            suggestedAction: "Immediate 1-on-1 intervention required. Consider individualized learning plan.",
            mlSignals,
            timestamp: new Date()
        };
    }
    // INTERVENTION RULE 2: High Attention Risk
    if (attention_risk === "HIGH" && (mlSignals.dropout_probability ?? 0) > 0.6) {
        return {
            studentId,
            studentName: `Student ${studentId}`,
            topic,
            severity: "HIGH",
            reason: "High dropout risk detected",
            suggestedAction: "Engage student with personalized motivation. Consider gamification or peer learning.",
            mlSignals,
            timestamp: new Date()
        };
    }
    // INTERVENTION RULE 3: Persistent Low Mastery
    if (mastery_probability < 0.4 && mlSignals.attempts_count > 5) {
        return {
            studentId,
            studentName: `Student ${studentId}`,
            topic,
            severity: "MEDIUM",
            reason: "Repeated attempts without improvement",
            suggestedAction: "Topic may require different teaching approach. Consider alternative explanations or remedial support.",
            mlSignals,
            timestamp: new Date()
        };
    }
    // No intervention needed
    return null;
}
function selectContentStrategy(decision) {
    const { contentStrategy, llmContext } = decision;
    const strategyDescriptions = {
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].SHORT_FORM]: "Brief, focused explanation with quick wins. Use simple language and immediate examples.",
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].DEEP_DIVE]: "Comprehensive explanation with multiple perspectives. Include edge cases and nuances.",
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].INTERACTIVE]: "Engaging, question-driven format. Use analogies, visuals, and check understanding frequently.",
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].MOTIVATIONAL]: "Encouraging tone focused on building confidence. Celebrate small wins and provide reassurance.",
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].CHALLENGE]: "Advanced problems and thought-provoking questions. Push boundaries and explore implications.",
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ContentStrategy"].REMEDIAL]: "Back to fundamentals. Break down into smallest components and build from scratch."
    };
    return `
Content Strategy: ${strategyDescriptions[contentStrategy]}

Constraints:
- Target Duration: ${llmContext.targetDuration}
- Tone: ${llmContext.tone}
- Difficulty Level: ${llmContext.difficulty}
- Include Examples: ${llmContext.includeExamples ? "Yes" : "No"}
- Include Visuals: ${llmContext.includeVisuals ? "Yes (describe diagrams)" : "No"}
  `.trim();
}
function logDecision(context, decision) {
    console.log("[ADK Decision]", {
        timestamp: new Date().toISOString(),
        studentId: context.studentId,
        topic: context.topic,
        action: decision.action,
        priority: decision.priority,
        strategy: decision.contentStrategy,
        flags: decision.adkFlags,
        mlSignals: {
            mastery: context.mlSignals.mastery_probability,
            attention: context.mlSignals.attention_risk
        }
    });
}
}}),
"[project]/src/app/api/intelligence/student/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/**
 * Student Intelligence API
 * 
 * Unified endpoint that frontend calls to get ML + ADK intelligence.
 * Route: /api/intelligence/student
 */ __turbopack_context__.s({
    "GET": (()=>GET)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ml$2f$features$2f$student_features$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ml/features/student_features.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ml$2f$inference$2f$ml$2d$bridge$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ml/inference/ml-bridge.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$decision$2d$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/adk/decision-engine.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/adk/types.ts [app-route] (ecmascript)");
;
;
;
;
;
async function GET(request) {
    try {
        // Extract student ID from query params
        const searchParams = request.nextUrl.searchParams;
        const studentId = searchParams.get("studentId") || "demo_student";
        // TODO: In production, fetch from database
        // For now, use mock data to demonstrate the system
        const studentHistory = {
            studentId,
            quizResults: [
                {
                    topic: "Algebra",
                    score: 0.35,
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    timeSpent: 180,
                    questionsAttempted: 10
                },
                {
                    topic: "Algebra",
                    score: 0.40,
                    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                    timeSpent: 200,
                    questionsAttempted: 10
                },
                {
                    topic: "Geometry",
                    score: 0.75,
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    timeSpent: 150,
                    questionsAttempted: 10
                },
                {
                    topic: "Calculus",
                    score: 0.55,
                    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                    timeSpent: 240,
                    questionsAttempted: 10
                }
            ],
            lastLoginDate: new Date(),
            registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        };
        // Get unique topics
        const topics = [
            ...new Set(studentHistory.quizResults.map((r)=>r.topic))
        ];
        // Process each topic through ML → ADK pipeline
        const mastery = {};
        const allAdkFlags = [];
        let highestUrgency = "NONE";
        let overallAttentionRisk = "LOW";
        for (const topic of topics){
            // Step 1: Extract features
            const features = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ml$2f$features$2f$student_features$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractMasteryFeatures"])(topic, studentHistory);
            // Step 2: ML prediction
            const mlPrediction = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ml$2f$inference$2f$ml$2d$bridge$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["predictMastery"])({
                avg_quiz_score: features.avg_quiz_score,
                attempts_per_topic: features.attempts_per_topic,
                days_since_last_revision: features.days_since_last_revision,
                quiz_score_variance: features.quiz_score_variance,
                time_spent_per_question: features.time_spent_per_question
            });
            // Step 3: Build ML signals
            const mlSignals = {
                mastery_probability: mlPrediction.mastery_probability,
                confidence: mlPrediction.confidence,
                days_since_last_revision: features.days_since_last_revision,
                attempts_count: features.attempts_per_topic,
                attention_risk: mlPrediction.mastery_probability < 0.4 ? "HIGH" : "LOW"
            };
            // Step 4: ADK decision
            const adkDecision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$decision$2d$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["makeRevisionDecision"])({
                studentId,
                topic,
                currentDate: new Date(),
                mlSignals
            });
            // Update aggregate state
            if (adkDecision.action === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DecisionAction"].URGENT_REVISION) {
                highestUrgency = "URGENT";
            } else if (highestUrgency !== "URGENT" && adkDecision.action === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$adk$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DecisionAction"].SCHEDULED_REVISION) {
                highestUrgency = "SCHEDULED";
            }
            if (mlSignals.attention_risk === "HIGH") {
                overallAttentionRisk = "HIGH";
            }
            allAdkFlags.push(...adkDecision.adkFlags);
            // Store mastery signal
            mastery[topic] = {
                score: mlPrediction.mastery_probability,
                confidence: mlPrediction.confidence,
                daysSinceRevision: features.days_since_last_revision,
                attempts: features.attempts_per_topic,
                trend: "STABLE",
                needsRevision: adkDecision.priority !== "LOW",
                priority: adkDecision.priority
            };
        }
        // Determine ADK mode
        const adkMode = highestUrgency === "URGENT" ? "SHORT_REVISION_MODE" : overallAttentionRisk === "HIGH" ? "ASSESSMENT_MODE" : "PROGRESS_MODE";
        // Generate reasoning
        const reasoning = [];
        if (highestUrgency === "URGENT") {
            reasoning.push("Multiple topics require urgent revision");
        }
        if (overallAttentionRisk === "HIGH") {
            reasoning.push("Showing signs of attention fatigue");
        }
        if (allAdkFlags.includes("SPACED_REPETITION")) {
            reasoning.push("Spaced repetition recommended for retention");
        }
        // Build response
        const intelligence = {
            mastery,
            attentionRisk: overallAttentionRisk,
            revisionUrgency: highestUrgency,
            adkDecision: adkMode,
            confidence: "MEDIUM",
            generatedAt: new Date().toISOString(),
            studentId,
            reasoning: reasoning.length > 0 ? reasoning : [
                "Learning on track"
            ],
            flags: allAdkFlags
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(intelligence);
    } catch (error) {
        console.error("Error generating student intelligence:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to generate student intelligence"
        }, {
            status: 500
        });
    }
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__59936443._.js.map