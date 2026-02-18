import joblib
import hashlib
import os
from datetime import datetime
import sklearn

# Configuration for models to check
MODELS_CONFIG = [
    {
        "name": "Topic Mastery Prediction Model",
        "model_path": "models/mastery_model.pkl",
        "training_script": "training/train_mastery_model.py",
        "training_data": "training/training_data.csv",
        "retrain_command": "python3 src/ml/training/train_mastery_model.py"
    }
]

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

def check_sklearn_version(stored_version):
    """Check if stored sklearn version matches current environment"""
    current_version = sklearn.__version__
    if stored_version != current_version:
        return f"- ⚠️ **Version Mismatch:** Model trained with scikit-learn {stored_version}, running with {current_version}."
    return None

def check_freshness():
    # Define paths relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    report_lines = []

    report_lines.append("# ML Model Freshness Report\n")
    report_lines.append(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    report_lines.append(f"**Environment Scikit-learn Version:** {sklearn.__version__}\n")

    all_fresh = True

    for config in MODELS_CONFIG:
        model_rel_path = config["model_path"]
        model_path = os.path.join(script_dir, model_rel_path)
        script_path = os.path.join(script_dir, config["training_script"])
        data_path = os.path.join(script_dir, config["training_data"])

        report_lines.append(f"## Model: {config['name']}")
        report_lines.append(f"- **Path:** `{model_rel_path}`")
        report_lines.append(f"- **Training Script:** `{config['training_script']}`")
        report_lines.append(f"- **Training Data:** `{config['training_data']}`\n")

        if not os.path.exists(model_path):
            report_lines.append(f"### ❌ Status: MISSING")
            report_lines.append(f"Model file not found at `{model_path}`.")
            all_fresh = False
            continue

        try:
            loaded_object = joblib.load(model_path)
        except Exception as e:
            report_lines.append(f"### ❌ Status: CORRUPT")
            report_lines.append(f"Failed to load model: {e}")
            all_fresh = False
            continue

        # Check for metadata
        if isinstance(loaded_object, dict) and "metadata" in loaded_object:
            metadata = loaded_object["metadata"]
            stored_script_hash = metadata.get("script_hash")
            stored_data_hash = metadata.get("data_hash")
            training_timestamp = metadata.get("training_timestamp")
            stored_sklearn_version = metadata.get("sklearn_version", "unknown")

            report_lines.append("### Metadata")
            report_lines.append(f"- **Training Timestamp:** {training_timestamp}")
            report_lines.append(f"- **Trained with Scikit-learn:** {stored_sklearn_version}")
            report_lines.append(f"- **Stored Script Hash:** `{stored_script_hash}`")
            report_lines.append(f"- **Stored Data Hash:** `{stored_data_hash}`\n")

            # Calculate current hashes
            current_script_hash = get_file_hash(script_path)
            current_data_hash = get_file_hash(data_path)

            issues = []

            # Check hashes
            if current_script_hash != stored_script_hash:
                issues.append("- ⚠️ **Script Drift:** The training script has changed since the model was trained.")
            if current_data_hash != stored_data_hash:
                issues.append("- ⚠️ **Data Drift:** The training data has changed since the model was trained.")

            # Check version
            version_issue = check_sklearn_version(stored_sklearn_version)
            if version_issue:
                issues.append(version_issue)

            if not issues:
                report_lines.append("### ✅ Status: FRESH")
                report_lines.append("The model is up-to-date with the current training script, data, and environment.")
            else:
                report_lines.append("### ⚠️ Status: STALE / MISMATCH")
                report_lines.append("The model is out of sync or environment mismatch detected:")
                for issue in issues:
                    report_lines.append(issue)

                report_lines.append(f"\n**Recommendation:** Run `{config['retrain_command']}` to retrain the model.")
                all_fresh = False

        else:
            report_lines.append("### ❓ Status: UNKNOWN PROVENANCE")
            report_lines.append("The model file does not contain provenance metadata.")
            report_lines.append(f"\n**Recommendation:** Run `{config['retrain_command']}` to retrain the model with metadata.")
            all_fresh = False

        report_lines.append("\n---\n")

    # Summary
    report_lines.append("## Summary")
    if all_fresh:
        report_lines.append("✅ All models are fresh and compatible.")
    else:
        report_lines.append("⚠️ Some models are stale, missing, or have version mismatches. See details above.")

    # Output to file
    report_content = "\n".join(report_lines)
    report_path = os.path.join(script_dir, "MODEL_FRESHNESS_REPORT.md")
    with open(report_path, "w") as f:
        f.write(report_content)

    print(report_content)
    print(f"\n📄 Report saved to: {report_path}")

if __name__ == "__main__":
    check_freshness()
