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
import sklearn
import json
import sys

# Import provenance utilities
try:
    from provenance_utils import generate_provenance_record, get_file_hash, get_git_hash
except ImportError:
    # Handle case where script is run from a different directory
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from provenance_utils import generate_provenance_record, get_file_hash, get_git_hash

def train_model():
    """Train the Topic Mastery prediction model"""
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, "training_data.csv")

    if not os.path.exists(data_path):
        print("❌ Error: training_data.csv not found!")
        print("   Run generate_data.py first to create training data.")
        return

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
    params = {
        "model_type": "LogisticRegression",
        "test_size": 0.2,
        "random_state": 42,
        "max_iter": 1000,
        "class_weight": "balanced"
    }

    model = LogisticRegression(
        random_state=params["random_state"],
        max_iter=params["max_iter"],
        class_weight=params["class_weight"]
    )
    model.fit(X_train, y_train)
    
    # Evaluate on test set
    print("\n📈 Evaluating model performance...")
    y_pred = model.predict(X_test)
    
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
    feature_importance = {}
    for feature, coef in zip(feature_columns, model.coef_[0]):
        direction = "increases" if coef > 0 else "decreases"
        print(f"   {feature}: {abs(coef):.3f} ({direction} mastery)")
        feature_importance[feature] = float(coef)
    
    # Save model
    if os.path.exists("src/ml/models"):
        model_dir = "src/ml/models"
    else:
        model_dir = "../models"

    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "mastery_model.pkl")

    # Generate provenance record
    metrics = {
        "accuracy": float(accuracy),
        "feature_importance": feature_importance
    }

    environment = {
        "sklearn_version": sklearn.__version__,
        "pandas_version": pd.__version__,
        "numpy_version": np.__version__,
        "joblib_version": joblib.__version__
    }

    provenance = generate_provenance_record(
        model_name="Topic Mastery Prediction Model",
        version="1.0.0",
        script_path=__file__,
        data_path=data_path,
        params=params,
        metrics=metrics,
        environment_info=environment
    )

    # Add data metadata to provenance
    provenance["provenance"]["data_generation_metadata"] = data_metadata

    # Create artifact with metadata - Ensure backward compatibility
    # Old metadata had: script_hash, data_hash, git_hash, training_timestamp, sklearn_version
    metadata_to_save = provenance["provenance"].copy()
    metadata_to_save["training_timestamp"] = provenance["training_timestamp"]
    metadata_to_save["sklearn_version"] = environment["sklearn_version"]

    artifact = {
        "model": model,
        "metadata": metadata_to_save
    }

    joblib.dump(artifact, model_path)

    provenance_path = os.path.join(model_dir, "provenance_report.json")
    with open(provenance_path, "w") as f:
        json.dump(provenance, f, indent=2, default=str)

    print(f"\n💾 Model saved to: {model_path}")
    print(f"📄 Provenance report saved to: {provenance_path}")
    print(f"   Script Hash: {provenance['provenance']['script_hash'][:8]}...")
    print(f"   Data Hash:   {provenance['provenance']['data_hash'][:8]}...")
    print(f"   Git Hash:    {provenance['provenance']['git_commit_hash'][:8]}...")
    print("\n🎉 Training complete!")
    
    return model, accuracy

if __name__ == "__main__":
    train_model()
