import joblib
import hashlib
import os
import sys
import glob
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
    # Assuming this script is in src/ml/
    repo_root = os.path.abspath(os.path.join(script_dir, "../../"))
    models_dir = os.path.join(script_dir, "models")

    print("# ML Model Freshness Report\n")
    print(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"**Models Directory:** `{models_dir}`\n")

    if not os.path.exists(models_dir):
        print(f"❌ Error: Models directory not found at {models_dir}")
        return

    model_files = glob.glob(os.path.join(models_dir, "*.pkl"))

    if not model_files:
        print("No .pkl files found in src/ml/models/")
        return

    all_fresh = True

    for model_path in model_files:
        model_name = os.path.basename(model_path)
        print(f"## Checking `{model_name}`")

        try:
            loaded_object = joblib.load(model_path)
        except Exception as e:
            print(f"- ❌ **CORRUPTION DETECTED**: Failed to load model. Error: {e}\n")
            all_fresh = False
            continue

        if not isinstance(loaded_object, dict) or "metadata" not in loaded_object:
             print("- ❓ **UNKNOWN PROVENANCE**: Model is not a dictionary or lacks metadata.")
             print("  Recommendation: Retrain model to enable integrity checks.\n")
             all_fresh = False
             continue

        metadata = loaded_object["metadata"]
        stored_script_hash = metadata.get("script_hash")
        stored_data_hash = metadata.get("data_hash")
        training_timestamp = metadata.get("training_timestamp")
        sklearn_version = metadata.get("sklearn_version", "unknown")

        print(f"- **Training Timestamp:** {training_timestamp}")
        print(f"- **Scikit-learn Version:** {sklearn_version}")

        # Determine script and data paths
        # Try to get from metadata first
        script_rel_path = metadata.get("script_path")
        data_rel_path = metadata.get("data_path")

        # Fallback for mastery_model.pkl legacy
        if not script_rel_path and model_name == "mastery_model.pkl":
             script_rel_path = "src/ml/training/train_mastery_model.py"
        if not data_rel_path and model_name == "mastery_model.pkl":
             data_rel_path = "src/ml/training/training_data.csv"

        if not script_rel_path or not data_rel_path:
            print("- ⚠️ **MISSING PATH INFO**: Could not determine training script or data path from metadata.")
            print("  Recommendation: Retrain model to update metadata.\n")
            all_fresh = False
            continue

        full_script_path = os.path.join(repo_root, script_rel_path)
        full_data_path = os.path.join(repo_root, data_rel_path)

        print(f"- **Training Script:** `{script_rel_path}`")
        print(f"- **Training Data:** `{data_rel_path}`")

        current_script_hash = get_file_hash(full_script_path)
        current_data_hash = get_file_hash(full_data_path)

        issues = []
        if current_script_hash != stored_script_hash:
            if current_script_hash is None:
                 issues.append(f"- ❌ **Script Missing**: Script not found at `{full_script_path}`")
            else:
                 issues.append("- ⚠️ **Script Drift**: The training script has changed since the model was trained.")

        if current_data_hash != stored_data_hash:
            if current_data_hash is None:
                 issues.append(f"- ❌ **Data Missing**: Data file not found at `{full_data_path}`")
            else:
                 issues.append("- ⚠️ **Data Drift**: The training data has changed since the model was trained.")

        if not issues:
            print("- ✅ **Status: FRESH**")
        else:
            print("- ⚠️ **Status: STALE**")
            for issue in issues:
                print(f"  {issue}")
            print(f"  Recommendation: Run `python3 {script_rel_path}` to retrain the model.")
            all_fresh = False
        print("")

    if not all_fresh:
        sys.exit(1)

if __name__ == "__main__":
    check_freshness()
