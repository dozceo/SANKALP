# SANKALP — ARCHITECTURE SKELETON

> **Scope**: Core working model only. No UI, no design, no marketing.
> Combines: current production codebase + Core Block Upgrade plan + vision architecture.

---

## 0. ONE-LINE THESIS

A **three-layer intelligence pipeline** that converts raw student interaction signals into adaptive, explainable learning interventions by chaining ML prediction → policy-driven decision → LLM content generation inside a closed feedback loop.

---

## 1. SYSTEM-LEVEL BLOCK DIAGRAM

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         SIGNAL CAPTURE LAYER                            │
│  Quiz results · Session events · Time-on-task · Login cadence · Chat    │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │ raw interaction data
                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      FEATURE ENGINEERING LAYER                          │
│                                                                         │
│  CURRENT (5 features)              UPGRADE (40+ features)               │
│  ─────────────────────             ───────────────────────              │
│  avg_quiz_score                    + recent_quiz_score (last 3)         │
│  quiz_score_variance               + score_improvement_rate             │
│  days_since_last_revision          + score_skewness                    │
│  attempts_per_topic                + correct_first_attempt_rate         │
│  time_spent_per_question           + retention_decay_rate              │
│                                    + spaced_repetition_score           │
│                                    + forgetting_index                  │
│                                    + session_frequency                 │
│                                    + avg_session_duration              │
│                                    + quiz_completion_rate              │
│                                    + days_inactive                     │
│                                    + time_of_day_consistency           │
│                                    + help_seeking_frequency            │
│                                    + re_attempts_after_wrong           │
│                                    + study_pattern_regularity          │
│                                    + learning_curve_steepness          │
│                                    + self_assessment_accuracy          │
│                                    + peer_comparison_quartile          │
│                                    + conceptual_vs_procedural_ratio    │
│                                    + error_correction_pattern          │
│                                    + (20 more cognitive/meta features) │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │ feature vectors
                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         ML PREDICTION LAYER                             │
│                                                                         │
│  ┌─────────────────────┐  ┌────────────────────┐  ┌──────────────────┐ │
│  │  MASTERY MODEL       │  │  FORGETTING MODEL   │  │ ATTENTION MODEL  │ │
│  │                      │  │                     │  │                  │ │
│  │  CURRENT:            │  │  CURRENT:           │  │ CURRENT:         │ │
│  │  Logistic Regression │  │  Mathematical only  │  │ Planned          │ │
│  │  91.25% accuracy     │  │  R = e^(-t/S)       │  │                  │ │
│  │  5 features          │  │  No trained model   │  │                  │ │
│  │                      │  │                     │  │                  │ │
│  │  UPGRADE:            │  │  UPGRADE:           │  │ UPGRADE:         │ │
│  │  Ensemble voting     │  │  Gradient Boosting  │  │ XGBoost          │ │
│  │  ├─ LightGBM (0.40)  │  │  + Ebbinghaus curve │  │ multi-class      │ │
│  │  ├─ XGBoost  (0.35)  │  │  + SM-2 spacing     │  │ LOW/MED/HIGH     │ │
│  │  └─ RandomForest(0.25)│  │                     │  │ + dropout_prob   │ │
│  │                      │  │                     │  │                  │ │
│  │  VISION:             │  │  VISION:            │  │ VISION:          │ │
│  │  Transformer (DKT)   │  │  Bayesian posterior │  │ Bayesian         │ │
│  │  + Bayesian uncert.  │  │  with uncertainty   │  │ hierarchical     │ │
│  └──────────┬───────────┘  └─────────┬───────────┘  └────────┬─────────┘ │
│             │                        │                       │           │
│             ▼                        ▼                       ▼           │
│         mastery_probability     days_until_forget       risk_level      │
│         confidence              retention_confidence    dropout_prob    │
│         predicted_class                                                 │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │ MLSignals
                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     ADK DECISION ENGINE LAYER                           │
│                                                                         │
│  Consumes: MLSignals + DecisionContext (exam date, student state)       │
│  Produces: ADKDecision (action + LLMContext)                            │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ POLICY RULE CHAIN (evaluated top-to-bottom, first match wins)   │   │
│  │                                                                  │   │
│  │ P0  EXAM CRAMMING                                               │   │
│  │     daysUntilExam ≤ 3  AND  mastery < 0.6                       │   │
│  │     → URGENT_REVISION · SHORT_FORM · 5min · SUPPORTIVE · BASIC  │   │
│  │                                                                  │   │
│  │ P1  CRITICAL MASTERY + FORGETTING RISK                          │   │
│  │     mastery < 0.4  AND  days_until_forget < 3                   │   │
│  │     → URGENT_REVISION · SHORT_FORM · 5min · MOTIVATING · BASIC  │   │
│  │                                                                  │   │
│  │ P2  LOW MASTERY + HIGH ATTENTION RISK                           │   │
│  │     mastery < 0.4  AND  attention_risk == HIGH                  │   │
│  │     → ADAPTIVE_TEACHING · INTERACTIVE · 2min · MOTIVATING       │   │
│  │                                                                  │   │
│  │ P3  MODERATE MASTERY + STALE KNOWLEDGE (spaced repetition)      │   │
│  │     0.4 ≤ mastery < 0.6  AND  days_since_revision > 7          │   │
│  │     → SCHEDULED_REVISION · DEEP_DIVE · 10min · NEUTRAL         │   │
│  │                                                                  │   │
│  │ P4  HIGH MASTERY + RECENT REVISION                              │   │
│  │     mastery ≥ 0.7  AND  days_since_revision ≤ 14               │   │
│  │     → PROGRESS_ALLOWED · CHALLENGE · 15min · CHALLENGING · ADV  │   │
│  │                                                                  │   │
│  │ DEFAULT                                                         │   │
│  │     → SCHEDULED_REVISION · DEEP_DIVE · 10min · NEUTRAL         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  UPGRADE: Multi-signal scoring (mastery score × urgency score ×        │
│  engagement score × velocity bonus × exam proximity factor × peer      │
│  percentile) replaces hard thresholds with continuous decision surface  │
│                                                                         │
│  VISION: Learned routing — historical success per student determines   │
│  which LLM + strategy + tone combination works best for that learner   │
│                                                                         │
│  SECONDARY OUTPUT: Teacher Intervention Signal                         │
│  if mastery < 0.3 + declining trend + high attention risk              │
│  → TEACHER_ALERT (severity, reason, suggested action)                  │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │ ADKDecision { action, LLMContext, reasoning }
                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      LLM GENERATION LAYER                               │
│                                                                         │
│  Engine: Google Genkit + Gemini 2.0 Flash                               │
│                                                                         │
│  Input:  ADKDecision.llmContext                                         │
│          { strategy, targetDuration, tone, difficulty,                  │
│            includeExamples, includeVisuals }                            │
│                                                                         │
│  GENKIT FLOWS (each a standalone AI function):                         │
│  ┌─────────────────────────────────────────────┐                       │
│  │ smart-revision-planner    ML-driven plans   │                       │
│  │ adaptive-quiz-engine      Dynamic quizzes   │                       │
│  │ multilingual-chatbot      Hindi/English     │                       │
│  │ custom-cognitive-chatbot  Personality-aware  │                       │
│  │ mindful-mentor            Counseling + mood  │                       │
│  │ syllabus-generator        Curriculum struct  │                       │
│  │ text-to-speech            Audio output       │                       │
│  │ speech-to-speech          Voice interaction  │                       │
│  └─────────────────────────────────────────────┘                       │
│                                                                         │
│  CURRENT: Single Gemini model, static prompt templates                 │
│                                                                         │
│  UPGRADE: Content strategy → prompt template mapping with dynamic      │
│  token budget (300–4000 tokens scaled by student mastery level)        │
│                                                                         │
│  VISION: Multi-model routing                                           │
│  ├─ DEEP_DIVE / conceptual → Claude (best for reasoning)              │
│  ├─ SHORT_FORM / CHALLENGE → GPT-4 (concise, quick)                   │
│  ├─ INTERACTIVE → Gemini (Socratic method, multimodal)                │
│  └─ MOTIVATIONAL → Fine-tuned model (empathy-optimized)               │
│                                                                         │
│  RAG: Retrieval-Augmented Generation for chatbot context               │
│  (syllabus docs → chunked → vector store → contextual retrieval)       │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │ generated content / quiz / plan
                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      OUTPUT CONTRACT LAYER                              │
│                                                                         │
│  StudentIntelligence {                                                  │
│    mastery:          Record<topic, MasterySignal>                       │
│    attentionRisk:    LOW | MEDIUM | HIGH                               │
│    revisionUrgency:  NONE | SCHEDULED | URGENT                        │
│    adkDecision:      SHORT_REVISION_MODE | DEEP_TEACHING               │
│                      | ASSESSMENT_MODE | PROGRESS_MODE                 │
│                      | INTERVENTION_REQUIRED                           │
│    confidence:       LOW | MEDIUM | HIGH                               │
│    reasoning:        string[]          ← explainability                │
│    flags:            string[]          ← audit trail                   │
│    generatedAt:      ISO8601                                           │
│  }                                                                      │
│                                                                         │
│  MasterySignal {                                                        │
│    score:            0.0–1.0           ← ML prediction                 │
│    confidence:       0.0–1.0           ← model certainty               │
│    daysSinceRevision: number           ← staleness                     │
│    attempts:         number            ← practice count                │
│    trend:            IMPROVING | STABLE | DECLINING                    │
│    needsRevision:    boolean                                           │
│    priority:         HIGH | MEDIUM | LOW                               │
│  }                                                                      │
│                                                                         │
│  PostQuizIntelligence {                                                 │
│    quizScore, topicMastery, recommendation                             │
│    { action: REVISE_NOW | PRACTICE_MORE | MOVE_FORWARD }               │
│  }                                                                      │
│                                                                         │
│  TeacherInterventionSignal {                                            │
│    studentId, severity, reason, suggestedAction, mlSignals             │
│  }                                                                      │
│                                                                         │
│  ClassAnalytics {                                                       │
│    totalStudents, atRiskCount, averageMastery, topicPerformance,       │
│    attentionDistribution, recentAlerts, weakTopics                     │
│  }                                                                      │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     FEEDBACK LOOP (CLOSED-LOOP)                         │
│                                                                         │
│  Student interacts with generated content                              │
│       │                                                                 │
│       ├─→ Quiz submitted → new quiz_result → Feature Extraction        │
│       ├─→ Session tracked → engagement signal → Attention features     │
│       ├─→ Chat questions → help-seeking metric → Cognitive features    │
│       └─→ Time-on-task → duration signal → Engagement features         │
│                                                                         │
│  All signals feed back into SIGNAL CAPTURE LAYER (top of pipeline)     │
│  Creating continuous refinement cycle:                                  │
│                                                                         │
│  Signal → Features → Predict → Decide → Generate → Interact → Signal  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ML SUBSYSTEM ARCHITECTURE

### 2.1 Current State — Single Logistic Regression

```
training_data.csv (2000 synthetic records, 5 features)
        │
        ▼
train_mastery_model.py
  ├─ StandardScaler (normalize)
  ├─ LogisticRegression(class_weight='balanced')
  ├─ 91.25% test accuracy
  └─ Feature importance: avg_quiz_score dominates (coef 13.24)
        │
        ▼
mastery_model.pkl (serialized via joblib)
        │
        ▼
predict_mastery.py (persistent Python subprocess)
  ├─ Reads JSON lines from stdin
  ├─ Returns {mastery_probability, confidence, predicted_class}
  └─ UUID-based request/response tracking
        │
        ▼
ml-bridge.ts (Node.js ↔ Python bridge)
  ├─ Spawns persistent child_process
  ├─ Circuit breaker pattern (fallback to heuristic)
  ├─ 10s timeout per prediction
  └─ Batch prediction support
```

### 2.2 Upgrade State — Multi-Model Ensemble

```
advanced_training_data.csv (5000+ records, 40+ features)
        │
        ▼
train_ensemble_models.py
  ├─ MODEL 1: Mastery Ensemble
  │     LightGBM  (weight 0.40) — fast, categorical handling
  │     XGBoost   (weight 0.35) — feature importance
  │     RandomForest (weight 0.25) — robust interpretability
  │     Output: weighted probability voting
  │
  ├─ MODEL 2: Forgetting Curve
  │     GradientBoosting trained on spacing data
  │     Integrates Ebbinghaus: R(t) = e^(-t/S)
  │     Output: days_until_forget, retention_confidence
  │
  └─ MODEL 3: Attention Risk
        XGBoost multi-class (3 classes: LOW/MEDIUM/HIGH)
        Features: session_frequency, duration, completion_rate,
                  days_inactive, performance_trend, submission_patterns
        Output: risk_level, dropout_probability
```

### 2.3 Vision State — Deep Learning + Bayesian

```
TRANSFORMER BRANCH (sequence modeling)
  ├─ StudentMasteryTransformer
  │     Input: quiz sequence embeddings (score, time, topic_id)
  │     Architecture: 4-layer encoder, 8 attention heads, d=256
  │     Positional encoding for temporal ordering
  │     Global avg pooling → sigmoid classification
  │     Based on: Deep Knowledge Tracing (Piech et al. 2015)
  │
  └─ Captures non-linear learning trajectories that
     ensemble models miss (pattern: "plateau then breakthrough")

BAYESIAN BRANCH (uncertainty quantification)
  ├─ Hierarchical model via PyMC
  │     Population priors: μ_student, σ_student, μ_topic, σ_topic
  │     Student random effects (individual ability)
  │     Topic random effects (intrinsic difficulty)
  │     Beta observation model for scores
  │     Output: posterior distribution, not point estimate
  │
  └─ When confidence interval is wide → ADK defaults to
     conservative decision (more revision, not less)
```

### 2.4 Spaced Repetition Algorithm

```
SUPERMEMO SM-2 INTEGRATION

EF = EF' + (0.1 − (5 − q) × (0.08 + (5 − q) × 0.02))

  Where:
    EF  = Easiness Factor (≥ 1.3)
    q   = quality score (0–5), derived from:
          avg_quiz_score × 0.4
          + (1 − normalized_reading_time) × 0.3
          + (1 − normalized_score_variance) × 0.3
          then scaled to 0–5

  Next review interval = previous_interval × EF
  Clamped to [1 day, 30 days]

EBBINGHAUS FORGETTING CURVE

  R(t) = e^(−t/S)

  Where:
    R(t) = retention probability at time t (days since last review)
    S    = memory strength (estimated per student-topic pair)

  When R(t) drops below threshold (0.5) → triggers revision signal
```

---

## 3. ADK DECISION ENGINE — FORMAL SPECIFICATION

### 3.1 Input Contract

```
DecisionContext {
  studentId:     string
  topic:         string
  currentDate:   Date
  examDate?:     Date
  daysUntilExam?: number
  mlSignals:     MLSignals
}

MLSignals {
  mastery_probability:     number [0.0, 1.0]     ← from Mastery Model
  confidence:              number [0.0, 1.0]     ← model certainty
  days_until_forget?:      number                ← from Forgetting Model
  retention_confidence?:   number [0.0, 1.0]
  attention_risk?:         LOW | MEDIUM | HIGH   ← from Attention Model
  dropout_probability?:    number [0.0, 1.0]
  days_since_last_revision: number
  attempts_count:          number
  performance_trend?:      IMPROVING | STABLE | DECLINING
}
```

### 3.2 Output Contract

```
ADKDecision {
  action:           DecisionAction enum
  priority:         HIGH | MEDIUM | LOW
  contentStrategy:  ContentStrategy enum
  reasoning:        string              ← explainability (human-readable)
  adkFlags:         string[]            ← audit trail tags
  llmContext:       LLMContext           ← instructions for LLM layer
}

DecisionAction enum {
  URGENT_REVISION        — immediate high-yield review
  SCHEDULED_REVISION     — spaced repetition schedule
  PROGRESS_ALLOWED       — advance to next topic
  TEACHER_ALERT          — notify teacher
  ADAPTIVE_TEACHING      — engaging format for at-risk
  MOTIVATIONAL_SUPPORT   — boost engagement
  SKIP_TOPIC             — mastery achieved, skip
  CHALLENGE_MODE         — advanced problems
}

ContentStrategy enum {
  SHORT_FORM     — quick wins, low attention budget
  DEEP_DIVE      — detailed exploration, high mastery
  INTERACTIVE    — engaging, low mastery + attention risk
  MOTIVATIONAL   — disengagement recovery
  CHALLENGE      — push boundaries for strong students
  REMEDIAL       — back to fundamentals
}

LLMContext {
  strategy:        ContentStrategy
  targetDuration:  2-MIN | 5-MIN | 10-MIN | 15-MIN
  tone:            MOTIVATING | CHALLENGING | SUPPORTIVE | NEUTRAL
  includeExamples: boolean
  includeVisuals:  boolean
  difficulty:      BASIC | INTERMEDIATE | ADVANCED
}
```

### 3.3 Policy Evaluation Order

```
P0  EXAM_CRAMMING           daysUntilExam ≤ 3  ∧  mastery < 0.6
P1  CRITICAL_FORGETTING     mastery < 0.4  ∧  days_until_forget < 3
P2  LOW_MASTERY_ATTENTION   mastery < 0.4  ∧  attention_risk == HIGH
P3  STALE_MODERATE          0.4 ≤ mastery < 0.6  ∧  days_since_revision > 7
P4  HIGH_MASTERY_RECENT     mastery ≥ 0.7  ∧  days_since_revision ≤ 14
D   DEFAULT                 (fallback: SCHEDULED_REVISION)
```

### 3.4 Upgrade — Continuous Scoring Model

Replaces binary threshold rules with weighted scoring:

```
mastery_score      = mastery_probability × 100
forget_urgency     = f(days_until_forget, inter_attempt_avg)
engagement_score   = g(session_frequency, duration, inactive_days, attention_risk)
velocity_bonus     = learning_velocity > 0.05 ? "challenge" : "reinforce"
exam_factor        = daysUntilExam < 7 ? "intensive" : "spaced"
peer_factor        = peer_comparison_quartile

composite_score → maps to decision region on continuous surface
```

### 3.5 Vision — Learned Routing

```
For each student, track:
  historicalSuccess {
    bestContentStrategy:     string
    bestTone:                motivating | challenging | supportive
    bestDuration:            brief | moderate | comprehensive
    averageComprehension:    number [0, 100]
    lastThreeSessions: [{ strategy, outcome: mastered | partial | failed }]
  }

Route decision not just by ML signals but by what has
historically worked for THIS specific learner.
```

---

## 4. INTELLIGENCE PIPELINE — FULL ORCHESTRATION

### 4.1 Request Flow (API: `/api/intelligence/student`)

```
1  Client requests StudentIntelligence (GET)
2  Server fetches student's quiz_results from Firestore
3  For each topic:
   3a  Check ml_predictions cache (1-hour TTL)
   3b  If cache miss → extractMasteryFeatures() → feature vector
   3c  Batch ML inference via ml-bridge.ts → Python subprocess
   3d  If ML service down → heuristic fallback:
       mastery = avg_quiz_score × 0.7 + (1 - score_variance) × 0.3
   3e  makeRevisionDecision(DecisionContext) → ADKDecision
   3f  Cache prediction to Firestore (async, non-blocking)
4  Aggregate per-topic decisions → overall StudentIntelligence
5  Write adk_decisions audit record (async)
6  Return StudentIntelligence JSON
```

### 4.2 Post-Quiz Flow

```
1  Quiz submitted → POST /api/quiz
2  Write quiz_result to Firestore
3  Re-extract features for affected topic
4  Re-run ML prediction (invalidates cache)
5  Generate PostQuizIntelligence:
   { quizScore, topicMastery, recommendation }
6  If recommendation.action == REVISE_NOW:
   → trigger smart-revision-planner Genkit flow
7  If teacher intervention threshold crossed:
   → makeInterventionDecision() → TeacherInterventionSignal
8  Return PostQuizIntelligence to client
```

---

## 5. DATA ARCHITECTURE

### 5.1 Firestore Collections

```
students/
  {studentId}/
    name, email, grade, board, subjects[], registrationDate,
    onboardingComplete, preferences { language, learningStyle }

teachers/
  {teacherId}/
    name, email, subjects[], classes[]

users/
  {userId}/
    role: "student" | "teacher" | "admin"
    linkedProfile: studentId | teacherId

quiz_results/
  {resultId}/
    studentId, topic, score [0–1], timeSpent (seconds),
    questionsAttempted, timestamp, answers[]

ml_predictions/                        ← cache layer
  {studentId}_{topic}/
    mastery_probability, confidence, predicted_class,
    features_used, model_version, generatedAt
    TTL: 1 hour

adk_decisions/                         ← audit trail
  {decisionId}/
    studentId, topic, action, priority, contentStrategy,
    reasoning, adkFlags[], mlSignals (snapshot), timestamp

classes/
  {classId}/
    name, teacherId, subject, grade

class_memberships/
  {membershipId}/
    classId, studentId, joinedAt

chat_sessions/ (planned)
  {sessionId}/
    studentId, messages[], context, createdAt
```

### 5.2 Data Flow Ownership

```
Signal Capture    →  quiz_results, activity_events
Feature Layer     →  computed at runtime (not persisted)
ML Layer          →  ml_predictions (cached)
ADK Layer         →  adk_decisions (audit log)
LLM Layer         →  generated content (ephemeral, not stored)
Feedback Loop     →  quiz_results (new entries close the loop)
```

---

## 6. GENKIT FLOW CATALOG

| Flow | Purpose | Input | Output |
|------|---------|-------|--------|
| `smart-revision-planner` | ML-driven revision schedules | topic, mastery, LLMContext | structured plan with steps |
| `adaptive-quiz-engine` | Dynamic difficulty quizzes | topic, mastery, difficulty | quiz questions + answers |
| `multilingual-cognitive-chatbot` | Hindi/English tutoring | message, history, language | response + detected language |
| `custom-cognitive-chatbot` | Personality-aware tutor | message, personality config | tailored response |
| `mindful-mentor` | Emotional support + mood detection | message, sentiment history | counseling response |
| `syllabus-generator` | Curriculum structure | subject, board, grade | structured syllabus |
| `text-to-speech` | Audio output | text, language | WAV audio buffer |
| `speech-to-speech` | Voice interaction | audio input | audio response |

All flows:
- Initialized via Genkit + Gemini 2.0 Flash
- Wrapped with chaos injection for adversarial testing
- Capture prompt I/O for analysis and debugging
- Accept LLMContext from ADK for strategy-aware generation

---

## 7. BRIDGE & INFRASTRUCTURE MECHANICS

### 7.1 Node.js ↔ Python ML Bridge

```
ml-bridge.ts spawns persistent Python child_process
  │
  ├─ TRANSPORT: stdin/stdout JSON lines
  │    Request:  { id: uuid, features: [5 floats] }
  │    Response: { id: uuid, mastery_probability, confidence, predicted_class }
  │
  ├─ CIRCUIT BREAKER:
  │    If Python subprocess dies → restart
  │    If 3 consecutive failures → switch to heuristic fallback
  │    Heuristic: mastery = avg_score × 0.7 + (1 − variance) × 0.3
  │
  ├─ BATCH MODE:
  │    Send N predictions in sequence, collect N responses
  │    Parallel topic processing, serial Python calls
  │
  └─ TIMEOUT: 10 seconds per prediction
```

### 7.2 Caching Strategy

```
Layer 1: ml_predictions Firestore collection (1-hour TTL)
  - Key: {studentId}_{topic}
  - Invalidated on: new quiz submission for that topic
  - Batch cache check before hitting ML service

Layer 2: In-memory (planned)
  - Node.js process cache for hot predictions
  - LRU eviction, 15-minute TTL

Layer 3: CDN edge (vision)
  - Static content caching for generated revision plans
  - Invalidated on mastery state change
```

---

## 8. SECURITY & AUTH MODEL

```
Firebase Auth → JWT → AuthContext (client)
  │
  ├─ Role-Based Access Control
  │    student  → own data only
  │    teacher  → own classes + student data within classes
  │    admin    → all data
  │
  ├─ Firestore Security Rules
  │    students/{studentId}: read/write if auth.uid == studentId
  │    quiz_results: read if own data, write if authenticated
  │    ml_predictions: server-side only (admin SDK)
  │    adk_decisions: server-side only (admin SDK)
  │
  └─ API Route Protection
       All /api/* routes verify Firebase ID token
       Server-side uses firebase-admin SDK (not client SDK)
```

---

## 9. REFERENCE FOUNDATIONS

| Foundation | Role in SANKALP | Reference |
|------------|----------------|-----------|
| Ebbinghaus Forgetting Curve | Retention decay model: $R(t) = e^{-t/S}$ | Ebbinghaus, 1885 |
| SuperMemo SM-2 | Spacing interval calculation: $EF' = EF + (0.1 - (5-q)(0.08 + (5-q) \times 0.02))$ | Wozniak, 1990 |
| Deep Knowledge Tracing | Transformer for learning sequences | Piech et al., 2015 |
| Bayesian Knowledge Tracing | Uncertainty quantification for mastery | Corbett & Anderson, 1994 |
| XGBoost | Gradient boosting for feature importance | Chen & Guestrin, 2016 |
| LightGBM | Fast distributed gradient boosting | Ke et al., 2017 |
| Attention Is All You Need | Transformer architecture | Vaswani et al., 2017 |

---

## 10. EVOLUTION ROADMAP (MODEL ONLY)

```
CURRENT (Production)
  ├─ 1 ML model (Logistic Regression, 5 features)
  ├─ 1 LLM (Gemini 2.0 Flash, static prompts)
  ├─ 5 ADK policy rules (hard thresholds)
  ├─ Heuristic fallback when ML is down
  └─ Synthetic training data (2000 records)

UPGRADE (Core Block Upgrade)
  ├─ 3 ML models (Ensemble mastery, Forgetting curve, Attention risk)
  ├─ 40+ engineered features (mastery + spacing + engagement + cognitive)
  ├─ Dynamic LLM token budgets (300–4000 based on mastery)
  ├─ Continuous ADK scoring (replaces hard thresholds)
  └─ SM-2 integrated spacing algorithm

VISION (Full Architecture)
  ├─ Transformer DKT for sequential patterns
  ├─ Bayesian hierarchical models with uncertainty intervals
  ├─ Multi-LLM routing (Claude/GPT-4/Gemini/fine-tuned per student)
  ├─ Learned decision routing (what works for THIS student)
  ├─ Real training data from production feedback loop
  ├─ Per-student memory strength (S) estimation
  ├─ Parent visibility layer + institutional analytics
  └─ Offline-first with sync (IndexedDB → Firestore)
```

---

## 11. CLOSED-LOOP FEEDBACK — THE CORE DIFFERENTIATOR

```
Most EdTech:   Teach → Test → Score → Done (open loop)

SANKALP:       Teach → Test → Score → PREDICT → DECIDE → GENERATE → Teach
                                         │          │          │
                                    ML models   ADK rules   LLM flows
                                         │          │          │
                                    "Will they   "What to   "How to
                                     forget?"    do about    explain
                                                  it?"       it?"

The loop never stops. Every interaction refines the model.
Every refinement improves the next intervention.
The system gets smarter per-student over time.
```

This is the machine. Everything else is interface.
