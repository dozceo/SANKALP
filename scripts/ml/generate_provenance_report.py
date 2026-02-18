
import os
import sys
import json

# Add src/ml/training to path to import utils
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src/ml/training')))

try:
    from provenance_utils import generate_provenance_record
except ImportError:
    print("❌ Error: Could not import provenance_utils. Make sure you are running from repo root.")
    sys.exit(1)

OUTPUT_FILE = 'ML_PROVENANCE_REPORT.md'
DATA_PATH = 'src/ml/training/training_data.csv'
SCRIPT_PATH = 'src/ml/training/train_mastery_model.py'

def main():
    print("Generate ML Provenance Report...")

    # Simulate a "Dry Run" provenance record
    # We don't have metrics since we aren't training, so we mark them as pending
    record = generate_provenance_record(
        model_name="Topic Mastery Prediction Model",
        version="1.0.0-dry-run",
        script_path=SCRIPT_PATH,
        data_path=DATA_PATH,
        params={"note": "Dry run for provenance auditing"},
        metrics={"status": "Pending training"},
        environment_info={"environment": "Audit"}
    )

    # Generate Markdown Report
    report = f"# ML Model Provenance Report\n\n"
    report += f"**Date:** {record['training_timestamp']}\n"
    report += f"**Model:** {record['model_name']}\n"
    report += f"**Version:** {record['version']}\n\n"

    report += "## Data Lineage\n"
    report += f"- **Git Commit:** `{record['provenance']['git_commit_hash']}`\n"
    report += f"- **Training Script:** `{record['provenance']['script_hash']}` ({SCRIPT_PATH})\n"
    report += f"- **Training Data:** `{record['provenance']['data_hash']}` ({DATA_PATH})\n\n"

    report += "## Environment\n"
    report += "```json\n"
    report += json.dumps(record['environment'], indent=2)
    report += "\n```\n\n"

    report += "## Reproducibility Status\n"
    if record['provenance']['git_commit_hash'] == "unknown_commit":
        report += "⚠️ **Warning:** Git commit hash could not be determined. Reproducibility is compromised.\n"
    elif record['provenance']['data_hash'] is None:
         report += "⚠️ **Warning:** Training data file missing.\n"
    else:
        report += "✅ **Healthy:** All provenance artifacts are trackable.\n"

    with open(OUTPUT_FILE, 'w') as f:
        f.write(report)

    print(f"Report generated at {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
