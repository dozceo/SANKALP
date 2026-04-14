from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from datetime import datetime, timezone

from ml.models.ensemble import EnsembleModel

app = FastAPI(title="SANKALP-AEI ML Serving API")

# Initialize the predictive ensemble model
ensemble_model = EnsembleModel()

# ─── Pydantic Models for Strict Boundary Validation ──────────────────────────

class Confidence(BaseModel):
    value: float = Field(..., ge=0.0, le=1.0)
    lowerBound: float = Field(..., ge=0.0, le=1.0)
    upperBound: float = Field(..., ge=0.0, le=1.0)

class MasteryEstimate(BaseModel):
    topicId: str
    masteryProbability: float = Field(..., ge=0.0, le=1.0)
    confidence: Confidence

class ForgettingEstimate(BaseModel):
    topicId: str
    daysUntilForget: int
    retentionConfidence: Confidence
    estimatedForgetDate: str

class AttentionEstimate(BaseModel):
    attentionRiskClass: str
    dropoutProbability: float = Field(..., ge=0.0, le=1.0)
    confidence: Confidence

class PerformanceTrendEstimate(BaseModel):
    direction: str
    magnitude: float

class PredictionResult(BaseModel):
    learnerId: str
    generatedAt: str
    masteryEstimates: List[MasteryEstimate]
    forgettingEstimates: List[ForgettingEstimate]
    attentionEstimate: AttentionEstimate
    performanceTrend: PerformanceTrendEstimate
    derivedRiskSignals: Dict[str, float]

class FeatureVector(BaseModel):
    learnerId: str
    generatedAt: str
    conceptMasteryMean: float
    conceptMasteryStdDev: float
    subjectMasteryDistribution: float
    masteryVelocity: float
    conceptStrengthVariance: float
    learningAsymptoteEstimate: float
    conceptsMasteredCount: int
    conceptsLearningCount: int
    conceptsStrugglingCount: int
    masteryPercentile: float
    daysSinceLastInteraction: float
    interactionFrequencyPerWeek: float
    sessionConsistencyScore: float
    learningPatternSignature: float
    optimalSpacingAdherence: float
    timeOfDayPreference: float
    sessionDurationTrend: float
    interSessionIntervalAvg: float
    chatFrequency: float
    quizAttemptPattern: float
    resourceExplorationDepth: float
    engagementVolatility: float
    errorPatternSignature: float
    learningStyleIndicator: float
    hintUsageRate: float
    revisionBehavior: float
    persistenceIndicator: float
    peerComparisonEngagement: float
    deviceConsistency: float
    socialStudyBehavior: float
    attentionSpanEstimation: float
    distractionFrequency: float
    mentalFatigueIndicator: float
    optimalLearningWindow: float
    processingSpeedEstimate: float
    contextSwitchingFrequency: float
    cognitiveLoadCapacity: float
    recoveryTimeAfterFailure: float
    questionComplexityPreference: float
    multiTaskingIndicator: float

class BatchFeaturePayload(BaseModel):
    features: List[FeatureVector]

# ─── API Endpoints ───────────────────────────────────────────────────────────

@app.post("/predict", response_model=PredictionResult)
async def predict(features: FeatureVector):
    """
    Single inference endpoint.
    Consumes a 40-dimension feature vector and returns probabilistic predictions.
    """
    try:
        # Support both Pydantic v1 and v2
        feature_dict = features.model_dump() if hasattr(features, 'model_dump') else features.dict()
        prediction = ensemble_model.predict(feature_dict)
        return PredictionResult(**prediction)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/batch", response_model=List[PredictionResult])
async def predict_batch(payload: BatchFeaturePayload):
    """
    Batch inference endpoint optimized for GCP cost-efficiency.
    Processes multiple feature vectors in a single vectorized pass.
    """
    try:
        features_list = [f.model_dump() if hasattr(f, 'model_dump') else f.dict() for f in payload.features]
        predictions = ensemble_model.predict_batch(features_list)
        return [PredictionResult(**p) for p in predictions]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}