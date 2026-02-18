#!/usr/bin/env python3
"""
Topic Mastery Model Training Script

Trains a Logistic Regression classifier to predict whether a student has mastered a topic.
Uses synthetic data initially, can be retrained on real user data later.

Usage:
    python3 train_mastery_model.py --data path/to/data.csv --out path/to/models/
"""

import argparse
import hashlib
import json
import logging
import os
import subprocess
import sys
from datetime import datetime
from typing import Dict, Optional, Any, Tuple

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

def get_repo_root() -> str:
    """Get the repository root path"""
    # Assuming this script is at src/ml/training/train_mastery_model.py
    script_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.abspath(os.path.join(script_dir, "../../../"))

def get_git_hash() -> str:
    """Get the current git commit hash"""
    try:
        return subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode('ascii').strip()
    except Exception as e:
        logger.warning(f"Could not get git hash: {e}")
        return "unknown"

def get_file_hash(filepath: str) -> Optional[str]:
    """Calculate SHA256 hash of a file"""
    if not os.path.exists(filepath):
        return None

    sha256_hash = hashlib.sha256()
    try:
        with open(filepath, "rb") as f:
            # Read and update hash string value in blocks of 4K
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except Exception as e:
        logger.error(f"Failed to hash file {filepath}: {e}")
        return None

def train_model(data_path: str, output_dir: str) -> Tuple[Optional[Any], float]:
    """
    Train the Topic Mastery prediction model.

    Args:
        data_path: Path to the training data CSV.
        output_dir: Directory to save the trained model and report.

    Returns:
        Tuple of (trained_model, accuracy_score).
    """
    
    # Setup paths
    script_path_abs = os.path.abspath(__file__)
    data_path_abs = os.path.abspath(data_path)
    repo_root = get_repo_root()

    # Calculate relative paths for metadata (for portability/checking)
    try:
        script_rel_path = os.path.relpath(script_path_abs, repo_root)
        data_rel_path = os.path.relpath(data_path_abs, repo_root)
    except ValueError:
        # If paths are on different drives or outside repo, use absolute
        logger.warning("Could not calculate relative paths to repo root. Using absolute paths.")
        script_rel_path = script_path_abs
        data_rel_path = data_path_abs

    if not os.path.exists(data_path_abs):
        logger.error(f"Training data not found at: {data_path_abs}")
        print("   Run generate_data.py first to create training data.")
        return None, 0.0

    # Calculate hashes for provenance
    script_hash = get_file_hash(script_path_abs)
    data_hash = get_file_hash(data_path_abs)
    git_hash = get_git_hash()
    
    logger.info(f"Loading training data from {data_path_abs}...")
    try:
        df = pd.read_csv(data_path_abs)
    except Exception as e:
        logger.error(f"Failed to read CSV: {e}")
        return None, 0.0
    
    # Separate features and target
    feature_columns = [
        'avg_quiz_score',
        'attempts_per_topic',
        'days_since_last_revision',
        'quiz_score_variance',
        'time_spent_per_question'
    ]
    
    # Validate columns exist
    missing_cols = [col for col in feature_columns if col not in df.columns]
    if missing_cols:
        logger.error(f"Missing feature columns in data: {missing_cols}")
        return None, 0.0

    if 'mastered' not in df.columns:
        logger.error("Missing target column 'mastered' in data.")
        return None, 0.0

    X = df[feature_columns]
    y = df['mastered']
    
    # Split into train and test sets
    logger.info("Splitting data into train/test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"   Training samples: {len(X_train)}")
    print(f"   Test samples: {len(X_test)}")
    
    # Train Logistic Regression model
    logger.info("Training Logistic Regression model...")
    model = LogisticRegression(
        random_state=42,
        max_iter=1000,
        class_weight='balanced'  # Handle class imbalance
    )
    model.fit(X_train, y_train)
    
    # Evaluate on test set
    logger.info("Evaluating model performance...")
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
    for feature, coef in zip(feature_columns, model.coef_[0]):
        direction = "increases" if coef > 0 else "decreases"
        print(f"   {feature}: {abs(coef):.3f} ({direction} mastery)")
    
    # Save model
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, "mastery_model.pkl")

    # Create artifact with metadata
    timestamp = datetime.now().isoformat()
    artifact = {
        "model": model,
        "metadata": {
            "script_hash": script_hash,
            "data_hash": data_hash,
            "script_path": script_rel_path,
            "data_path": data_rel_path,
            "git_hash": git_hash,
            "training_timestamp": timestamp,
            "sklearn_version": sklearn.__version__
        }
    }

    try:
        joblib.dump(artifact, model_path)
        logger.info(f"Model saved to: {model_path}")
    except Exception as e:
        logger.error(f"Failed to save model artifact: {e}")
        return None, accuracy
    
    # Generate detailed provenance report
    provenance = {
        "model_name": "Topic Mastery Prediction Model",
        "version": "1.0.0",
        "training_timestamp": timestamp,
        "provenance": {
            "git_commit_hash": git_hash,
            "script_hash": script_hash,
            "data_hash": data_hash,
            "script_path": script_rel_path,
            "data_path": data_rel_path,
            "data_source": data_path_abs
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

    provenance_path = os.path.join(output_dir, "provenance_report.json")
    try:
        with open(provenance_path, "w") as f:
            json.dump(provenance, f, indent=2, default=str)
        logger.info(f"Provenance report saved to: {provenance_path}")
    except Exception as e:
        logger.error(f"Failed to save provenance report: {e}")

    print(f"   Script Hash: {script_hash[:8]}...")
    print(f"   Data Hash:   {data_hash[:8]}...")
    print(f"   Git Hash:    {git_hash[:8]}...")
    print("\n🎉 Training complete!")
    
    return model, accuracy

def main():
    parser = argparse.ArgumentParser(description="Train Topic Mastery Model")

    # Default paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    default_data_path = os.path.join(script_dir, "training_data.csv")
    default_output_dir = os.path.join(script_dir, "../models")

    parser.add_argument("--data", type=str, default=default_data_path, help="Path to training data CSV")
    parser.add_argument("--out", type=str, default=default_output_dir, help="Directory to save model artifacts")

    args = parser.parse_args()

    train_model(args.data, args.out)

if __name__ == "__main__":
    main()
