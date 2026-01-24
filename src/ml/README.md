# ML System Architecture

## 🎯 Core ML Objective

Predict a student's learning state so the system can decide **what, when, and how** to teach.

This breaks into **3 ML tasks** that power different features of Sankalp:

---

## 🧠 ML Task 1: Topic Mastery Prediction

**Problem Type:** Binary / Probabilistic Classification

**Question Answered:**  
"Has the student actually mastered this topic?"

**Input Features:**
- `avg_quiz_score`: Average score across all attempts for this topic
- `attempts_per_topic`: Number of times the student attempted quizzes on this topic
- `days_since_last_revision`: How many days since the student last studied this topic
- `quiz_score_variance`: Consistency of performance (low variance = stable mastery)
- `time_spent_per_question`: Average time spent answering questions (seconds)

**Output:**
```json
{
  "topic": "Algebra",
  "mastery_probability": 0.42,
  "confidence": 0.85
}
```

**Powers:** Smart Revision Planner, Brain Map Dashboard

---

## 🧠 ML Task 2: Forgetting Curve Prediction

**Problem Type:** Regression

**Question Answered:**  
"When will the student forget this topic if no revision happens?"

**Input Features:**
- Same as Task 1, plus:
- `initial_mastery_score`: Mastery level when first learned
- `revision_frequency`: Historical pattern of revisions
- `topic_difficulty`: Intrinsic complexity of the topic

**Output:**
```json
{
  "topic": "Algebra",
  "days_until_forget": 5,
  "retention_confidence": 0.72
}
```

**Powers:** Smart Revision Planner (urgency ranking), Offline-First Mode (pre-caching)

---

## 🧠 ML Task 3: Attention Risk Prediction

**Problem Type:** Multi-class Classification

**Question Answered:**  
"Is this student at risk of disengaging?"

**Input Features:**
- `session_frequency`: How often the student logs in
- `avg_session_duration`: Time spent per session
- `quiz_completion_rate`: Percentage of started quizzes that are finished
- `days_inactive`: Days since last login
- `performance_trend`: Whether scores are improving or declining

**Output:**
```json
{
  "attention_risk": "HIGH",
  "dropout_probability": 0.68,
  "recommended_intervention": "mindful_mentor"
}
```

**Powers:** Teacher Risk Dashboard, Mindful Mentor trigger logic

---

## 🔗 System Integration

### Updated Architecture Flow

```
User → Quiz/Interaction
         ↓
  Feature Extraction (student_features.ts)
         ↓
  ML Inference (Python models)
         ↓
  ADK Decision Layer (TypeScript rules)
         ↓
  LLM Content Generation (Genkit)
         ↓
  User Response
```

**Key Principle:** ML decides **what** to teach, LLM decides **how** to explain it.

---

## 📁 Folder Structure

```
src/ml/
├── features/
│   └── student_features.ts       # Feature engineering logic
├── models/
│   ├── mastery_model.pkl          # Trained Topic Mastery model
│   ├── forgetting_model.pkl       # Trained Forgetting Curve model
│   └── attention_model.pkl        # Trained Attention Risk model
├── inference/
│   ├── predict_mastery.py         # Python inference script
│   ├── ml-bridge.ts               # Node.js ↔ Python bridge
│   └── types.ts                   # TypeScript types for ML outputs
├── training/
│   ├── generate_data.py           # Synthetic data generator
│   ├── train_mastery_model.py     # Model training script
│   ├── training_data.csv          # Generated training data
│   └── requirements.txt           # Python dependencies
└── README.md                      # This file
```

---

## 🚀 Current Implementation Status

### ✅ Implemented
- [x] ML system architecture design
- [x] Folder structure

### 🔄 In Progress
- [ ] Topic Mastery Prediction (Model #1)
- [ ] Feature extraction layer
- [ ] ML-LLM integration in Revision Planner

### 📋 Planned
- [ ] Forgetting Curve Prediction (Model #2)
- [ ] Attention Risk Prediction (Model #3)
- [ ] FastAPI microservice (production deployment)

---

## 💡 Why This Approach?

**1. Explainability**  
We use Logistic Regression and simple decision trees, not deep learning. This allows us to explain **why** a student is flagged as "struggling".

**2. Data Efficiency**  
These models work well with small datasets (100-1000 samples). We start with synthetic data and improve as real user data accumulates.

**3. Separation of Concerns**  
- **ML models**: Make predictions based on patterns
- **LLM (Genkit)**: Generate natural language explanations
- **ADK logic**: Apply business rules and thresholds

This prevents the LLM from "hallucinating" decisions and makes the system auditable.

---

## 🔧 Tech Stack

- **Training:** Python 3.8+, scikit-learn, pandas
- **Inference:** Python scripts called from Node.js
- **Integration:** TypeScript bridge layer
- **Future:** FastAPI for production-grade serving
