"""
SANKALP AEI — Model Evaluation Metrics

Accuracy, sensitivity, specificity, AUC, and F1 for binary and multi-class
classifiers.  Binary-specific metrics (sensitivity, specificity) fall back to
macro-averaged recall when the target is multi-class.
"""

from __future__ import annotations

from typing import Optional

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    recall_score,
    roc_auc_score,
)


def _is_binary(y: np.ndarray) -> bool:
    return len(np.unique(y)) <= 2


def compute_accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    return float(accuracy_score(y_true, y_pred))


def compute_sensitivity(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Recall for the positive class (binary) or macro recall (multi-class)."""
    if _is_binary(y_true):
        return float(recall_score(y_true, y_pred, pos_label=1, zero_division=0))
    return float(recall_score(y_true, y_pred, average="macro", zero_division=0))


def compute_specificity(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Recall for the negative class (binary) or macro recall (multi-class)."""
    if _is_binary(y_true):
        return float(recall_score(y_true, y_pred, pos_label=0, zero_division=0))
    return float(recall_score(y_true, y_pred, average="macro", zero_division=0))


def compute_auc(y_true: np.ndarray, y_proba: np.ndarray) -> float:
    """Area under the ROC curve. Requires probability scores."""
    if not _is_binary(y_true) and y_proba.ndim == 2:
        return float(
            roc_auc_score(y_true, y_proba, multi_class="ovr", average="macro")
        )
    return float(roc_auc_score(y_true, y_proba))


def compute_all_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_proba: Optional[np.ndarray] = None,
) -> dict:
    """Return a metrics dict: accuracy, sensitivity, specificity, f1, (auc)."""
    is_binary = _is_binary(y_true)
    metrics: dict = {
        "accuracy": compute_accuracy(y_true, y_pred),
        "sensitivity": compute_sensitivity(y_true, y_pred),
        "specificity": compute_specificity(y_true, y_pred),
        "f1": float(
            f1_score(
                y_true,
                y_pred,
                average="binary" if is_binary else "macro",
                zero_division=0,
            )
        ),
    }
    if y_proba is not None:
        try:
            metrics["auc"] = compute_auc(y_true, y_proba)
        except ValueError:
            pass
    return metrics


def evaluate_model(model, X_test: np.ndarray, y_test: np.ndarray) -> dict:
    """Run predict / predict_proba on *model* and return all metrics."""
    y_pred = model.predict(X_test)
    y_proba: Optional[np.ndarray] = None
    if hasattr(model, "predict_proba"):
        raw = model.predict_proba(X_test)
        # Binary: take probability of positive class; multi-class: keep full matrix
        if raw.ndim == 2 and raw.shape[1] == 2:
            y_proba = raw[:, 1]
        else:
            y_proba = raw
    return compute_all_metrics(y_test, y_pred, y_proba)


def print_report(metrics: dict) -> None:
    print("=" * 40)
    print("Model Evaluation Report")
    print("=" * 40)
    for key, value in metrics.items():
        print(f"  {key:<15}: {value:.4f}")
    print("=" * 40)
