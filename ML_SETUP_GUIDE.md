# ML System Setup & Testing Guide

## Issue Detected
Python dependencies not installed (pandas, scikit-learn, fastapi, uvicorn)

## Solution Steps

### 1. Install Python Dependencies
```powershell
# Navigate to training folder
cd "c:\Users\HAARIO\Desktop\DASH\MY WORKS\SANKALP 1.0\SANKALP\src\ml\training"

# Install requirements
pip install -r requirements.txt

# Install FastAPI (for production server)
pip install fastapi uvicorn
```

### 2. Generate Training Data
```powershell
python generate_data.py
```
**Expected output:**
```
✅ Generated 1000 samples
📁 Saved to: training_data.csv
```

### 3. Train the Model
```powershell
python train_mastery_model.py
```
**Expected output:**
```
✅ Test Accuracy: 75-85%
💾 Model saved to: ../models/mastery_model.pkl
```

### 4. Test Inference (Optional)
```powershell
cd ../inference
echo '{"avg_quiz_score": 0.75, "attempts_per_topic": 3, "days_since_last_revision": 2, "quiz_score_variance": 0.1, "time_spent_per_question": 45}' | python predict_mastery.py
```

### 5. Start FastAPI Server (Production Mode)
```powershell
# From inference folder
python api.py
```
**Expected:** Server runs on http://localhost:8000
Test: Open http://localhost:8000/docs for interactive API

### 6. Test Next.js Integration
```powershell
# In project root
npm run dev
```
Visit http://localhost:3000/home - should show ML intelligence

---

## Troubleshooting

**"pip not recognized"**
→ Use `python -m pip install -r requirements.txt`

**"Module not found pandas"**
→ Dependencies not installed, run Step 1

**"Model not found"**
→ Run Step 3 to train the model

**FastAPI import error**
→ Run `pip install fastapi uvicorn`

---

## Quick Test Commands (All-in-One)

```powershell
# Run from project root
cd "c:\Users\HAARIO\Desktop\DASH\MY WORKS\SANKALP 1.0\SANKALP"

# Install deps
python -m pip install -r src\ml\training\requirements.txt
python -m pip install fastapi uvicorn

# Train model
python src\ml\training\generate_data.py
python src\ml\training\train_mastery_model.py

# Test API
python src\ml\inference\api.py
```
