"""
FastAPI Production ML Server
Serves the Topic Mastery prediction model via HTTP API.
This replaces the subprocess approach for production deployment.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os
from pathlib import Path

app = FastAPI(
    title="Sankalp ML API",
    description="Machine Learning inference API for student mastery prediction",
    version="1.0.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model on startup
MODEL_PATH = Path(__file__).parent.parent / "models" / "mastery_model.pkl"
model = None

@app.on_event("startup")
async def load_model():
    global model
    if not MODEL_PATH.exists():
        print(f"WARNING: Model not found at {MODEL_PATH}")
        print("Run train_mastery_model.py first!")
    else:
        model = joblib.load(MODEL_PATH)
        print(f"✅ Model loaded from {MODEL_PATH}")

class MasteryPredictionInput(BaseModel):
    avg_quiz_score: float
    attempts_per_topic: int
    days_since_last_revision: int
    quiz_score_variance: float
    time_spent_per_question: float

class MasteryPredictionOutput(BaseModel):
    mastery_probability: float
    confidence: float
    predicted_class: str

@app.get("/")
async def root():
    return {
        "message": "Sankalp ML API",
        "model_loaded": model is not None,
        "endpoints": ["/predict/mastery", "/health"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None
    }

@app.post("/predict/mastery", response_model=MasteryPredictionOutput)
async def predict_mastery(input_data: MasteryPredictionInput):
    """
    Predict topic mastery given student features
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Run train_mastery_model.py first."
        )
    
    try:
        # Extract features in correct order
        feature_vector = np.array([[
            input_data.avg_quiz_score,
            input_data.attempts_per_topic,
            input_data.days_since_last_revision,
            input_data.quiz_score_variance,
            input_data.time_spent_per_question
        ]])
        
        # Get probability predictions
        proba = model.predict_proba(feature_vector)[0]
        mastery_probability = float(proba[1])  # Probability of class 1 (mastered)
        
        # Confidence is max probability
        confidence = float(max(proba))
        
        # Predicted class
        predicted_class = "mastered" if mastery_probability >= 0.5 else "not_mastered"
        
        return MasteryPredictionOutput(
            mastery_probability=round(mastery_probability, 3),
            confidence=round(confidence, 3),
            predicted_class=predicted_class
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
