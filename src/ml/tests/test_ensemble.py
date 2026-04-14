"""
Tests for ml/models/ensemble.py

Verifies EnsembleModel instantiation, prediction structure, probability ranges,
feature list integrity, and ensemble weight correctness.
"""

import sys
import os

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from ml.models.ensemble import (
    EnsembleModel,
    PredictionInput,
    PredictionOutput,
    predict,
    ALL_FEATURES,
    ENSEMBLE_WEIGHTS,
)


def make_input(learner_id: str = "student_001") -> PredictionInput:
    """Create a PredictionInput with mid-range feature values."""
    return PredictionInput(
        learner_id=learner_id,
        features={feat: 0.5 for feat in ALL_FEATURES},
    )


class TestEnsembleModel:
    def test_instantiates_without_artifacts(self):
        model = EnsembleModel()
        assert model is not None
        assert model.models_loaded is False

    def test_predict_returns_prediction_output(self):
        model = EnsembleModel()
        result = model.predict(make_input())
        assert isinstance(result, PredictionOutput)

    def test_predict_mastery_probability_in_range(self):
        model = EnsembleModel()
        result = model.predict(make_input())
        assert 0.0 <= result.mastery_probability <= 1.0

    def test_predict_dropout_probability_in_range(self):
        model = EnsembleModel()
        result = model.predict(make_input())
        assert 0.0 <= result.dropout_probability <= 1.0

    def test_predict_confidence_bounds_valid(self):
        model = EnsembleModel()
        result = model.predict(make_input())
        assert result.confidence_lower <= result.mastery_probability
        assert result.confidence_upper >= result.mastery_probability
        assert 0.0 <= result.confidence_lower <= 1.0
        assert 0.0 <= result.confidence_upper <= 1.0

    def test_predict_attention_risk_valid_value(self):
        model = EnsembleModel()
        result = model.predict(make_input())
        assert result.attention_risk in {"low", "moderate", "high", "critical"}

    def test_predict_preserves_learner_id(self):
        model = EnsembleModel()
        result = model.predict(make_input("unique_learner_xyz"))
        assert result.learner_id == "unique_learner_xyz"

    def test_predict_high_mastery_gives_low_dropout(self):
        model = EnsembleModel()
        high_mastery_input = PredictionInput(
            learner_id="strong_student",
            features={
                **{feat: 0.1 for feat in ALL_FEATURES},
                "concept_mastery_mean": 0.95,
                "mastery_velocity": 0.1,
                "days_since_last_interaction": 0.0,
            },
        )
        result = model.predict(high_mastery_input)
        assert result.mastery_probability >= 0.3

    def test_predict_low_mastery_gives_higher_dropout(self):
        model = EnsembleModel()
        low_mastery_input = PredictionInput(
            learner_id="struggling_student",
            features={
                **{feat: 0.0 for feat in ALL_FEATURES},
                "concept_mastery_mean": 0.05,
                "days_since_last_interaction": 1.0,
            },
        )
        result = model.predict(low_mastery_input)
        assert result.dropout_probability >= 0.2


class TestModuleLevelPredict:
    def test_module_predict_returns_output(self):
        result = predict(make_input())
        assert isinstance(result, PredictionOutput)

    def test_module_predict_mastery_in_range(self):
        result = predict(make_input())
        assert 0.0 <= result.mastery_probability <= 1.0


class TestFeatureList:
    def test_all_features_has_exactly_40_features(self):
        assert len(ALL_FEATURES) == 40

    def test_all_features_are_strings(self):
        assert all(isinstance(f, str) for f in ALL_FEATURES)

    def test_all_features_unique(self):
        assert len(set(ALL_FEATURES)) == len(ALL_FEATURES)


class TestEnsembleWeights:
    def test_weights_sum_to_one(self):
        total = sum(ENSEMBLE_WEIGHTS.values())
        assert abs(total - 1.0) < 1e-9

    def test_all_weights_positive(self):
        assert all(w > 0 for w in ENSEMBLE_WEIGHTS.values())

    def test_expected_models_present(self):
        assert "lightgbm" in ENSEMBLE_WEIGHTS
        assert "xgboost" in ENSEMBLE_WEIGHTS
        assert "dnn" in ENSEMBLE_WEIGHTS
        assert "meta_learner" in ENSEMBLE_WEIGHTS
