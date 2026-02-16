import joblib
import hashlib
import os
import sys
from datetime import datetime

def get_file_hash(filepath):
    """Calculate SHA256 hash of a file"""
    if not os.path.exists(filepath):
        return None
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        # Read and update hash string value in blocks of 4K
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def check_freshness():
    # Define paths relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Assuming standard project structure:
    # src/ml/check_model_freshness.py
    # src/ml/models/mastery_model.pkl
    # src/ml/training/train_mastery_model.py
    # src/ml/training/training_data.csv

    # If script is in src/ml:
    model_path = os.path.join(script_dir, "models", "mastery_model.pkl")
    training_script_path = os.path.join(script_dir, "training", "train_mastery_model.py")
    data_path = os.path.join(script_dir, "training", "training_data.csv")

    print("# ML Model Freshness Report\n")
    print(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"**Model:** `{model_path}`")
    print(f"**Training Script:** `{training_script_path}`")
    print(f"**Training Data:** `{data_path}`\n")

    if not os.path.exists(model_path):
        print("## ❌ Model Missing")
        print(f"Model file not found at `{model_path}`.")
        return

    try:
        loaded_object = joblib.load(model_path)
    except Exception as e:
        print("## ❌ Load Failed")
        print(f"Failed to load model: {e}")
        return

    # Check for metadata
    if isinstance(loaded_object, dict) and "metadata" in loaded_object:
        metadata = loaded_object["metadata"]
        stored_script_hash = metadata.get("script_hash")
        stored_data_hash = metadata.get("data_hash")
        training_timestamp = metadata.get("training_timestamp")
        sklearn_version = metadata.get("sklearn_version", "unknown")

        print("## Model Metadata")
        print(f"- **Training Timestamp:** {training_timestamp}")
        print(f"- **Scikit-learn Version:** {sklearn_version}")
        print(f"- **Stored Script Hash:** `{stored_script_hash}`")
        print(f"- **Stored Data Hash:** `{stored_data_hash}`\n")

        # Calculate current hashes
        current_script_hash = get_file_hash(training_script_path)
        current_data_hash = get_file_hash(data_path)

        print("## Current State")
        print(f"- **Current Script Hash:** `{current_script_hash}`")
        print(f"- **Current Data Hash:** `{current_data_hash}`\n")

        issues = []
        if current_script_hash != stored_script_hash:
            issues.append("- ⚠️ **Script Drift:** The training script has changed since the model was trained.")
        if current_data_hash != stored_data_hash:
            issues.append("- ⚠️ **Data Drift:** The training data has changed since the model was trained.")

        if not issues:
            print("## ✅ Status: FRESH")
            print("The model is up-to-date with the current training script and data.")
        else:
            print("## ⚠️ Status: STALE")
            print("The model is out of sync with the codebase:")
            for issue in issues:
                print(issue)
            print("\n**Recommendation:** Run `python3 src/ml/training/train_mastery_model.py` to retrain the model.")

    else:
        print("## ❓ Status: UNKNOWN PROVENANCE")
        print("The model file does not contain provenance metadata. It likely predates the current versioning system.")
        print("\n**Recommendation:** Run `python3 src/ml/training/train_mastery_model.py` to retrain the model with metadata.")

if __name__ == "__main__":
    check_freshness()
