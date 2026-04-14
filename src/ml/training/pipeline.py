"""
SANKALP-AEI — ML Training Pipeline Orchestrator

This module streamlines the end-to-end training process for the predictive intelligence block.
It sequentially (or parallelly) trains base models (DNN, XGBoost, LightGBM) and feeds
their out-of-fold predictions into the Bayesian Meta-Learner.

Enforces:
- Pydantic validation for all configurations and artifacts.
- Structured JSON logging for observability.
- Strict artifact validation before proceeding to the next pipeline stage.
"""

import os
import json
import time
import logging
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

# ---------------------------------------------------------------------------
# Structured Logging Setup
# ---------------------------------------------------------------------------
class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_record = {
            "level": record.levelname,
            "message": record.getMessage(),
            "name": record.name,
            "timestamp": self.formatTime(record, self.datefmt)
        }
        if hasattr(record, 'extra_data'):
            log_record["telemetry"] = record.extra_data # type: ignore
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_record)

logger = logging.getLogger("sankalp_ml_pipeline")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
if not logger.handlers:
    logger.addHandler(handler)

# ---------------------------------------------------------------------------
# Pydantic Validation Models
# ---------------------------------------------------------------------------
class ModelArtifact(BaseModel):
    name: str
    path: str
    expected_extension: str

    def validate_artifact(self) -> bool:
        artifact_path = Path(self.path)
        if not artifact_path.exists():
            logger.error(f"Artifact missing: {self.path}", extra={"extra_data": {"artifact": self.name}})
            return False
        if artifact_path.suffix != self.expected_extension:
            logger.error(
                f"Invalid extension for {self.name}. Expected {self.expected_extension}, got {artifact_path.suffix}",
                extra={"extra_data": {"artifact": self.name}}
            )
            return False
        return True

class PipelineConfig(BaseModel):
    data_dir: str = Field(..., description="Directory containing training data")
    output_dir: str = Field(..., description="Directory to save trained artifacts")
    base_models: List[str] = Field(default=["dnn", "xgboost", "lightgbm"])
    meta_learner_name: str = Field(default="meta_learner.joblib")
    
    @field_validator('data_dir', 'output_dir')
    def check_directories(cls, v: str) -> str:
        path = Path(v)
        path.mkdir(parents=True, exist_ok=True)
        return str(path)

# ---------------------------------------------------------------------------
# Pipeline Orchestrator
# ---------------------------------------------------------------------------
class TrainingPipeline:
    def __init__(self, config: PipelineConfig):
        self.config = config
        self.artifacts: List[ModelArtifact] = []

    def _simulate_base_model_training(self, model_name: str) -> ModelArtifact:
        """
        Simulates the training of a base model. In production, this would subprocess
        or import the respective training modules for LightGBM, XGBoost, and PyTorch DNN.
        """
        start_time = time.time()
        logger.info(f"Starting training for base model: {model_name}")
        
        # Determine extension based on model type
        ext = ".pt" if model_name == "dnn" else ".json" if model_name == "lightgbm" else ".xgb"
        output_path = Path(self.config.output_dir) / f"{model_name}_model{ext}"
        
        # Simulate training delay and artifact creation
        time.sleep(1.5)
        output_path.touch()
        
        duration = time.time() - start_time
        logger.info(f"Completed training for {model_name}", extra={
            "extra_data": {"model": model_name, "duration_sec": round(duration, 2)}
        })
        
        return ModelArtifact(name=model_name, path=str(output_path), expected_extension=ext)

    def train_base_models(self) -> bool:
        """Trains all configured base models sequentially."""
        for model_name in self.config.base_models:
            try:
                artifact = self._simulate_base_model_training(model_name)
                if not artifact.validate_artifact():
                    raise ValueError(f"Artifact validation failed for {model_name}")
                self.artifacts.append(artifact)
            except Exception as e:
                logger.error(f"Base model training failed: {model_name}", exc_info=True)
                return False
        return True

    def train_meta_learner(self) -> bool:
        """
        Invokes the meta-learner training script, passing the validated base model artifacts.
        """
        start_time = time.time()
        logger.info("Starting Meta-Learner training phase")
        
        try:
            # Import dynamically to ensure base models are ready before meta-learner loads data
            from .train_meta_learner import train_and_evaluate, MetaLearnerConfig
            
            meta_config = MetaLearnerConfig(
                output_path=str(Path(self.config.output_dir) / self.config.meta_learner_name),
                base_model_paths=[a.path for a in self.artifacts]
            )
            
            # Execute meta-learner training
            result_artifact_path = train_and_evaluate(meta_config)
            
            meta_artifact = ModelArtifact(
                name="meta_learner", 
                path=result_artifact_path, 
                expected_extension=".joblib"
            )
            
            if not meta_artifact.validate_artifact():
                raise ValueError("Meta-learner artifact validation failed")
                
            self.artifacts.append(meta_artifact)
            
            duration = time.time() - start_time
            logger.info("Completed Meta-Learner training", extra={
                "extra_data": {"duration_sec": round(duration, 2), "artifact": result_artifact_path}
            })
            return True
            
        except Exception as e:
            logger.error("Meta-learner training failed", exc_info=True)
            return False

    def run(self) -> None:
        """Executes the canonical ML training pipeline."""
        logger.info("Initializing SANKALP-AEI ML Pipeline")
        pipeline_start = time.time()
        
        if not self.train_base_models():
            logger.critical("Pipeline aborted during base model training.")
            return
            
        if not self.train_meta_learner():
            logger.critical("Pipeline aborted during meta-learner training.")
            return
            
        total_duration = time.time() - pipeline_start
        logger.info("Pipeline execution completed successfully", extra={
            "extra_data": {
                "total_duration_sec": round(total_duration, 2),
                "artifacts_generated": len(self.artifacts)
            }
        })

if __name__ == "__main__":
    # Example execution
    config = PipelineConfig(
        data_dir="./data/processed",
        output_dir="./artifacts/models"
    )
    pipeline = TrainingPipeline(config)
    pipeline.run()