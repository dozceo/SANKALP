"""
Topic Mastery Prediction Inference Script

Loads the trained model and makes predictions on new student data.
Accepts JSON input via stdin and outputs JSON predictions.
Supports persistent mode by reading line-by-line from stdin.

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
    loaded = joblib.load(MODEL_PATH)
    if isinstance(loaded, dict) and 'model' in loaded:
        return loaded['model']
    return loaded

# Global model instance
model = None

def predict_mastery(features):
    """
    Predict topic mastery for a single feature set
    """
    global model
    if model is None:
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
        # Pre-load model
        model = load_model()
        
        # Read from stdin line by line
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue

            request_id = None
            try:
                input_data = json.loads(line)
                request_id = input_data.get("_id")

                # Make prediction
                result = predict_mastery(input_data)

                # Add back request_id if present
                if request_id:
                    result["_id"] = request_id

                # Output JSON result
                print(json.dumps(result))
                sys.stdout.flush()

            except Exception as e:
                # Output error as JSON
                error_result = {
                    "error": str(e),
                    "mastery_probability": 0.0,
                    "confidence": 0.0,
                    "predicted_class": "error"
                }
                if request_id:
                    error_result["_id"] = request_id

                print(json.dumps(error_result))
                sys.stdout.flush()

    except Exception as e:
        sys.stderr.write(f"Fatal error: {str(e)}\n")
        sys.exit(1)
