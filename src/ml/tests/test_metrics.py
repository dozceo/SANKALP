"""
Tests for ml/evaluation/metrics.py

Verifies correctness of all classification metrics against known values.
"""

import numpy as np
import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from ml.evaluation.metrics import (
    accuracy,
    precision,
    recall,
    f1_score,
    specificity,
    sensitivity,
    auc_roc,
    compute_all_metrics,
)


class TestAccuracy:
    def test_perfect_predictions(self):
        y_true = np.array([1, 0, 1, 0, 1])
        y_pred = np.array([1, 0, 1, 0, 1])
        assert accuracy(y_true, y_pred) == 1.0

    def test_all_wrong(self):
        y_true = np.array([1, 1, 1, 0, 0])
        y_pred = np.array([0, 0, 0, 1, 1])
        assert accuracy(y_true, y_pred) == 0.0

    def test_partial_accuracy(self):
        y_true = np.array([1, 0, 1, 0])
        y_pred = np.array([1, 0, 0, 1])  # 2 correct out of 4
        assert accuracy(y_true, y_pred) == pytest.approx(0.5)

    def test_empty_arrays(self):
        assert accuracy(np.array([]), np.array([])) == 0.0


class TestPrecisionRecallF1:
    # TP=3, TN=1, FP=1, FN=1  → precision=3/4=0.75, recall=3/4=0.75
    y_true = np.array([1, 1, 1, 0, 0, 1])
    y_pred = np.array([1, 1, 1, 0, 1, 0])

    def test_precision(self):
        assert precision(self.y_true, self.y_pred) == pytest.approx(3 / 4)

    def test_recall(self):
        assert recall(self.y_true, self.y_pred) == pytest.approx(3 / 4)

    def test_f1(self):
        p = precision(self.y_true, self.y_pred)
        r = recall(self.y_true, self.y_pred)
        expected = 2 * p * r / (p + r)
        assert f1_score(self.y_true, self.y_pred) == pytest.approx(expected)

    def test_precision_no_positive_preds(self):
        assert precision(np.array([1, 0]), np.array([0, 0])) == 0.0

    def test_recall_no_positives(self):
        assert recall(np.array([0, 0]), np.array([1, 0])) == 0.0


class TestSpecificity:
    def test_known_values(self):
        # TN=2, FP=1 → specificity=2/3
        y_true = np.array([0, 0, 0, 1, 1])
        y_pred = np.array([0, 0, 1, 1, 0])
        assert specificity(y_true, y_pred) == pytest.approx(2 / 3)

    def test_no_actual_negatives(self):
        assert specificity(np.array([1, 1]), np.array([1, 0])) == 0.0


class TestSensitivity:
    def test_sensitivity_equals_recall(self):
        y_true = np.array([1, 0, 1, 1, 0])
        y_pred = np.array([1, 0, 0, 1, 1])
        assert sensitivity(y_true, y_pred) == pytest.approx(recall(y_true, y_pred))


class TestComputeAllMetrics:
    def test_returns_dict_with_all_keys(self):
        y_true = np.array([1, 0, 1, 0, 1])
        y_pred = np.array([1, 0, 0, 0, 1])
        result = compute_all_metrics(y_true, y_pred)
        assert isinstance(result, dict)
        for key in ["accuracy", "precision", "recall", "f1_score", "specificity", "sensitivity"]:
            assert key in result

    def test_includes_auc_roc_when_score_provided(self):
        y_true = np.array([1, 0, 1, 0, 1])
        y_pred = np.array([1, 0, 0, 0, 1])
        y_score = np.array([0.9, 0.1, 0.8, 0.2, 0.7])
        result = compute_all_metrics(y_true, y_pred, y_score=y_score)
        assert "auc_roc" in result


class TestAucRoc:
    def test_perfect_classifier(self):
        y_true = np.array([1, 1, 0, 0])
        y_score = np.array([0.9, 0.8, 0.1, 0.2])
        assert auc_roc(y_true, y_score) == pytest.approx(1.0)

    def test_random_classifier_approx_half(self):
        rng = np.random.default_rng(42)
        n = 1000
        y_true = (rng.random(n) > 0.5).astype(int)
        y_score = rng.random(n)
        auc = auc_roc(y_true, y_score)
        assert 0.4 <= auc <= 0.6

    def test_degenerate_single_class(self):
        # All same label — should return 0.5
        y_true = np.array([1, 1, 1])
        y_score = np.array([0.8, 0.7, 0.9])
        assert auc_roc(y_true, y_score) == pytest.approx(0.5)
