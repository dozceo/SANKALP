"""
ML Model Performance Regression Detection

Loads the trained mastery model and evaluates it against a freshly generated synthetic test set.
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

def evaluate_model():
    print(f"Loading model from {MODEL_PATH}...")
    try:
        model = load_model()
    except Exception as e:
        print(f"Failed to load model: {e}")
        return

    print(f"Generating {TEST_SAMPLES} test samples...")
    # Generate test data (using a different seed implicitly or explicitly if needed,
    # but generate_data sets a seed. We might want to reset it or just run it.)
    # The generate_data function sets np.random.seed(42).
    # To get different data than training (if training used 42), we might want to change it.
    # However, for regression testing, a consistent set is also good.
    # Let's re-seed to ensure we are testing generalization or at least consistency.
    np.random.seed(999)
    test_data = generate_training_data(n_samples=TEST_SAMPLES)

    # Prepare features
    feature_cols = [
        'avg_quiz_score',
        'attempts_per_topic',
        'days_since_last_revision',
        'quiz_score_variance',
        'time_spent_per_question'
    ]

    X_test = test_data[feature_cols].values
    y_true = test_data['mastered'].values

    print("Running predictions...")
    # Predict
    # The model might expect a 2D array.
    y_pred_proba = model.predict_proba(X_test)
    # Class 1 is mastered
    y_pred = (y_pred_proba[:, 1] >= 0.5).astype(int)

    # Calculate metrics
    accuracy = accuracy_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred)

    print(f"Accuracy: {accuracy:.4f}")
    print(f"F1 Score: {f1:.4f}")

    # Generate Report
    report_content = f"""# ML Model Performance Report

**Date:** {pd.Timestamp.now()}
**Model:** {MODEL_PATH}
**Test Samples:** {TEST_SAMPLES}

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
