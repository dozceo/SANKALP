import pandas as pd
import numpy as np
import joblib
import os
import sys
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# Ensure we can import generate_data from src/ml/training
sys.path.append(os.path.join(os.getcwd(), 'src'))
try:
    from ml.training.generate_data import generate_training_data
except ImportError:
    # Fallback if running from a different directory structure or if sys.path isn't enough
    sys.path.append(os.path.join(os.getcwd(), 'src/ml/training'))
    try:
        from generate_data import generate_training_data
    except ImportError:
        print("❌ Error: Could not import generate_training_data. Please run from repo root.")
        sys.exit(1)

MODEL_PATH = 'src/ml/models/mastery_model.pkl'
TEST_SET_PATH = 'src/ml/training/test_set.csv'
REPORT_PATH = 'ML_PERFORMANCE_REPORT.md'
FEATURE_COLUMNS = [
    'avg_quiz_score',
    'attempts_per_topic',
    'days_since_last_revision',
    'quiz_score_variance',
    'time_spent_per_question'
]
TARGET_COLUMN = 'mastered'
ACCURACY_THRESHOLD = 0.80

def ensure_test_set():
    """Ensures a fixed test set exists for regression testing."""
    if not os.path.exists(TEST_SET_PATH):
        print(f"⚠️ Test set not found at {TEST_SET_PATH}. Generating one with fixed seed...")
        # Use a fixed seed different from training to ensure it's a holdout set
        # generate_training_data uses np.random, so we set seed before calling
        np.random.seed(999)
        df = generate_training_data(n_samples=500)
        os.makedirs(os.path.dirname(TEST_SET_PATH), exist_ok=True)
        df.to_csv(TEST_SET_PATH, index=False)
        print(f"✅ Generated fixed test set ({len(df)} samples).")
    else:
        print(f"✅ Found existing test set at {TEST_SET_PATH}.")

def load_model():
    """Loads the model artifact."""
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model not found at {MODEL_PATH}.")
        return None

    try:
        artifact = joblib.load(MODEL_PATH)
        # Check if it's the dictionary artifact or just the model
        if isinstance(artifact, dict) and 'model' in artifact:
            return artifact['model']
        else:
            return artifact
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return None

def evaluate_model():
    print("🚀 Starting ML Model Regression Detection...")

    ensure_test_set()

    model = load_model()
    if model is None:
        print("❌ Aborting evaluation due to missing model.")
        sys.exit(1)

    print("📊 Loading test data...")
    df_test = pd.read_csv(TEST_SET_PATH)

    X_test = df_test[FEATURE_COLUMNS]
    y_test = df_test[TARGET_COLUMN]

    print("🧠 Running predictions...")
    y_pred = model.predict(X_test)

    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()

    print(f"\n📈 Results:")
    print(f"   Accuracy:  {accuracy:.2%}")
    print(f"   Precision: {precision:.2%}")
    print(f"   Recall:    {recall:.2%}")
    print(f"   F1 Score:  {f1:.2%}")

    status = "✅ PASS" if accuracy >= ACCURACY_THRESHOLD else "❌ FAIL (Regression Detected)"

    # Generate Report
    report_content = f"""# ML Model Performance Report

**Date:** {pd.Timestamp.now().isoformat()}
**Status:** {status}

## Summary
The model was evaluated on a fixed holdout test set (`{TEST_SET_PATH}`).

| Metric | Value | Threshold | Status |
|---|---|---|---|
| **Accuracy** | **{accuracy:.2%}** | {ACCURACY_THRESHOLD:.0%} | {status} |
| Precision | {precision:.2%} | - | - |
| Recall | {recall:.2%} | - | - |
| F1 Score | {f1:.2%} | - | - |

## Confusion Matrix
| | Predicted Negative | Predicted Positive |
|---|---|---|
| **Actual Negative** | {tn} (TN) | {fp} (FP) |
| **Actual Positive** | {fn} (FN) | {tp} (TP) |

## Regression Analysis
"""
    if accuracy < ACCURACY_THRESHOLD:
        report_content += f"\n⚠️ **ALERT:** Model accuracy has dropped below the {ACCURACY_THRESHOLD:.0%} threshold. This indicates a potential regression or data drift issue. Immediate investigation is recommended."
    else:
        report_content += f"\n✅ Model performance is stable and meets the required accuracy threshold."

    with open(REPORT_PATH, 'w') as f:
        f.write(report_content)

    print(f"\n📄 Report generated: {REPORT_PATH}")

    if accuracy < ACCURACY_THRESHOLD:
        sys.exit(1)

if __name__ == "__main__":
    evaluate_model()
