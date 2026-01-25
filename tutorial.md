# Sankalp Tutorial - Building an ML-Driven EdTech Platform

## What You'll Learn

This tutorial walks through Sankalp's architecture, showing how we built a **production-grade ML system** that separates concerns between:
- **ML models** (make predictions)
- **ADK decision engine** (make policy decisions)
- **LLM** (generate content)

---

## Part 1: Understanding the Architecture

### Traditional AI Approach (What We DON'T Do)
```
User → LLM Prompt → "Decide what to teach AND how to explain it"
```
**Problems:**
- ❌ LLM hallucinates teaching strategies
- ❌ No audit trail
- ❌ Can't optimize decisions independently
- ❌ Expensive (calls LLM for everything)

### Sankalp's Approach (What We DO)
```
User Activity
    ↓
Feature Extraction (student_features.ts)
    ↓
ML Prediction (predict_mastery.py)
    ↓
ADK Decision (decision-engine.ts)
    ↓
LLM Content Generation (Genkit)
    ↓
UI Render
```

**Benefits:**
- ✅ **ML predicts**: Mastery = 35% (based on quiz history)
- ✅ **ADK decides**: "Urgent revision needed" (policy rule)
- ✅ **LLM explains**: "Let's review Algebra using short examples..." (content)
- ✅ **Explainable**: Every decision has reasoning
- ✅ **Cost-efficient**: LLM only called when needed

---

## Part 2: The ML System

### File: `src/ml/features/student_features.ts`

**Purpose:** Transform raw quiz data into ML-ready features

**Example:**
```typescript
const features = extractMasteryFeatures("Algebra", studentHistory);
// Returns:
{
  avg_quiz_score: 0.35,
  attempts_per_topic: 2,
  days_since_last_revision: 15,
  quiz_score_variance: 0.12,
  time_spent_per_question: 45
}
```

**Why This Matters:**
These 5 features are fed into the ML model. They capture:
- Performance (score)
- Practice (attempts)
- Recency (days since revision)
- Consistency (variance)
- Engagement (time spent)

---

### File: `src/ml/training/train_mastery_model.py`

**Purpose:** Train a Logistic Regression model to predict mastery

**What It Does:**
1. Loads `training_data.csv` (1000 synthetic samples)
2. Trains Logistic Regression classifier
3. Saves model to `models/mastery_model.pkl`
4. Achieves ~80% accuracy

**Run It:**
```bash
cd srcml\training
python generate_data.py  # Create training data
python train_mastery_model.py  # Train model
```

**Output:**
```
✅ Test Accuracy: 82%
💾 Model saved to: ../models/mastery_model.pkl
```

---

### File: `src/ml/inference/ml-bridge.ts`

**Purpose:** Call Python ML model from TypeScript

**How It Works:**
```typescript
const prediction = await predictMastery({
  avg_quiz_score: 0.35,
  attempts_per_topic: 2,
  // ... other features
});

// Returns:
{
  mastery_probability: 0.38,
  confidence: 0.82,
  predicted_class: "not_mastered"
}
```

**Under the Hood:**
1. Spawns Python subprocess
2. Passes JSON via stdin
3. Reads prediction from stdout
4. Times out after 5 seconds (prevents hanging)

---

## Part 3: The ADK Decision Engine

### File: `src/ai/adk/decision-engine.ts`

**Purpose:** Policy-driven orchestration layer

**Example Decision Rule:**
```typescript
if (mastery_probability < 0.4 && days_until_forget < 3) {
  return {
    action: DecisionAction.URGENT_REVISION,
    priority: "HIGH",
    contentStrategy: ContentStrategy.SHORT_FORM,
    reasoning: "Low mastery with imminent forgetting risk"
  };
}
```

**Why Not LLM?**
- ADK rules are **deterministic** (same input = same output)
- Can be A/B tested easily
- Audit trail for every decision
- No hallucination risk

**What LLM Receives:**
```typescript
const prompt = `
You are a tutor explaining ${topic}.
Strategy: SHORT_FORM (brief, focused explanation)
Tone: MOTIVATING
Duration: 5 minutes
Student has low mastery (38%) and needs quick wins.
`;
```

LLM now has **context** instead of making decisions.

---

## Part 4: Frontend Integration

### File: `src/app/api/intelligence/student/route.ts`

**Purpose:** Unified API endpoint for ML + ADK intelligence

**Workflow:**
```typescript
// 1. Fetch student data (currently mocked)
const studentHistory = { /* quiz results */ };

// 2. For each topic, run ML → ADK pipeline
for (const topic of topics) {
  const features = extractMasteryFeatures(topic, studentHistory);
  const mlPrediction = await predictMastery(features);
  const adkDecision = makeRevisionDecision({ mlSignals, topic });
  
  mastery[topic] = {
    score: mlPrediction.mastery_probability,
    priority: adkDecision.priority,
    needsRevision: adkDecision.action === "URGENT_REVISION"
  };
}

// 3. Return JSON
return { mastery, attentionRisk, reasoning, flags };
```

**Test It:**
```bash
npm run dev
curl http://localhost:3000/api/intelligence/student?studentId=demo_student
```

---

### File: `src/components/LearningStateCard.tsx`

**Purpose:** Display ML intelligence in UI

**What It Shows:**
- Attention Risk (HIGH/MEDIUM/LOW) - color-coded
- Overall Mastery % - calculated from ML predictions
- ADK Mode - current learning state
- Reasoning - "Why am I seeing this?" tooltip

**Data Flow:**
```typescript
const [intelligence, setIntelligence] = useState(null);

useEffect(() => {
  fetch("/api/intelligence/student")
    .then(res => res.json())
    .then(data => setIntelligence(data));
}, []);

// Render with real ML data
<Badge variant={intelligence.attentionRisk === "HIGH" ? "destructive" : "default"}>
  {intelligence.attentionRisk}
</Badge>
```

---

## Part 5: Key Design Decisions

### Decision 1: Why Logistic Regression (not Deep Learning)?

**Reasons:**
1. **Explainability**: Can show feature importance
2. **Data Efficiency**: Works with 1000 samples (no need for millions)
3. **Fast Training**: Trains in seconds, not hours
4. **No GPU Needed**: Runs on any machine

**Trade-off:** Less accuracy than neural networks, but good enough for this use case (80% vs 85%).

---

### Decision 2: Why Separate ADK Layer?

**Before:**
```typescript
const prompt = "Look at this student data and decide what to teach...";
```

**Problem:** LLM makes both decision AND content.

**After:**
```typescript
const decision = adkEngine.decide(mlSignals); // Deterministic
const content = llm.generate(decision.strategy); // Creative
```

**Benefit:** Can update decision rules without retraining LLM.

---

### Decision 3: Why API Route (not Direct ML Calls)?

**Architecture:**
```
Frontend → /api/intelligence/student → ML + ADK → JSON
```

**Instead of:**
```
Frontend → ML → ADK (❌ tight coupling)
```

**Benefits:**
- Single source of truth
- Can cache responses
- Easy to add authentication
- Database-ready (just swap data source)

---

## Part 6: How to Extend This System

### Add a New ML Model (e.g., Forgetting Curve)

1. **Create training script:**
   ```python
   # src/ml/training/train_forgetting_model.py
   ```

2. **Add inference:**
   ```python
   # src/ml/inference/predict_forgetting.py
   ```

3. **Update ADK to use it:**
   ```typescript
   const forgetting = await predictForgetting(features);
   if (forgetting.days_until_forget < 3) {
     // Trigger urgent revision
   }
   ```

4. **Display in UI:**
   ```typescript
   <Badge>Retention: {forgetting.retention_confidence}%</Badge>
   ```

---

### Add Teacher Mode Analytics

1. **Create API endpoint:**
   ```typescript
   // src/app/api/teacher/analytics/route.ts
   ```

2. **Aggregate ML predictions:**
   ```typescript
   const atRiskStudents = students.filter(s => 
     s.attentionRisk === "HIGH" || s.avgMastery < 0.4
   );
   ```

3. **Build dashboard:**
   ```typescript
   // src/app/(main)/teacher/page.tsx
   <StudentRiskTable students={atRiskStudents} />
   ```

---

## Part 7: Production Checklist

### Before Deploying:

- [ ] Replace mock data with real database (see `DATABASE.md`)
- [ ] Add authentication (NextAuth.js)
- [ ] Set up proper environment variables
- [ ] Train model on real user data (not synthetic)
- [ ] Replace Python subprocess with FastAPI server
- [ ] Add error monitoring (Sentry)
- [ ] Set up CI/CD for model retraining
- [ ] Add rate limiting to API routes
- [ ] Implement caching (Redis)
- [ ] Test with real students

---

## Part 8: Common Issues & Solutions

### "Model not found"
**Cause:** Haven't trained the model yet  
**Fix:** Run `python train_mastery_model.py`

### "Python not found"
**Cause:** Python not in PATH (Windows)  
**Fix:** Use `python3` or reinstall Python with "Add to PATH"

### "Module 'pandas' not found"
**Cause:** Dependencies not installed  
**Fix:** `pip install -r src/ml/training/requirements.txt`

### "Intelligence API returns empty"
**Cause:** No quiz data for student  
**Fix:** Currently uses mock data; in production, ensure DB has quiz results

---

## Part 9: Understanding the Data Flow (Complete Example)

**Scenario:** Student just finished an Algebra quiz

### Step 1: Quiz Submission
```typescript
// User completes quiz
POST /api/quiz/submit
{
  topic: "Algebra",
  score: 0.35,
  timeSpent: 180,
  answers: [...]
}
```

### Step 2: Save to Database (Future)
```typescript
await prisma.quizResult.create({
  data: { studentId, topic, score, timeSpent }
});
```

### Step 3: Dashboard Refresh
```typescript
// Homepage fetches intelligence
GET /api/intelligence/student?studentId=xxx
```

### Step 4: Feature Extraction
```typescript
const features = extractMasteryFeatures("Algebra", studentHistory);
// { avg_quiz_score: 0.35, attempts: 2, days_since_revision: 1, ... }
```

### Step 5: ML Prediction
```typescript
const prediction = await predictMastery(features);
// { mastery_probability: 0.38, confidence: 0.82 }
```

### Step 6: ADK Decision
```typescript
const decision = makeRevisionDecision({ mlSignals, topic: "Algebra" });
// {
//   action: "URGENT_REVISION",
//   priority: "HIGH",
//   contentStrategy: "SHORT_FORM",
//   reasoning: "Low mastery with recent activity"
// }
```

### Step 7: UI Display
```typescript
<TopicCard>
  <Badge variant="destructive">HIGH PRIORITY</Badge>
  <Progress value={38} />
  <p>Algebra: 38% mastered</p>
  <p className="text-destructive">⚠️ Revision recommended</p>
  <Tooltip>
    "Based on your recent quiz (35%) and 2 previous attempts"
  </Tooltip>
</TopicCard>
```

### Step 8: Student Clicks "Start Revision"
```typescript
// Genkit flow triggered
const explanation = await generateRevisionContent({
  topic: "Algebra",
  strategy: "SHORT_FORM",  // From ADK
  masteryLevel: 0.38,      // From ML
  tone: "MOTIVATING"       // From ADK
});
```

---

## Key Takeaways

1. **Separation of Concerns**
   - ML = Predictions
   - ADK = Decisions
   - LLM = Content

2. **Explainability First**
   - Every decision has reasoning
   - Users see "why", not just "what"

3. **Production-Ready Architecture**
   - API contracts defined
   - Database-ready schema
   - Scalable design

4. **Cost-Efficient**
   - ML runs once per topic
   - ADK is free (just logic)
   - LLM only called for content generation

---

## Next Steps

1. **Run the ML pipeline:** See `ML_QUICKSTART.md`
2. **Integrate database:** See `DATABASE.md`
3. **Explore the code:** Start with `/api/intelligence/student/route.ts`
4. **Read the walkthroughs:** Check `walkthrough.md` in artifacts

Welcome to production-grade EdTech AI! 🎓
