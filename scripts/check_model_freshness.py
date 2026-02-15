"""
ML Model Freshness & Integrity Check
Detects version mismatches between trained models and their source code/data.
"""

import sys
import os
import hashlib
import joblib

# Paths (relative to repo root)
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(REPO_ROOT, "src/ml/models/mastery_model.pkl")
SCRIPT_PATH = os.path.join(REPO_ROOT, "src/ml/training/train_mastery_model.py")
DATA_PATH = os.path.join(REPO_ROOT, "src/ml/training/training_data.csv")

def get_file_hash(filepath):
    """Calculate SHA256 hash of a file"""
    if not os.path.exists(filepath):
        return None
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def check_freshness():
    print("🔍 Checking ML Model Freshness & Integrity...")
    print(f"   Model Path: {MODEL_PATH}")

    if not os.path.exists(MODEL_PATH):
        print("❌ Model file not found.")
        sys.exit(1)

    try:
        loaded = joblib.load(MODEL_PATH)
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        sys.exit(1)

    if not isinstance(loaded, dict) or 'metadata' not in loaded:
        print("⚠️  Model exists but lacks provenance metadata (Legacy Format).")
        print("   -> Recommendation: Retrain model to enable integrity checks.")
        return

    metadata = loaded['metadata']
    stored_script_hash = metadata.get('script_hash')
    stored_data_hash = metadata.get('data_hash')

    current_script_hash = get_file_hash(SCRIPT_PATH)
    current_data_hash = get_file_hash(DATA_PATH)

    print(f"\n📋 Metadata Report:")
    print(f"   Training Timestamp: {metadata.get('training_timestamp', 'Unknown')}")
    print(f"   Scikit-learn Ver:   {metadata.get('sklearn_version', 'Unknown')}")

    print("\n🔐 Integrity Check:")

    fresh = True

    # Check Script
    if current_script_hash:
        if current_script_hash == stored_script_hash:
            print("   ✅ Training Script: MATCH")
        else:
            print("   ❌ Training Script: MISMATCH (Code has changed since training)")
            fresh = False
    else:
        print("   ⚠️ Training Script: NOT FOUND")
        fresh = False

    # Check Data
    if current_data_hash:
        if current_data_hash == stored_data_hash:
            print("   ✅ Training Data:   MATCH")
        else:
            print("   ❌ Training Data:   MISMATCH (Data has changed since training)")
            fresh = False
    else:
        if stored_data_hash:
             print("   ⚠️ Training Data:   NOT FOUND (but was present during training)")
             fresh = False
        else:
             print("   ⚪ Training Data:   None stored")

    print("\n📢 Status:")
    if fresh:
        print("   ✅ Model is FRESH and VERIFIED.")
    else:
        print("   ⚠️  Model is STALE or unverifiable.")
        print("   -> Recommendation: Run 'python src/ml/training/train_mastery_model.py'")

if __name__ == "__main__":
    check_freshness()
