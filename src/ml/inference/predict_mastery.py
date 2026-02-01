"""
Topic Mastery Prediction Inference Script

Loads the trained model and makes predictions on new student data.
Accepts JSON input via stdin and outputs JSON predictions.
Supports both single input (dict) and batch input (list of dicts).

Usage:
  echo '{"avg_quiz_score": 0.75, ...}' | python predict_mastery.py
  echo '[{"avg_quiz_score": 0.75, ...}, {"avg_quiz_score": 0.2, ...}]' | python predict_mastery.py
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

def predict_single(model, features):
    """
    Predict topic mastery for a single feature set
    """
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
        
        # Load model once
        model = load_model()
        
        if isinstance(input_data, list):
            # Batch prediction
            results = []
            for features in input_data:
                try:
                    result = predict_single(model, features)
                    results.append(result)
                except Exception as e:
                    results.append({
                        "mastery_probability": 0.0,
                        "confidence": 0.0,
                        "predicted_class": "error",
                        "error": str(e)
                    })
            print(json.dumps(results))
        else:
            # Single prediction
            result = predict_single(model, input_data)
            print(json.dumps(result))
        
    except Exception as e:
        # Output error as JSON
        error_result = {
            "error": str(e),
            "mastery_probability": 0.0,
            "confidence": 0.0,
            "predicted_class": "error"
        }
        # If input was a list, we probably should return a list with one error or handle it better,
        # but top level exception means we failed completely.
        # Ideally we wrap this in a list if we know we are in batch mode?
        # But we might not know if json.load failed.
        # We'll just output the object. The caller needs to handle it.
        print(json.dumps(error_result))
        sys.exit(1)
