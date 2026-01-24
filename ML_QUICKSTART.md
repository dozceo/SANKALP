# ML System Quick Start Guide

## Prerequisites
- **Python 3.8+** installed (`python --version`)
- **Node.js 18+** for the Next.js app
- **Git** for version control

---

## 🚀 5-Minute Setup

### Step 1: Install Python Dependencies
```bash
cd src/ml/training
pip install -r requirements.txt
```

**Expected output:** Successfully installed scikit-learn, pandas, numpy, joblib

---

### Step 2: Generate Training Data
```bash
python generate_data.py
```

**Expected output:**
```
✅ Generated 1000 samples
📁 Saved to: training_data.csv
📊 Data Statistics:
   Mastered: 600 (60.0%)
   Not Mastered: 400 (40.0%)
```

---

### Step 3: Train the Model
```bash
python train_mastery_model.py
```

**Expected output:**
```
✅ Test Accuracy: 78-85%
💾 Model saved to: ../models/mastery_model.pkl
```

---

### Step 4: Test Inference (Optional)
```bash
cd ../inference
echo '{"avg_quiz_score": 0.75, "attempts_per_topic": 3, "days_since_last_revision": 2, "quiz_score_variance": 0.1, "time_spent_per_question": 45}' | python predict_mastery.py
```

**Expected output:**
```json
{"mastery_probability": 0.823, "confidence": 0.823, "predicted_class": "mastered"}
```

---

## 🔍 What Just Happened?

1. **Synthetic Data**: Created 1000 realistic student learning records
2. **Model Training**: Trained a Logistic Regression classifier
3. **Validation**: Split data 80/20 train/test, achieved ~80% accuracy
4. **Deployment**: Saved model as `.pkl` file for Node.js integration

---

## ✅ Verification Checklist

- [ ] `training_data.csv` exists in `src/ml/training/`
- [ ] `mastery_model.pkl` exists in `src/ml/models/`
- [ ] Training script shows accuracy > 70%
- [ ] Inference script returns valid JSON

---

## 🐛 Troubleshooting

**"No module named sklearn"**  
→ Run: `pip install scikit-learn`

**"Model not found"**  
→ You skipped Step 3. Run `train_mastery_model.py` first.

**"Python not found" (Windows)**  
→ Try `python3` instead of `python`, or reinstall Python with "Add to PATH"

---

## 🔗 Next Steps

1. **Run the Next.js app**: `npm run dev`
2. **Test the Planner**: Navigate to `/planner` route
3. **Check console**: ML predictions should appear in server logs
4. **Read the docs**: `src/ml/README.md` for full architecture

---

## 📖 Understanding the ML Pipeline

```
User Quiz Result → Feature Extraction → ML Prediction → Decision Rules → LLM Explanation
     (raw data)     (student_features.ts)   (Python model)    (TypeScript)     (Genkit)
```

**What ML decides:**
- Which topics to revise (based on mastery < 0.5)
- Priority level (HIGH/MEDIUM/LOW)

**What LLM explains:**
- Why the topic needs revision
- Motivational messaging
- Study tips
