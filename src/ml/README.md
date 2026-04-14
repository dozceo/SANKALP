# SANKALP-AEI Machine Learning Pipeline

The `ml/` directory houses the Predictive Intelligence Block of the SANKALP Adaptive Educational Intelligence (AEI) system. This module is responsible for transforming raw, engineered features into probabilistic estimates of learner state, specifically focusing on topic mastery, retention decay (forgetting curves), and attention risk.

In accordance with the **Brain Map™ Architectural Laws**, this pipeline strictly adheres to Bayesian uncertainty quantification. **Point estimates are strictly forbidden.** Every prediction is modeled as a probability distribution, and confidence interval (CI) widths are propagated downstream to inform deterministic pedagogical decisions.

## Architecture: The Hybrid Ensemble

The predictive engine utilizes a hybrid ensemble architecture, combining the sequential pattern recognition of Deep Learning (TensorFlow) with the tabular efficiency of Gradient Boosted Trees (LightGBM/XGBoost).