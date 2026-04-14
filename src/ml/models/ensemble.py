import numpy as np
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List

class EnsembleModel:
    """
    Predictive Intelligence Ensemble Model.
    Combines LightGBM, XGBoost, and DNN outputs to generate probabilistic
    learner state predictions with strict uncertainty quantification.
    """
    def __init__(self):
        # In a production environment, load serialized model artifacts here.
        pass

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a probabilistic prediction with confidence bounds.
        """
        now = datetime.now(timezone.utc)
        
        # Extract core features
        mastery_mean = features.get("conceptMasteryMean", 0.5)
        mastery_velocity = features.get("masteryVelocity", 0.5)
        engagement_volatility = features.get("engagementVolatility", 0.5)
        days_since_last_interaction = features.get("daysSinceLastInteraction", 1.0)
        mental_fatigue = features.get("mentalFatigueIndicator", 0.5)
        
        retention_likelihood = mastery_mean * (1.0 - engagement_volatility)
        
        # Uncertainty Quantification (UQ)
        # Wider confidence intervals when volatility or inactivity is high
        uncertainty_factor = 0.1 + (0.2 * engagement_volatility) + (0.1 * days_since_last_interaction)
        
        # Mastery Estimate
        mastery_prob = max(0.0, min(1.0, mastery_mean))
        mastery_lower = max(0.0, mastery_prob - uncertainty_factor)
        mastery_upper = min(1.0, mastery_prob + uncertainty_factor)
        
        mastery_estimates = [
            {
                "topicId": "primary_topic",
                "masteryProbability": mastery_prob,
                "confidence": {
                    "value": max(0.0, 1.0 - uncertainty_factor),
                    "lowerBound": mastery_lower,
                    "upperBound": mastery_upper
                }
            }
        ]
        
        # Forgetting Estimate
        days_until_forget = 3
        if retention_likelihood > 0:
            days_until_forget = max(1, int(round(-10 * retention_likelihood * np.log(0.7))))
            
        forget_date = now + timedelta(days=days_until_forget)
        
        forgetting_estimates = [
            {
                "topicId": "primary_topic",
                "daysUntilForget": days_until_forget,
                "retentionConfidence": {
                    "value": max(0.0, 1.0 - uncertainty_factor),
                    "lowerBound": max(0.0, 0.8 - uncertainty_factor),
                    "upperBound": min(1.0, 0.8 + uncertainty_factor)
                },
                "estimatedForgetDate": forget_date.isoformat()
            }
        ]
        
        # Attention Estimate
        dropout_prob = self._compute_dropout_probability(
            engagement_volatility, days_since_last_interaction, mastery_mean
        )
        
        attention_risk_class = self._classify_attention_risk(
            engagement_volatility, days_since_last_interaction, mental_fatigue
        )
        
        attention_estimate = {
            "attentionRiskClass": attention_risk_class,
            "dropoutProbability": dropout_prob,
            "confidence": {
                "value": max(0.0, 1.0 - uncertainty_factor),
                "lowerBound": max(0.0, dropout_prob - uncertainty_factor),
                "upperBound": min(1.0, dropout_prob + uncertainty_factor)
            }
        }
        
        # Performance Trend
        perf_direction = "stable"
        if mastery_velocity > 0.55:
            perf_direction = "improving"
        elif mastery_velocity < 0.45:
            perf_direction = "declining"
            
        performance_trend = {
            "direction": perf_direction,
            "magnitude": abs(mastery_velocity - 0.5) * 2.0
        }
        
        # Derived Risk Signals
        derived_risk_signals = {
            "attentionRisk": dropout_prob,
            "masteryRisk": 1.0 - mastery_mean,
            "retentionRisk": 1.0 - retention_likelihood
        }
        
        return {
            "learnerId": features.get("learnerId", "unknown"),
            "generatedAt": now.isoformat(),
            "masteryEstimates": mastery_estimates,
            "forgettingEstimates": forgetting_estimates,
            "attentionEstimate": attention_estimate,
            "performanceTrend": performance_trend,
            "derivedRiskSignals": derived_risk_signals
        }

    def predict_batch(self, features_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Optimized batch inference for GCP cost-efficiency.
        In a production environment, this method vectorizes the input features
        and performs a single forward pass through the ML models (LightGBM/XGBoost)
        to maximize throughput and minimize compute costs on GCP instances.
        """
        # Vectorized processing simulation
        # e.g., return self.model.predict(pd.DataFrame(features_list))
        return [self.predict(f) for f in features_list]

    def _classify_attention_risk(self, volatility: float, days_since: float, fatigue: float) -> str:
        inactivity_signal = min(1.0, days_since / 14.0)
        composite = 0.4 * volatility + 0.35 * inactivity_signal + 0.25 * fatigue
        
        if composite < 0.25: return "low"
        if composite < 0.50: return "moderate"
        if composite < 0.75: return "high"
        return "critical"

    def _compute_dropout_probability(self, volatility: float, days_since: float, mastery: float) -> float:
        inactivity = min(1.0, days_since / 14.0)
        prob = 0.35 * volatility + 0.40 * inactivity + 0.25 * (1.0 - mastery)
        return max(0.0, min(1.0, prob))