"""
SANKALP AEI — XGBoost Dropout Risk Prediction

Trains a binary classifier for dropout/disengagement risk.
"""

from __future__ import annotations

import os
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, cross_val_score
from xgboost import XGBClassifier

_REPO_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_MODEL_PATH = str(_REPO_ROOT / "ml" / "models" / "artifacts" / "xgboost_model.pkl")

from ml.models.ensemble import ALL_FEATURES  # noqa: E402


def generate_synthetic_data(n_samples: int = 1000) -> tuple[pd.DataFrame, pd.Series]:
    """
    Generate synthetic data for dropout-risk classification.

    Returns
    -------
    X : DataFrame with 40 feature columns
    y : binary Series (1 = disengaged/dropout risk)
    """
    rng = np.random.default_rng(42)
    data = {feat: rng.uniform(0.0, 1.0, size=n_samples) for feat in ALL_FEATURES}
    X = pd.DataFrame(data)
    # Dropout risk driven by low engagement + high volatility
    risk_score = (
        0.4 * (1.0 - X["interaction_frequency_per_week"])
        + 0.3 * X["engagement_volatility"]
        + 0.2 * X["distraction_frequency"]
        + 0.1 * rng.uniform(0.0, 1.0, size=n_samples)
    )
    y = (risk_score >= 0.5).astype(int)
    return X, pd.Series(y, name="dropout_risk")


def train(X: pd.DataFrame, y: pd.Series, run_cv: bool = True) -> XGBClassifier:
    """Train XGBClassifier.

    Parameters
    ----------
    run_cv : bool
        When True (default) run 5-fold cross-validation and print scores.
        Set to False to skip CV (useful for unit tests / pipeline orchestration).
    """
    model = XGBClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=5,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1,
        verbosity=0,
    )
    if run_cv:
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        scores = cross_val_score(model, X, y, cv=cv, scoring="accuracy")
        print(f"[XGBoost] CV accuracy: {scores.mean():.4f} ± {scores.std():.4f}")
    model.fit(X, y)
    return model


def save_model(model: XGBClassifier, path: str = _DEFAULT_MODEL_PATH) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as fh:
        pickle.dump(model, fh)
    print(f"[XGBoost] Model saved → {path}")


def load_model(path: str = _DEFAULT_MODEL_PATH) -> XGBClassifier:
    with open(path, "rb") as fh:
        return pickle.load(fh)


def main() -> None:
    X, y = generate_synthetic_data(n_samples=1000)
    model = train(X, y)
    save_model(model)


if __name__ == "__main__":
    main()
