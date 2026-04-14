# Python & ML Rules

1. **Prediction Validation:** Use `pydantic` models for strong data validation on ML boundaries (e.g. FastAPI ingest).
2. **Uncertainty Quantification:** All predictions from models (LightGBM, XGBoost, etc.) MUST propagate confidence bounds.
3. **Structure:** Follow `ml/` folder paths defined in the overall skeleton.
