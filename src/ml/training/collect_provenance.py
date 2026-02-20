
"""
ML Provenance Collection Script (Metadata Only)

This script collects provenance metadata for the ML model training process
without actually executing the training. It generates a report detailing
the data version, script version, and environment state.
"""

import os
import json
import hashlib
import subprocess
import sys
from datetime import datetime

# Configuration
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TRAINING_SCRIPT = os.path.join(SCRIPT_DIR, "train_mastery_model.py")
DATA_PATH = os.path.join(SCRIPT_DIR, "training_data.csv")
MODEL_DIR = os.path.join(SCRIPT_DIR, "../models")
REPORT_PATH = os.path.join(MODEL_DIR, "provenance_report.json")

def get_git_hash():
    """Get the current git commit hash"""
    try:
        return subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode('ascii').strip()
    except Exception as e:
        print(f"⚠️ Warning: Could not get git hash: {e}")
        return "unknown"

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

def main():
    print("🔍 Collecting ML Model Provenance Metadata...")

    # Ensure output directory exists
    os.makedirs(MODEL_DIR, exist_ok=True)

    # 1. Git Hash
    git_hash = get_git_hash()
    print(f"   Git Commit: {git_hash}")

    # 2. Data Hash
    data_hash = get_file_hash(DATA_PATH)
    if data_hash:
        print(f"   Data Hash:  {data_hash[:8]}... ({os.path.basename(DATA_PATH)})")
    else:
        print(f"❌ Error: Data file not found at {DATA_PATH}")
        data_hash = "MISSING"

    # 3. Training Script Hash
    script_hash = get_file_hash(TRAINING_SCRIPT)
    if script_hash:
        print(f"   Script Hash: {script_hash[:8]}... ({os.path.basename(TRAINING_SCRIPT)})")
    else:
        print(f"❌ Error: Training script not found at {TRAINING_SCRIPT}")
        script_hash = "MISSING"

    # 4. Environment Metadata (Python version, etc.)
    env_info = {
        "python_version": sys.version,
        "platform": sys.platform
    }

    # 5. Generate Report
    provenance = {
        "report_type": "Metadata Collection (Dry Run)",
        "timestamp": datetime.now().isoformat(),
        "provenance": {
            "git_commit_hash": git_hash,
            "training_script_hash": script_hash,
            "training_data_hash": data_hash,
            "data_source": DATA_PATH,
            "script_source": TRAINING_SCRIPT
        },
        "environment": env_info,
        "note": "This report was generated without executing model training."
    }

    with open(REPORT_PATH, "w") as f:
        json.dump(provenance, f, indent=2)

    print(f"\n✅ Provenance report generated at: {REPORT_PATH}")

if __name__ == "__main__":
    main()
