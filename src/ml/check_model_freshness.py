#!/usr/bin/env python3
"""
ML Model Freshness & Integrity Check Script.

Scans the models directory for .pkl files and verifies their provenance metadata
against the current state of referenced training scripts and data.

Features:
- Validates model metadata (script hash, data hash).
- Detects staleness (source code or data drift).
- Detects corruption (load failures).
- Supports legacy models with fallback path resolution.
- Exits with non-zero status code on failure for CI/CD integration.
"""

import argparse
import glob
import hashlib
import joblib
import logging
import os
import sys
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

def get_file_hash(filepath: str) -> Optional[str]:
    """
    Calculate SHA256 hash of a file.

    Args:
        filepath: Path to the file.

    Returns:
        Hex digest of SHA256 hash or None if file does not exist.
    """
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
        logger.error(f"Failed to calculate hash for {filepath}: {e}")
        return None

def resolve_paths(
    script_dir: str,
    metadata: Dict[str, Any],
    model_name: str
) -> Tuple[Optional[str], Optional[str]]:
    """
    Resolve absolute paths for training script and data from metadata.

    Args:
        script_dir: Directory of this script.
        metadata: Model metadata dictionary.
        model_name: Name of the model file (for legacy fallback).

    Returns:
        Tuple of (absolute script path, absolute data path).
    """
    repo_root = os.path.abspath(os.path.join(script_dir, "../../"))

    # Try to get paths from metadata first
    script_rel_path = metadata.get("script_path")
    data_rel_path = metadata.get("data_path")

    # Fallback for legacy mastery_model.pkl
    if not script_rel_path and model_name == "mastery_model.pkl":
         logger.warning(f"Using fallback script path for legacy model: {model_name}")
         script_rel_path = "src/ml/training/train_mastery_model.py"

    if not data_rel_path and model_name == "mastery_model.pkl":
         logger.warning(f"Using fallback data path for legacy model: {model_name}")
         data_rel_path = "src/ml/training/training_data.csv"

    if not script_rel_path or not data_rel_path:
        return None, None

    full_script_path = os.path.join(repo_root, script_rel_path)
    full_data_path = os.path.join(repo_root, data_rel_path)

    return full_script_path, full_data_path

def check_model_integrity(model_path: str, script_dir: str) -> bool:
    """
    Check the integrity and freshness of a single model file.

    Args:
        model_path: Path to the .pkl model file.
        script_dir: Directory of this script (for relative path resolution).

    Returns:
        True if the model is fresh and valid, False otherwise.
    """
    model_name = os.path.basename(model_path)
    print(f"## Checking `{model_name}`")

    try:
        loaded_object = joblib.load(model_path)
    except Exception as e:
        print(f"- ❌ **CORRUPTION DETECTED**: Failed to load model. Error: {e}\n")
        return False

    if not isinstance(loaded_object, dict) or "metadata" not in loaded_object:
         print("- ❓ **UNKNOWN PROVENANCE**: Model is not a dictionary or lacks metadata.")
         print("  Recommendation: Retrain model to enable integrity checks.\n")
         return False

    metadata = loaded_object["metadata"]
    stored_script_hash = metadata.get("script_hash")
    stored_data_hash = metadata.get("data_hash")
    training_timestamp = metadata.get("training_timestamp")
    sklearn_version = metadata.get("sklearn_version", "unknown")

    print(f"- **Training Timestamp:** {training_timestamp}")
    print(f"- **Scikit-learn Version:** {sklearn_version}")

    full_script_path, full_data_path = resolve_paths(script_dir, metadata, model_name)

    if not full_script_path or not full_data_path:
        print("- ⚠️ **MISSING PATH INFO**: Could not determine training script or data path from metadata.")
        print("  Recommendation: Retrain model to update metadata.\n")
        return False

    # Get relative paths for display
    repo_root = os.path.abspath(os.path.join(script_dir, "../../"))
    display_script = os.path.relpath(full_script_path, repo_root)
    display_data = os.path.relpath(full_data_path, repo_root)

    print(f"- **Training Script:** `{display_script}`")
    print(f"- **Training Data:** `{display_data}`")

    current_script_hash = get_file_hash(full_script_path)
    current_data_hash = get_file_hash(full_data_path)

    issues = []

    # Script Check
    if current_script_hash != stored_script_hash:
        if current_script_hash is None:
             issues.append(f"- ❌ **Script Missing**: Script not found at `{display_script}`")
        else:
             issues.append("- ⚠️ **Script Drift**: The training script has changed since the model was trained.")

    # Data Check
    if current_data_hash != stored_data_hash:
        if current_data_hash is None:
             issues.append(f"- ❌ **Data Missing**: Data file not found at `{display_data}`")
        else:
             issues.append("- ⚠️ **Data Drift**: The training data has changed since the model was trained.")

    if not issues:
        print("- ✅ **Status: FRESH**")
        print("")
        return True
    else:
        print("- ⚠️ **Status: STALE**")
        for issue in issues:
            print(f"  {issue}")
        print(f"  Recommendation: Run `python3 {display_script}` to retrain the model.")
        print("")
        return False

def main() -> int:
    parser = argparse.ArgumentParser(description="Check ML model freshness and integrity.")
    parser.add_argument("--models-dir", type=str, help="Directory containing .pkl model files.")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging.")
    args = parser.parse_args()

    if args.verbose:
        logger.setLevel(logging.DEBUG)

    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Default models directory if not provided
    models_dir = args.models_dir
    if not models_dir:
        models_dir = os.path.join(script_dir, "models")

    print("# ML Model Freshness Report\n")
    print(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"**Models Directory:** `{models_dir}`\n")

    if not os.path.exists(models_dir):
        logger.error(f"Models directory not found at {models_dir}")
        return 1

    model_files = glob.glob(os.path.join(models_dir, "*.pkl"))

    if not model_files:
        print("No .pkl files found in target directory.")
        return 0

    all_fresh = True
    for model_path in model_files:
        if not check_model_integrity(model_path, script_dir):
            all_fresh = False

    return 0 if all_fresh else 1

if __name__ == "__main__":
    sys.exit(main())
