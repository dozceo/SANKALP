"""
SANKALP AEI — LightGBM Mastery Prediction

Trains a binary classifier for concept mastery on synthetic data matching
the 40-feature canonical feature vector defined in ml/models/ensemble.py.
"""

from __future__ import annotations

import os
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score

# Keep import path stable regardless of CWD
_REPO_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_MODEL_PATH = str(_REPO_ROOT / "ml" / "models" / "artifacts" / "lightgbm_model.pkl")

# Canonical feature list (mirrors ensemble.py)
from ml.models.ensemble import ALL_FEATURES  # noqa: E402


def generate_synthetic_data(n_samples: int = 1000) -> tuple[pd.DataFrame, pd.Series]:
    """
    Generate reproducible synthetic data for mastery classification.

    Returns
    -------
    X : DataFrame with 40 feature columns
    y : binary Series (1 = mastery ≥ 0.5)
    """
    rng = np.random.default_rng(42)
    data = {}
    for feat in ALL_FEATURES:
        data[feat] = rng.uniform(0.0, 1.0, size=n_samples)

    X = pd.DataFrame(data)
    # Label: mastery is driven primarily by concept_mastery_mean
    mastery_score = (
        0.5 * X["concept_mastery_mean"]
        + 0.2 * X["mastery_velocity"]
        + 0.15 * X["session_consistency_score"]
        + 0.15 * rng.uniform(0.0, 1.0, size=n_samples)
    )
    y = (mastery_score >= 0.5).astype(int)
    return X, pd.Series(y, name="mastery")


def train(X: pd.DataFrame, y: pd.Series, run_cv: bool = True) -> LGBMClassifier:
    """
    Train LGBMClassifier and return the fitted model.

    Parameters match architecture spec:
      n_estimators=200, learning_rate=0.05, max_depth=6, num_leaves=31

    Parameters
    ----------
    run_cv : bool
        When True (default) run 5-fold cross-validation and print scores.
        Set to False to skip CV and train directly (useful for unit tests /
        pipeline orchestration where CV is not needed).
    """
    model = LGBMClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=6,
        num_leaves=31,
        random_state=42,
        n_jobs=-1,
        verbose=-1,
    )
    if run_cv:
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        scores = cross_val_score(model, X, y, cv=cv, scoring="accuracy")
        print(f"[LightGBM] CV accuracy: {scores.mean():.4f} ± {scores.std():.4f}")
    model.fit(X, y)
    return model


def save_model(model: LGBMClassifier, path: str = _DEFAULT_MODEL_PATH) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as fh:
        pickle.dump(model, fh)
    print(f"[LightGBM] Model saved → {path}")


def load_model(path: str = _DEFAULT_MODEL_PATH) -> LGBMClassifier:
    with open(path, "rb") as fh:
        return pickle.load(fh)


def main() -> None:
    X, y = generate_synthetic_data(n_samples=1000)
    model = train(X, y)
    save_model(model)


if __name__ == "__main__":
    main()
