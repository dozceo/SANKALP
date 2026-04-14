"""
SANKALP AEI - TensorFlow Model Loader

Loads trained Keras .h5 models for mastery prediction.
Supports loading multiple model variants and averaging their predictions.

Input:  40-feature vector
Output: Single sigmoid probability - P(mastered)
"""

from __future__ import annotations

import os
import logging
from pathlib import Path
from typing import Any, List, Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)

_REPO_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_MODEL_DIR = str(_REPO_ROOT / "ml" / "models")

TF_MODEL_FILES = [
    "sankalp_tensorflow_model.h5",
    "sankalp_tf_model.h5",
]


class TensorFlowPredictor:
    """
    Loads one or more Keras .h5 mastery prediction models.
    When multiple models are loaded, predictions are averaged.
    """

    def __init__(self, model_dir: str = _DEFAULT_MODEL_DIR) -> None:
        self.model_dir = model_dir
        self.models: list = []
        self.model_names: List[str] = []
        self.loaded: bool = False

    def load(self) -> bool:
        try:
            os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
            import tensorflow as tf
        except ImportError:
            print("[TFLoader] TensorFlow not installed - TF models will be skipped.")
            return False

        loaded_count = 0
        for fname in TF_MODEL_FILES:
            path = os.path.join(self.model_dir, fname)
            if not os.path.exists(path):
                continue
            try:
                model = tf.keras.models.load_model(path, compile=False)
                self.models.append(model)
                self.model_names.append(fname)
                loaded_count += 1
                print(f"[TFLoader] Loaded {fname}")
            except Exception as exc:
                print(f"[TFLoader] Failed to load {fname}: {exc}")

        self.loaded = loaded_count > 0
        if self.loaded:
            print(f"[TFLoader] {loaded_count} TensorFlow model(s) ready for inference.")
        return self.loaded

    def predict_proba(self, x: np.ndarray) -> np.ndarray:
        if not self.loaded or not self.models:
            raise RuntimeError("No TensorFlow models loaded. Call load() first.")
        predictions = []
        for model in self.models:
            raw = model.predict(x, verbose=0)
            predictions.append(raw.flatten())
        return np.mean(predictions, axis=0)

    def predict(self, x: np.ndarray) -> np.ndarray:
        return (self.predict_proba(x) > 0.5).astype(int)

    def predict_single(self, features: np.ndarray) -> Tuple[float, str]:
        x = features.reshape(1, -1)
        prob = float(self.predict_proba(x)[0])
        return prob, "Mastered" if prob > 0.5 else "At-Risk"

    def predict_with_uncertainty(self, x: np.ndarray, num_samples: int = 10) -> Tuple[np.ndarray, np.ndarray]:
        """Monte Carlo Dropout for epistemic uncertainty estimation."""
        if not self.loaded:
            raise RuntimeError("No TensorFlow models loaded.")
        all_preds = []
        for model in self.models:
            for _ in range(num_samples):
                pred = model(x, training=True)
                all_preds.append(pred.numpy().flatten())
        preds_stack = np.stack(all_preds)
        return np.mean(preds_stack, axis=0), np.var(preds_stack, axis=0)

    @property
    def model_count(self) -> int:
        return len(self.models)

    def summary(self) -> str:
        if not self.loaded:
            return "TensorFlowPredictor: No models loaded."
        lines = [f"TensorFlowPredictor: {self.model_count} model(s) loaded"]
        for name in self.model_names:
            lines.append(f"  - {name}")
        return "\n".join(lines)


# Legacy backward-compatible class
class TFLoader:
    """Legacy TF loader. Use TensorFlowPredictor for new code."""
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model: Any = None
        self._load_model()

    def _load_model(self) -> None:
        try:
            import tensorflow as tf
            os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
            self.model = tf.keras.models.load_model(self.model_path)
        except ImportError:
            self.model = None
        except Exception:
            self.model = None

    def is_available(self) -> bool:
        return self.model is not None

    def predict_with_uncertainty(self, features: np.ndarray, num_samples: int = 10) -> Optional[Tuple[np.ndarray, np.ndarray]]:
        if not self.is_available():
            return None
        try:
            predictions = [self.model(features, training=True).numpy() for _ in range(num_samples)]
            stacked = np.stack(predictions)
            return np.mean(stacked, axis=0), np.var(stacked, axis=0)
        except Exception:
            return None


_default_tf_predictor: Optional[TensorFlowPredictor] = None

def get_tf_predictor(model_dir: str = _DEFAULT_MODEL_DIR) -> TensorFlowPredictor:
    global _default_tf_predictor
    if _default_tf_predictor is None:
        _default_tf_predictor = TensorFlowPredictor(model_dir)
        _default_tf_predictor.load()
    return _default_tf_predictor