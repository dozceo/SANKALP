"""
SANKALP AEI — DNN Attention-Risk Classification (sklearn MLPClassifier)

Multi-class classifier: 0=low, 1=moderate, 2=high, 3=critical.
Uses scikit-learn MLPClassifier — no PyTorch dependency.
"""

from __future__ import annotations

import os
import pickle
from pathlib import Path
from typing import Dict

import numpy as np
import pandas as pd
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import StratifiedKFold, cross_val_score

_REPO_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_MODEL_PATH = str(_REPO_ROOT / "ml" / "models" / "artifacts" / "dnn_model.pkl")

from ml.models.ensemble import ALL_FEATURES  # noqa: E402


def generate_synthetic_data(n_samples: int = 1000) -> tuple[pd.DataFrame, pd.Series]:
    """
    Generate synthetic data for multi-class attention-risk classification.

    Classes: 0=low, 1=moderate, 2=high, 3=critical
    """
    rng = np.random.default_rng(42)
    data = {feat: rng.uniform(0.0, 1.0, size=n_samples) for feat in ALL_FEATURES}
    X = pd.DataFrame(data)
    attention_score = (
        0.35 * X["attention_span_estimation"]
        + 0.25 * (1.0 - X["distraction_frequency"])
        + 0.25 * (1.0 - X["mental_fatigue_indicator"])
        + 0.15 * X["session_consistency_score"]
    )
    # Map continuous score → 4 risk classes (low is high attention score)
    y = pd.cut(
        attention_score,
        bins=[0.0, 0.35, 0.55, 0.75, 1.01],
        labels=[3, 2, 1, 0],  # high score → low risk
    ).astype(int)
    return X, pd.Series(y, name="attention_risk")


def train(X: pd.DataFrame, y: pd.Series, run_cv: bool = True) -> Dict:
    """
    Fit StandardScaler + MLPClassifier.

    Returns a dict: {"model": MLPClassifier, "scaler": StandardScaler}
    so that serving can scale new inputs consistently.

    Parameters
    ----------
    run_cv : bool
        When True (default) run 5-fold cross-validation and print scores.
        Set to False to skip CV (useful for unit tests / pipeline orchestration).
    """
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = MLPClassifier(
        hidden_layer_sizes=(128, 64, 32),
        activation="relu",
        max_iter=200,
        random_state=42,
    )
    if run_cv:
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        scores = cross_val_score(model, X_scaled, y, cv=cv, scoring="accuracy")
        print(f"[DNN] CV accuracy: {scores.mean():.4f} ± {scores.std():.4f}")
    model.fit(X_scaled, y)
    return {"model": model, "scaler": scaler}


def save_model(artifact: Dict, path: str = _DEFAULT_MODEL_PATH) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as fh:
        pickle.dump(artifact, fh)
    print(f"[DNN] Model saved → {path}")


def load_model(path: str = _DEFAULT_MODEL_PATH) -> Dict:
    with open(path, "rb") as fh:
        return pickle.load(fh)


def main() -> None:
    X, y = generate_synthetic_data(n_samples=1000)
    artifact = train(X, y)
    save_model(artifact)


if __name__ == "__main__":
    main()
