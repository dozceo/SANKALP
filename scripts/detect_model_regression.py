"""
ML Model Performance Regression Detection

Loads the trained mastery model and evaluates it against a fixed holdout test set.
Detects significant drops in accuracy or F1 score.
"""

import sys
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, f1_score, classification_report

# Add src/ml/training to path to import generate_data
sys.path.append(os.path.join(os.path.dirname(__file__), "../src/ml/training"))

try:
    from generate_data import generate_training_data
except ImportError:
    print("Error: Could not import generate_training_data. Check path.")
    sys.exit(1)

# Configuration
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../src/ml/models/mastery_model.pkl")
TEST_SET_PATH = os.path.join(os.path.dirname(__file__), "../src/ml/training/test_set.csv")
REPORT_PATH = "ML_PERFORMANCE_REPORT.md"
TEST_SAMPLES = 500
ACCURACY_THRESHOLD = 0.60  # Alert if below 60%

def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
    loaded = joblib.load(MODEL_PATH)
    if isinstance(loaded, dict) and 'model' in loaded:
        return loaded['model']
    return loaded

def load_or_generate_test_data():
    if os.path.exists(TEST_SET_PATH):
        print(f"Loading existing test set from {TEST_SET_PATH}...")
        return pd.read_csv(TEST_SET_PATH)
    else:
        print(f"Generating new fixed test set ({TEST_SAMPLES} samples)...")
        # Fixed seed for test set generation to ensure consistency across runs if file is deleted
        np.random.seed(999)
        test_data = generate_training_data(n_samples=TEST_SAMPLES)
        test_data.to_csv(TEST_SET_PATH, index=False)
        print(f"Saved test set to {TEST_SET_PATH}")
        return test_data

def evaluate_model():
    print(f"Loading model from {MODEL_PATH}...")
    try:
        model = load_model()
    except Exception as e:
        print(f"Failed to load model: {e}")
        return

    test_data = load_or_generate_test_data()

    # Prepare features
    feature_cols = [
        'avg_quiz_score',
        'attempts_per_topic',
        'days_since_last_revision',
        'quiz_score_variance',
        'time_spent_per_question'
    ]

    # Ensure columns exist
    missing_cols = set(feature_cols) - set(test_data.columns)
    if missing_cols:
        print(f"Error: Test data missing columns: {missing_cols}")
        return

    X_test = test_data[feature_cols].values
    y_true = test_data['mastered'].values

    print("Running predictions...")
    try:
        # Predict
        y_pred_proba = model.predict_proba(X_test)
        # Class 1 is mastered
        y_pred = (y_pred_proba[:, 1] >= 0.5).astype(int)
    except Exception as e:
        print(f"Prediction failed: {e}")
        return

    # Calculate metrics
    accuracy = accuracy_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred)

    print(f"Accuracy: {accuracy:.4f}")
    print(f"F1 Score: {f1:.4f}")

    # Generate Report
    report_content = f"""# ML Model Performance Report

**Date:** {pd.Timestamp.now()}
**Model:** {MODEL_PATH}
**Test Set:** {TEST_SET_PATH}
**Test Samples:** {len(test_data)}

## Metrics
- **Accuracy:** {accuracy:.2%}
- **F1 Score:** {f1:.4f}
- **Threshold:** {ACCURACY_THRESHOLD:.2%}

## Status
"""

    if accuracy < ACCURACY_THRESHOLD:
        status = "❌ **FAIL**: Model accuracy is below acceptable threshold."
        print("Alert: Model accuracy below threshold!")
    else:
        status = "✅ **PASS**: Model performance is within acceptable range."

    report_content += f"{status}\n\n"

    report_content += "## Classification Report\n```\n"
    report_content += classification_report(y_true, y_pred)
    report_content += "\n```\n"

    with open(REPORT_PATH, "w") as f:
        f.write(report_content)

    print(f"Report saved to {REPORT_PATH}")

if __name__ == "__main__":
    evaluate_model()
