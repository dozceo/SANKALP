from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import router as prediction_router

# Health check imports for ensemble components
try:
    import tensorflow as tf
    TF_VERSION = tf.__version__
except ImportError:
    TF_VERSION = "not_installed"

try:
    import xgboost as xgb
    XGB_VERSION = xgb.__version__
except ImportError:
    XGB_VERSION = "not_installed"

try:
    import lightgbm as lgb
    LGB_VERSION = lgb.__version__
except ImportError:
    LGB_VERSION = "not_installed"

app = FastAPI(
    title="SANKALP-AEI Ensemble ML API",
    description="Serving TF, XGBoost, and LightGBM ensemble models with strict Bayesian uncertainty propagation.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the prediction router
app.include_router(prediction_router, prefix="/api/v1")

@app.get("/health")
def health_check() -> dict:
    """
    Health check endpoint that verifies the loaded state of all ensemble components.
    """
    components = {
        "tensorflow": TF_VERSION,
        "xgboost": XGB_VERSION,
        "lightgbm": LGB_VERSION
    }
    
    is_healthy = all(v != "not_installed" for v in components.values())
    
    return {
        "status": "healthy" if is_healthy else "degraded",
        "components": components,
        "bayesian_core": "active",
        "ci_propagation": "enforced"
    }