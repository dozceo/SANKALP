"""
Topic Mastery Model Training Script

Trains a Logistic Regression classifier to predict whether a student has mastered a topic.
Uses synthetic data initially, can be retrained on real user data later.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os
import hashlib
from datetime import datetime
import sklearn
import subprocess
import json
import sys

def get_git_hash():
    """Get the current git commit hash"""
    try:
        return subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode('ascii').strip()
    except Exception as e:
        print(f"⚠️ Warning: Could not get git hash: {e}")
        return "unknown"

def get_file_hash(filepath):
    """Calculate SHA256 hash of a file"""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        # Read and update hash string value in blocks of 4K
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def train_model():
    """Train the Topic Mastery prediction model"""
    
    # Load training data
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, "training_data.csv")
    if not os.path.exists(data_path):
        print("❌ Error: training_data.csv not found!")
        print("   Run generate_data.py first to create training data.")
        return

    # Calculate hashes for provenance
    script_path = __file__
    script_hash = get_file_hash(script_path)
    data_hash = get_file_hash(data_path)
    git_hash = get_git_hash()

    # Load data generation metadata if available
    data_metadata = {}
    metadata_path = os.path.join(script_dir, "training_data_metadata.json")
    if os.path.exists(metadata_path):
        try:
            with open(metadata_path, "r") as f:
                data_metadata = json.load(f)
            print(f"📄 Loaded data generation metadata from {metadata_path}")
        except Exception as e:
            print(f"⚠️ Warning: Could not load data metadata: {e}")
    
    print("📊 Loading training data...")
    df = pd.read_csv(data_path)
    
    # Separate features and target
    feature_columns = [
        'avg_quiz_score',
        'attempts_per_topic',
        'days_since_last_revision',
        'quiz_score_variance',
        'time_spent_per_question'
    ]
    
    X = df[feature_columns]
    y = df['mastered']
    
    # Split into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"   Training samples: {len(X_train)}")
    print(f"   Test samples: {len(X_test)}")
    
    # Train Logistic Regression model
    print("\n🧠 Training Logistic Regression model...")
    model = LogisticRegression(
        random_state=42,
        max_iter=1000,
        class_weight='balanced'  # Handle class imbalance
    )
    model.fit(X_train, y_train)
    
    # Evaluate on test set
    print("\n📈 Evaluating model performance...")
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n✅ Test Accuracy: {accuracy:.2%}")
    
    print("\n📊 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Not Mastered', 'Mastered']))
    
    print("\n🔢 Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(f"   True Negatives:  {cm[0, 0]}")
    print(f"   False Positives: {cm[0, 1]}")
    print(f"   False Negatives: {cm[1, 0]}")
    print(f"   True Positives:  {cm[1, 1]}")
    
    # Feature importance
    print("\n🎯 Feature Importance:")
    for feature, coef in zip(feature_columns, model.coef_[0]):
        direction = "increases" if coef > 0 else "decreases"
        print(f"   {feature}: {abs(coef):.3f} ({direction} mastery)")
    
    # Save model
    # Use path relative to repo root if running from root, or script dir
    if os.path.exists("src/ml/models"):
        model_dir = "src/ml/models"
    else:
        # Fallback to relative to script if running from script dir
        model_dir = "../models"

    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "mastery_model.pkl")

    # Create artifact with metadata
    timestamp = datetime.now().isoformat()
    artifact = {
        "model": model,
        "metadata": {
            "script_hash": script_hash,
            "data_hash": data_hash,
            "git_hash": git_hash,
            "training_timestamp": timestamp,
            "sklearn_version": sklearn.__version__
        }
    }

    joblib.dump(artifact, model_path)
    
    # Generate detailed provenance report
    provenance = {
        "model_name": "Topic Mastery Prediction Model",
        "version": "1.0.0",
        "training_timestamp": timestamp,
        "provenance": {
            "git_commit_hash": git_hash,
            "script_hash": script_hash,
            "data_hash": data_hash,
            "data_source": data_path,
            "data_generation_metadata": data_metadata
        },
        "parameters": {
            "model_type": "LogisticRegression",
            "test_size": 0.2,
            "random_state": 42,
            "max_iter": 1000,
            "class_weight": "balanced"
        },
        "metrics": {
            "accuracy": float(accuracy),
            "feature_importance": {feature: float(coef) for feature, coef in zip(feature_columns, model.coef_[0])}
        },
        "environment": {
            "python_version": sys.version,
            "sklearn_version": sklearn.__version__,
            "pandas_version": pd.__version__,
            "numpy_version": np.__version__,
            "joblib_version": joblib.__version__
        }
    }

    provenance_path = os.path.join(model_dir, "provenance_report.json")
    with open(provenance_path, "w") as f:
        json.dump(provenance, f, indent=2, default=str)

    print(f"\n💾 Model saved to: {model_path}")
    print(f"📄 Provenance report saved to: {provenance_path}")
    print(f"   Script Hash: {script_hash[:8]}...")
    print(f"   Data Hash:   {data_hash[:8]}...")
    print(f"   Git Hash:    {git_hash[:8]}...")
    print("\n🎉 Training complete!")
    
    return model, accuracy

if __name__ == "__main__":
    train_model()
