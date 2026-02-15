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
    data_path = "training_data.csv"
    if not os.path.exists(data_path):
        print("❌ Error: training_data.csv not found!")
        print("   Run generate_data.py first to create training data.")
        return

    # Calculate hashes for provenance
    script_path = __file__
    script_hash = get_file_hash(script_path)
    data_hash = get_file_hash(data_path)
    
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
    model_path = "../models/mastery_model.pkl"
    os.makedirs("../models", exist_ok=True)

    # Create artifact with metadata
    artifact = {
        "model": model,
        "metadata": {
            "script_hash": script_hash,
            "data_hash": data_hash,
            "training_timestamp": datetime.now().isoformat(),
            "sklearn_version": sklearn.__version__
        }
    }

    joblib.dump(artifact, model_path)
    
    print(f"\n💾 Model saved to: {model_path}")
    print(f"   Script Hash: {script_hash[:8]}...")
    print(f"   Data Hash:   {data_hash[:8]}...")
    print("\n🎉 Training complete!")
    
    return model, accuracy

if __name__ == "__main__":
    train_model()
