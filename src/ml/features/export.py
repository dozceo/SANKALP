"""
SANKALP AEI — Feature Snapshot Exporter

Reads feature snapshots from Firestore (written by FeatureEngineeringBlockImpl)
and exports them to a CSV file ready for ml/training/pipeline.py to consume.

Usage:
  python -m ml.features.export [--out ml/features/training_data.csv]

This bridges the TypeScript feature extraction layer with the Python ML training
pipeline — no Kaggle data needed. All training data comes from Firestore snapshots
of real (or synthetic seeded) learner interactions.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

# ---------------------------------------------------------------------------
# Canonical 40-feature list from ml/models/ensemble.py
# ---------------------------------------------------------------------------

ALL_FEATURES = [
    # Mastery (10)
    "concept_mastery_mean", "concept_mastery_std_dev", "subject_mastery_distribution",
    "mastery_velocity", "concept_strength_variance", "learning_asymptote_estimate",
    "concepts_mastered_count", "concepts_learning_count", "concepts_struggling_count",
    "mastery_percentile",
    # Temporal (8)
    "days_since_last_interaction", "interaction_frequency_per_week",
    "session_consistency_score", "learning_pattern_signature", "optimal_spacing_adherence",
    "time_of_day_preference", "session_duration_trend", "inter_session_interval_avg",
    # Behavioral (12)
    "chat_frequency", "quiz_attempt_pattern", "resource_exploration_depth",
    "engagement_volatility", "error_pattern_signature", "learning_style_indicator",
    "hint_usage_rate", "revision_behavior", "persistence_indicator",
    "peer_comparison_engagement", "device_consistency", "social_study_behavior",
    # Cognitive load (10)
    "attention_span_estimation", "distraction_frequency", "mental_fatigue_indicator",
    "optimal_learning_window", "processing_speed_estimate", "context_switching_frequency",
    "cognitive_load_capacity", "recovery_time_after_failure",
    "question_complexity_preference", "multi_tasking_indicator",
]

# camelCase → snake_case mapping for TypeScript feature vector keys
_CAMEL_TO_SNAKE: Dict[str, str] = {
    "conceptMasteryMean": "concept_mastery_mean",
    "conceptMasteryStdDev": "concept_mastery_std_dev",
    "subjectMasteryDistribution": "subject_mastery_distribution",
    "masteryVelocity": "mastery_velocity",
    "conceptStrengthVariance": "concept_strength_variance",
    "learningAsymptoteEstimate": "learning_asymptote_estimate",
    "conceptsMasteredCount": "concepts_mastered_count",
    "conceptsLearningCount": "concepts_learning_count",
    "conceptsStrugglingCount": "concepts_struggling_count",
    "masteryPercentile": "mastery_percentile",
    "daysSinceLastInteraction": "days_since_last_interaction",
    "interactionFrequencyPerWeek": "interaction_frequency_per_week",
    "sessionConsistencyScore": "session_consistency_score",
    "learningPatternSignature": "learning_pattern_signature",
    "optimalSpacingAdherence": "optimal_spacing_adherence",
    "timeOfDayPreference": "time_of_day_preference",
    "sessionDurationTrend": "session_duration_trend",
    "interSessionIntervalAvg": "inter_session_interval_avg",
    "chatFrequency": "chat_frequency",
    "quizAttemptPattern": "quiz_attempt_pattern",
    "resourceExplorationDepth": "resource_exploration_depth",
    "engagementVolatility": "engagement_volatility",
    "errorPatternSignature": "error_pattern_signature",
    "learningStyleIndicator": "learning_style_indicator",
    "hintUsageRate": "hint_usage_rate",
    "revisionBehavior": "revision_behavior",
    "persistenceIndicator": "persistence_indicator",
    "peerComparisonEngagement": "peer_comparison_engagement",
    "deviceConsistency": "device_consistency",
    "socialStudyBehavior": "social_study_behavior",
    "attentionSpanEstimation": "attention_span_estimation",
    "distractionFrequency": "distraction_frequency",
    "mentalFatigueIndicator": "mental_fatigue_indicator",
    "optimalLearningWindow": "optimal_learning_window",
    "processingSpeedEstimate": "processing_speed_estimate",
    "contextSwitchingFrequency": "context_switching_frequency",
    "cognitiveLoadCapacity": "cognitive_load_capacity",
    "recoveryTimeAfterFailure": "recovery_time_after_failure",
    "questionComplexityPreference": "question_complexity_preference",
    "multiTaskingIndicator": "multi_tasking_indicator",
}


def normalize_keys(doc: Dict[str, Any]) -> Dict[str, float]:
    """Convert a Firestore feature snapshot (may be camelCase) to snake_case dict."""
    result: Dict[str, float] = {}
    for key, value in doc.items():
        snake = _CAMEL_TO_SNAKE.get(key, key)
        if snake in ALL_FEATURES and isinstance(value, (int, float)):
            result[snake] = float(value)
    return result


def derive_label(features: Dict[str, float]) -> int:
    """
    Derive a binary mastery label from feature values for supervised training.

    Label = 1 (mastered) if:
      - concept_mastery_mean >= 0.6  AND
      - engagement_volatility <= 0.5  AND
      - days_since_last_interaction <= 0.5 (normalized, < 15 days)

    Label = 0 (at-risk) otherwise.

    This heuristic creates a training signal from synthetic data when
    no human-labeled outcomes are available.
    """
    mastery = features.get("concept_mastery_mean", 0.0)
    volatility = features.get("engagement_volatility", 1.0)
    inactivity = features.get("days_since_last_interaction", 1.0)

    mastered = mastery >= 0.6 and volatility <= 0.5 and inactivity <= 0.5
    return 1 if mastered else 0


# ---------------------------------------------------------------------------
# Firestore reader (falls back to JSON files if Firebase unavailable)
# ---------------------------------------------------------------------------

def read_from_firestore(limit: int = 5000) -> List[Dict[str, Any]]:
    """Read feature snapshots from Firestore feature_snapshots collection."""
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if not firebase_admin._apps:
            if cred_path and Path(cred_path).exists():
                cred = credentials.Certificate(cred_path)
            else:
                cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred)

        db = firestore.client()
        snap = db.collection("feature_snapshots").limit(limit).get()
        docs = [doc.to_dict() for doc in snap]
        print(f"[export] Loaded {len(docs)} feature snapshots from Firestore.")
        return docs
    except ImportError:
        print("[export] firebase_admin not installed — trying JSON fallback.")
        return []
    except Exception as e:
        print(f"[export] Firestore read failed: {e}")
        return []


def read_from_json_files(data_dir: str = "data/synthetic") -> List[Dict[str, Any]]:
    """Fallback: read feature vectors from JSON files in data/synthetic/."""
    docs = []
    data_path = Path(data_dir)
    if not data_path.exists():
        print(f"[export] No data directory found at {data_dir}")
        return []

    for json_file in data_path.glob("features_*.json"):
        with open(json_file) as f:
            content = json.load(f)
            if isinstance(content, list):
                docs.extend(content)
            elif isinstance(content, dict):
                docs.append(content)

    print(f"[export] Loaded {len(docs)} feature records from JSON files.")
    return docs


# ---------------------------------------------------------------------------
# CSV export
# ---------------------------------------------------------------------------

def export_to_csv(docs: List[Dict[str, Any]], out_path: str) -> int:
    """
    Write feature snapshots to CSV with canonical snake_case column names.

    Returns the number of rows written.
    """
    if not docs:
        print("[export] No documents to export.")
        return 0

    Path(out_path).parent.mkdir(parents=True, exist_ok=True)

    rows_written = 0
    skipped = 0

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        fieldnames = ["learner_id", "generated_at"] + ALL_FEATURES + ["label"]
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()

        for doc in docs:
            features = normalize_keys(doc)

            # Skip rows with fewer than 20 features (incomplete snapshots)
            if len(features) < 20:
                skipped += 1
                continue

            row: Dict[str, Any] = {
                "learner_id": doc.get("learnerId", doc.get("learner_id", "")),
                "generated_at": doc.get("generatedAt", doc.get("generated_at", "")),
                "label": derive_label(features),
            }
            # Fill all feature columns (missing → 0.0)
            for feat in ALL_FEATURES:
                row[feat] = features.get(feat, 0.0)

            writer.writerow(row)
            rows_written += 1

    print(f"[export] ✅ Exported {rows_written} rows to {out_path} (skipped {skipped} incomplete)")
    return rows_written


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Export Firestore feature snapshots to CSV for ML training.")
    parser.add_argument("--out", default="ml/features/training_data.csv", help="Output CSV path")
    parser.add_argument("--limit", type=int, default=5000, help="Max Firestore rows to fetch")
    parser.add_argument("--json-dir", default="data/synthetic", help="Fallback JSON directory")
    args = parser.parse_args()

    # Try Firestore first, fall back to JSON
    docs = read_from_firestore(limit=args.limit)
    if not docs:
        docs = read_from_json_files(data_dir=args.json_dir)

    if not docs:
        print("[export] ❌ No data found. Run 'npm run generate:data && npm run seed' first.")
        sys.exit(1)

    rows = export_to_csv(docs, args.out)
    if rows > 0:
        print(f"[export] Ready for training: python ml/training/pipeline.py --data {args.out}")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
