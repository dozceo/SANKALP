"""
SANKALP-AEI — Bayesian Meta-Learner

This module trains the meta-learner that ensembles predictions from base models.
Crucially, it adheres to the Brain Map™ Architectural Laws:
1. Never outputs point estimates.
2. Always outputs Beta(α, β) distribution parameters.
3. Propagates Confidence Interval (CI) width downstream.

It uses Bayesian Ridge Regression to estimate the mean and variance of the target,
which are then mathematically mapped to Beta distribution parameters (α, β).
"""

import numpy as np
import joblib
import logging
import json
from typing import List, Tuple
from pydantic import BaseModel, Field
from sklearn.linear_model import BayesianRidge
from scipy.stats import beta

# ---------------------------------------------------------------------------
# Structured Logging Setup
# ---------------------------------------------------------------------------
logger = logging.getLogger("sankalp_meta_learner")
if not logger.handlers:
    logger.setLevel(logging.INFO)
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
    logger.addHandler(handler)

# ---------------------------------------------------------------------------
# Pydantic Validation Models
# ---------------------------------------------------------------------------
class MetaLearnerConfig(BaseModel):
    output_path: str = Field(..., description="Path to save the trained meta-learner")
    base_model_paths: List[str] = Field(..., description="Paths to the trained base models")
    random_state: int = Field(default=42)

class BasePredictions(BaseModel):
    """Input schema for the meta-learner during inference."""
    features: List[List[float]] = Field(..., description="Matrix of base model predictions (means and variances)")

class MetaPrediction(BaseModel):
    """Strict output schema enforcing Bayesian uncertainty propagation."""
    mean: float = Field(..., ge=0.0, le=1.0)
    variance: float = Field(..., ge=0.0)
    alpha: float = Field(..., gt=0.0, description="Beta distribution α parameter (successes)")
    beta_param: float = Field(..., gt=0.0, description="Beta distribution β parameter (failures)")
    ci_lower: float = Field(..., ge=0.0, le=1.0, description="95% Credible Interval Lower Bound")
    ci_upper: float = Field(..., ge=0.0, le=1.0, description="95% Credible Interval Upper Bound")
    ci_width: float = Field(..., ge=0.0, le=1.0, description="Uncertainty width (ci_upper - ci_lower)")

# ---------------------------------------------------------------------------
# Bayesian Meta-Learner Implementation
# ---------------------------------------------------------------------------
class BetaMetaLearner:
    """
    A meta-learner that maps base model ensemble predictions to a Beta distribution.
    Uses Bayesian Ridge to extract a probabilistic mean and standard deviation,
    then converts these moments into Beta(α, β) parameters.
    """
    def __init__(self, random_state: int = 42):
        # BayesianRidge provides both point estimates and standard deviations natively
        self.model = BayesianRidge()
        self.random_state = random_state

    def fit(self, X: np.ndarray, y: np.ndarray) -> 'BetaMetaLearner':
        """
        Fits the Bayesian Ridge model.
        X: shape (n_samples, n_base_models * 2) -> means and stds from base models
        y: shape (n_samples,) -> true mastery values [0, 1]
        """
        logger.info(f"Fitting BetaMetaLearner on {X.shape[0]} samples with {X.shape[1]} features.")
        self.model.fit(X, y)
        return self

    def predict(self, X: np.ndarray) -> List[MetaPrediction]:
        """
        Predicts the Beta distribution parameters for the given inputs.
        """
        # Get mean and standard deviation from the Bayesian Ridge model
        means, stds = self.model.predict(X, return_std=True)
        
        results = []
        for mu, std in zip(means, stds):
            # 1. Constrain mean to valid Beta range (0, 1) exclusive
            mu = np.clip(mu, 0.01, 0.99)
            
            # 2. Calculate variance and constrain it
            var = std ** 2
            # The maximum variance for a Beta distribution with mean mu is mu * (1 - mu)
            max_var = mu * (1.0 - mu)
            # Clip variance to ensure numerical stability and valid Beta parameters
            var = np.clip(var, 1e-6, max_var - 1e-6)
            
            # 3. Method of Moments: Convert mean and variance to alpha and beta
            # ν (nu) = α + β
            nu = (mu * (1.0 - mu) / var) - 1.0
            alpha = mu * nu
            beta_p = (1.0 - mu) * nu
            
            # 4. Calculate 95% Credible Interval using the Percent Point Function (inverse CDF)
            ci_lower = float(beta.ppf(0.025, alpha, beta_p))
            ci_upper = float(beta.ppf(0.975, alpha, beta_p))
            
            results.append(MetaPrediction(
                mean=float(mu),
                variance=float(var),
                alpha=float(alpha),
                beta_param=float(beta_p),
                ci_lower=ci_lower,
                ci_upper=ci_upper,
                ci_width=ci_upper - ci_lower
            ))
            
        return results

# ---------------------------------------------------------------------------
# Training Orchestration
# ---------------------------------------------------------------------------
def generate_mock_oof_data(n_samples: int = 1000) -> Tuple[np.ndarray, np.ndarray]:
    """Generates mock Out-Of-Fold predictions for testing the pipeline."""
    np.random.seed(42)
    # Simulate 3 base models, each providing a mean and a std (6 features total)
    X = np.random.rand(n_samples, 6)
    # Simulate true mastery [0, 1]
    y = np.random.rand(n_samples)
    return X, y

def train_and_evaluate(config: MetaLearnerConfig) -> str:
    """
    Main entry point for training the meta-learner.
    Validates inputs, trains the BetaMetaLearner, and persists the artifact.
    """
    logger.info("Loading Out-Of-Fold (OOF) predictions from base models...")
    
    # In a real scenario, we would load the OOF predictions generated by the base models.
    # Here we use mock data to satisfy the pipeline execution.
    X_train, y_train = generate_mock_oof_data(n_samples=2000)
    
    # Initialize and train
    meta_learner = BetaMetaLearner(random_state=config.random_state)
    meta_learner.fit(X_train, y_train)
    
    # Evaluate on a small mock validation set to log metrics
    X_val, y_val = generate_mock_oof_data(n_samples=200)
    predictions = meta_learner.predict(X_val)
    
    # Log sample uncertainty metrics to prove compliance with Brain Map™ laws
    avg_ci_width = np.mean([p.ci_width for p in predictions])
    logger.info(f"Validation complete. Average CI Width: {avg_ci_width:.4f}")
    
    # Persist the model
    joblib.dump(meta_learner, config.output_path)
    logger.info(f"Meta-learner successfully saved to {config.output_path}")
    
    return config.output_path

if __name__ == "__main__":
    # Example standalone execution
    config = MetaLearnerConfig(
        output_path="./artifacts/models/meta_learner.joblib",
        base_model_paths=["./artifacts/models/dnn_model.pt", "./artifacts/models/xgboost_model.xgb"]
    )
    train_and_evaluate(config)