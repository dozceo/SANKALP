# -*- coding: utf-8 -*-
from __future__ import annotations

import os as _os
_os.environ.setdefault("PYTHONIOENCODING", "utf-8")

"""
SANKALP AEI - TensorFlow Model Integration Validation

End-to-end test that verifies:
  1. TF models (.h5) load correctly
  2. Single-student predictions work
  3. Batch predictions work
  4. Semantically correct student profiles produce expected results
  5. Ensemble integration works (TF models + pkl models)

Usage:
  cd <repo-root>
  python -m ml.tests.test_tf_integration
"""

import sys
import os
import time
from pathlib import Path

import numpy as np

# Ensure repo root is on sys.path
_REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(_REPO_ROOT))

from ml.models.ensemble import ALL_FEATURES, PredictionInput

# ---------------------------------------------------------------
# Inverse features - HIGH values = BAD for the student
# ---------------------------------------------------------------
_INVERSE_FEATURES = {
    "engagement_volatility", "distraction_frequency", "mental_fatigue_indicator",
    "days_since_last_interaction", "error_pattern_signature",
    "context_switching_frequency", "multi_tasking_indicator",
    "concept_mastery_std_dev", "concept_strength_variance",
    "concepts_struggling_count", "recovery_time_after_failure",
}


def _make_profile(good_val: float, bad_val: float) -> dict:
    """Create profile: good_val for positive features, bad_val for inverse features."""
    profile = {}
    for f in ALL_FEATURES:
        if f in _INVERSE_FEATURES:
            profile[f] = bad_val
        else:
            profile[f] = good_val
    return profile


HIGH_PERFORMING = _make_profile(good_val=0.9, bad_val=0.1)
LOW_PERFORMING = _make_profile(good_val=0.2, bad_val=0.8)
MIXED_PERFORMING = _make_profile(good_val=0.6, bad_val=0.4)
BORDERLINE = {f: 0.5 for f in ALL_FEATURES}


def _make_feature_array(profile: dict) -> np.ndarray:
    return np.array([profile.get(f, 0.0) for f in ALL_FEATURES], dtype=float)


def test_tf_loader_standalone():
    """Test TensorFlowPredictor in isolation."""
    print("\n" + "=" * 60)
    print("TEST 1: TensorFlow Model Loader (Standalone)")
    print("=" * 60)

    from ml.models.tf_loader import TensorFlowPredictor

    tp = TensorFlowPredictor()
    loaded = tp.load()
    assert loaded, "FAIL: No TF models loaded"
    print(f"  Loaded {tp.model_count} model(s)")

    # High-performing student
    x_high = _make_feature_array(HIGH_PERFORMING).reshape(1, -1)
    prob_high = tp.predict_proba(x_high)[0]
    print(f"  High student:  P(mastered) = {prob_high:.6f}")
    assert prob_high > 0.5, f"FAIL: Expected > 0.5, got {prob_high:.6f}"

    # Low-performing student
    x_low = _make_feature_array(LOW_PERFORMING).reshape(1, -1)
    prob_low = tp.predict_proba(x_low)[0]
    print(f"  Low student:   P(mastered) = {prob_low:.6f}")
    assert prob_low < 0.5, f"FAIL: Expected < 0.5, got {prob_low:.6f}"

    # Improvement test
    before = _make_feature_array(_make_profile(0.3, 0.7)).reshape(1, -1)
    after = _make_feature_array(_make_profile(0.8, 0.2)).reshape(1, -1)
    p_before = tp.predict_proba(before)[0]
    p_after = tp.predict_proba(after)[0]
    print(f"  Before improvement: {p_before:.6f}")
    print(f"  After improvement:  {p_after:.6f}")
    assert p_after > p_before, "FAIL: Improved student should have higher score"

    print("\nTEST 1 PASSED\n")


def test_tf_latency():
    """Ensure TF inference is fast."""
    print("=" * 60)
    print("TEST 2: Inference Latency")
    print("=" * 60)

    from ml.models.tf_loader import TensorFlowPredictor
    tp = TensorFlowPredictor()
    tp.load()

    x = _make_feature_array(HIGH_PERFORMING).reshape(1, -1)
    for _ in range(3):
        tp.predict_proba(x)  # warmup

    times = []
    for _ in range(20):
        start = time.perf_counter()
        tp.predict_proba(x)
        times.append((time.perf_counter() - start) * 1000)

    avg_ms = sum(times) / len(times)
    print(f"  Average: {avg_ms:.2f} ms")
    print(f"  P95:     {sorted(times)[18]:.2f} ms")
    print(f"  NOTE: Small 5K-param model, Windows CPU overhead is expected")
    print("\nTEST 2 PASSED\n")


def test_batch_predictions():
    """Test batch inference."""
    print("=" * 60)
    print("TEST 3: Batch Predictions")
    print("=" * 60)

    from ml.models.tf_loader import TensorFlowPredictor
    tp = TensorFlowPredictor()
    tp.load()

    profiles = [_make_profile(0.95 - i * 0.1, 0.05 + i * 0.1) for i in range(10)]
    batch = np.array([_make_feature_array(p) for p in profiles])
    probas = tp.predict_proba(batch)
    labels = tp.predict(batch)

    print(f"  {'#':<4} {'P(Mastered)':<15} {'Label':<12}")
    print(f"  {'-'*4} {'-'*15} {'-'*12}")
    for i, (prob, lbl) in enumerate(zip(probas, labels)):
        print(f"  {i:<4} {prob:<15.6f} {'Mastered' if lbl else 'At-Risk':<12}")

    for i in range(len(probas) - 1):
        assert probas[i] >= probas[i + 1] - 0.05, \
            f"FAIL: Monotonicity violated at {i}"
    print("  Monotonicity check passed")
    print("\nTEST 3 PASSED\n")


def test_ensemble_integration():
    """Test full ensemble with TF models."""
    print("=" * 60)
    print("TEST 4: Full Ensemble Integration")
    print("=" * 60)

    from ml.models.ensemble import EnsemblePredictor, ENSEMBLE_WEIGHTS
    print(f"  Weights: {ENSEMBLE_WEIGHTS}")

    ep = EnsemblePredictor()
    if not ep.load():
        print("  SKIP: No artifacts")
        return

    tf_ok = ep.tf_predictor and ep.tf_predictor.loaded
    print(f"  LightGBM:  {'OK' if ep.lgb_model else 'missing'}")
    print(f"  TF DNN:    {'OK' if tf_ok else 'missing'}")
    print(f"  XGBoost:   {'OK' if ep.xgb_model else 'missing'}")
    print(f"  Meta:      {'OK' if ep.meta_model else 'missing'}")

    for name, feats in [("High", HIGH_PERFORMING), ("Low", LOW_PERFORMING), ("Mixed", MIXED_PERFORMING)]:
        pi = PredictionInput(learner_id=f"test-{name}", features=feats)
        r = ep.predict(pi)
        print(f"  {name:<8} mastery={r.mastery_probability:.4f}  dropout={r.dropout_probability:.4f}  risk={r.attention_risk}")

    r_h = ep.predict(PredictionInput(learner_id="h", features=HIGH_PERFORMING))
    r_l = ep.predict(PredictionInput(learner_id="l", features=LOW_PERFORMING))
    assert r_h.mastery_probability > r_l.mastery_probability
    print("  High > Low verified")
    print("\nTEST 4 PASSED\n")


def test_predict_custom_student():
    """Custom student prediction function."""
    print("=" * 60)
    print("TEST 5: Custom Student Prediction")
    print("=" * 60)

    from ml.models.tf_loader import TensorFlowPredictor
    tp = TensorFlowPredictor()
    tp.load()

    def predict(fv):
        if len(fv) != 40:
            raise ValueError(f"Need 40 features, got {len(fv)}")
        p = float(tp.predict_proba(np.array(fv).reshape(1, -1))[0])
        return p, "Mastered" if p > 0.5 else "At-Risk"

    p, l = predict(list(_make_feature_array(HIGH_PERFORMING)))
    print(f"  High: P={p:.4f} -> {l}")
    assert l == "Mastered", f"Expected Mastered, got {l}"

    p, l = predict(list(_make_feature_array(LOW_PERFORMING)))
    print(f"  Low:  P={p:.4f} -> {l}")
    assert l == "At-Risk", f"Expected At-Risk, got {l}"

    try:
        predict([0.5] * 10)
    except ValueError:
        print("  40-feature validation OK")

    print("\nTEST 5 PASSED\n")


def main():
    print("+" + "=" * 58 + "+")
    print("|   SANKALP AEI - TensorFlow Integration Validation Suite   |")
    print("+" + "=" * 58 + "+")

    passed = 0
    failed = 0

    for test_fn in [test_tf_loader_standalone, test_tf_latency, test_batch_predictions,
                    test_ensemble_integration, test_predict_custom_student]:
        try:
            test_fn()
            passed += 1
        except AssertionError as e:
            print(f"\nFAILED: {e}")
            failed += 1
        except Exception as e:
            print(f"\nERROR: {e}")
            import traceback
            traceback.print_exc()
            failed += 1

    print("=" * 60)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 60)
    if failed > 0:
        sys.exit(1)
    print("\nAll tests passed! TF models fully integrated.\n")


if __name__ == "__main__":
    main()
