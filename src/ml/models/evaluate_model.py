import joblib
import pandas as pd
import json
import os
import sys
from sklearn.metrics import accuracy_score
from datetime import datetime

# Define paths
MODEL_PATH = os.path.join(os.path.dirname(__file__), "mastery_model.pkl")
TEST_SET_PATH = os.path.join(os.path.dirname(__file__), "test_set.csv")
HISTORY_PATH = os.path.join(os.path.dirname(__file__), "performance_history.json")
REPORT_PATH = os.path.join(os.path.dirname(__file__), "performance_report.md")

def evaluate_model():
    """Evaluates the mastery model against the fixed test set and tracks performance."""

    print("🔍 Starting Model Evaluation...")

    # 1. Load Model
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model not found at {MODEL_PATH}")
        sys.exit(1)

    try:
        model = joblib.load(MODEL_PATH)
        print("✅ Model loaded successfully.")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        sys.exit(1)

    # 2. Load Test Set
    if not os.path.exists(TEST_SET_PATH):
        print(f"❌ Test set not found at {TEST_SET_PATH}")
        sys.exit(1)

    try:
        test_df = pd.read_csv(TEST_SET_PATH)
        print(f"✅ Test set loaded ({len(test_df)} samples).")
    except Exception as e:
        print(f"❌ Failed to load test set: {e}")
        sys.exit(1)

    # 3. Prepare Features and Target
    feature_columns = [
        'avg_quiz_score',
        'attempts_per_topic',
        'days_since_last_revision',
        'quiz_score_variance',
        'time_spent_per_question'
    ]

    # Check if all features exist
    missing_cols = [col for col in feature_columns if col not in test_df.columns]
    if missing_cols:
        print(f"❌ Missing columns in test set: {missing_cols}")
        sys.exit(1)

    X_test = test_df[feature_columns]
    y_test = test_df['mastered']

    # 4. Predict and Calculate Accuracy
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"📊 Current Accuracy: {accuracy:.2%}")

    # 5. Load and Update History
    history = []
    if os.path.exists(HISTORY_PATH):
        try:
            with open(HISTORY_PATH, 'r') as f:
                history = json.load(f)
        except json.JSONDecodeError:
            print("⚠️ Could not read history file, starting fresh.")

    # Check for regression
    alert_msg = ""
    regression_detected = False
    if history:
        last_run = history[-1]
        last_accuracy = last_run['accuracy']
        drop = last_accuracy - accuracy
        print(f"🕒 Previous Accuracy: {last_accuracy:.2%}")

        # Threshold for regression (e.g., 5% drop)
        if drop > 0.05:
            regression_detected = True
            alert_msg = f"🚨 ALERT: Performance dropped by {drop:.2%} (from {last_accuracy:.2%})"
            print(alert_msg)
        elif drop > 0:
            print(f"📉 Minor drop: {drop:.2%}")
        else:
            print("📈 Performance stable or improved.")
    else:
        print("ℹ️ No history found. This is the baseline run.")

    # Record current run
    current_record = {
        "timestamp": datetime.now().isoformat(),
        "accuracy": accuracy,
        "samples": len(test_df),
        "regression_detected": regression_detected
    }
    history.append(current_record)

    with open(HISTORY_PATH, 'w') as f:
        json.dump(history, f, indent=2)
    print(f"💾 History updated at {HISTORY_PATH}")

    # 6. Generate Report
    with open(REPORT_PATH, 'w') as f:
        f.write("# ML Model Performance Trend Report\n\n")
        f.write(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"**Model:** `mastery_model.pkl`\n")
        f.write(f"**Test Set Size:** {len(test_df)}\n\n")

        f.write("## Current Performance\n")
        f.write(f"- **Accuracy:** {accuracy:.2%}\n")
        if alert_msg:
            f.write(f"- **Status:** {alert_msg}\n")
        else:
            f.write("- **Status:** ✅ Stable\n")

        f.write("\n## Historical Trend\n")
        f.write("| Date | Accuracy | Change |\n")
        f.write("|------|----------|--------|\n")

        for i, run in enumerate(history):
            date_str = run['timestamp'][:10]
            acc = run['accuracy']
            change = "-"
            if i > 0:
                prev_acc = history[i-1]['accuracy']
                diff = acc - prev_acc
                change = f"{diff:+.2%}"

            f.write(f"| {date_str} | {acc:.2%} | {change} |\n")

    print(f"📄 Report generated at {REPORT_PATH}")

if __name__ == "__main__":
    evaluate_model()
