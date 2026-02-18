
import subprocess
import hashlib
import os
import json
import sys
from datetime import datetime

def get_git_hash():
    """Get the current git commit hash"""
    try:
        # Check if we are in a git repo
        subprocess.check_output(['git', 'rev-parse', '--is-inside-work-tree'], stderr=subprocess.DEVNULL)
        return subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode('ascii').strip()
    except Exception as e:
        # If git is not installed or not in a repo
        return "unknown_commit"

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

def generate_provenance_record(
    model_name,
    version,
    script_path,
    data_path,
    params,
    metrics,
    environment_info=None
):
    """
    Generates a provenance dictionary record.
    """
    timestamp = datetime.now().isoformat()
    script_hash = get_file_hash(script_path) if script_path else None
    data_hash = get_file_hash(data_path) if data_path else None
    git_hash = get_git_hash()

    if environment_info is None:
        environment_info = {}

    environment_info.update({
        "python_version": sys.version,
        "platform": sys.platform
    })

    record = {
        "model_name": model_name,
        "version": version,
        "training_timestamp": timestamp,
        "provenance": {
            "git_commit_hash": git_hash,
            "script_hash": script_hash,
            "data_hash": data_hash,
            "data_source": data_path,
        },
        "parameters": params,
        "metrics": metrics,
        "environment": environment_info
    }
    return record
