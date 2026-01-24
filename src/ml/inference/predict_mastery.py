"""
Topic Mastery Prediction Inference Script

Loads the trained model and makes predictions on new student data.
Accepts JSON input via stdin and outputs JSON predictions.

Usage:
  echo '{"avg_quiz_score": 0.75, ...}' | python predict_mastery.py
"""

import sys
import json
import joblib
import numpy as np
import os

# Path to trained model (relative to this script)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/mastery_model.pkl")

def load_model():
    """Load the trained model"""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found at {MODEL_PATH}. "
            "Run train_mastery_model.py first."
        )
    return joblib.load(MODEL_PATH)

def predict_mastery(features):
    """
    Predict topic mastery given student features
    
    Args:
        features: dict with keys:
            - avg_quiz_score (float)
            - attempts_per_topic (int)
            - days_since_last_revision (int)
            - quiz_score_variance (float)
            - time_spent_per_question (float)
    
    Returns:
        dict with:
            - mastery_probability (float)
            - confidence (float)
            - predicted_class (str)
    """
    model = load_model()
    
    # Extract features in correct order
    feature_vector = np.array([[
        features['avg_quiz_score'],
        features['attempts_per_topic'],
        features['days_since_last_revision'],
        features['quiz_score_variance'],
        features['time_spent_per_question']
    ]])
    
    # Get probability predictions
    proba = model.predict_proba(feature_vector)[0]
    mastery_probability = float(proba[1])  # Probability of class 1 (mastered)
    
    # Confidence is max probability
    confidence = float(max(proba))
    
    # Predicted class
    predicted_class = "mastered" if mastery_probability >= 0.5 else "not_mastered"
    
    return {
        "mastery_probability": round(mastery_probability, 3),
        "confidence": round(confidence, 3),
        "predicted_class": predicted_class
    }

if __name__ == "__main__":
    try:
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)
        
        # Make prediction
        result = predict_mastery(input_data)
        
        # Output JSON result
        print(json.dumps(result))
        
    except Exception as e:
        # Output error as JSON
        error_result = {
            "error": str(e),
            "mastery_probability": 0.0,
            "confidence": 0.0,
            "predicted_class": "error"
        }
        print(json.dumps(error_result))
        sys.exit(1)
