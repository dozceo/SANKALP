import pickle
from pathlib import Path
from onnxmltools.convert import convert_lightgbm, convert_xgboost
from onnxmltools.convert.common.data_types import FloatTensorType

# -------------------------
# Paths
# -------------------------
BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS = BASE_DIR / "artifacts"

# -------------------------
# LightGBM Conversion
# -------------------------
def convert_lightgbm_model():
    lgb_path = ARTIFACTS / "lightgbm_model.pkl"

    if not lgb_path.exists():
        print("⚠️ LightGBM model not found, skipping...")
        return

    with open(lgb_path, "rb") as f:
        lgb_model = pickle.load(f)

    print("✅ Loaded LightGBM model")

    n_features = lgb_model.n_features_in_

    initial_type = [
        ("input", FloatTensorType([None, n_features]))
    ]

    onnx_model = convert_lightgbm(
        lgb_model,
        initial_types=initial_type
    )

    output_path = ARTIFACTS / "lightgbm.onnx"

    with open(output_path, "wb") as f:
        f.write(onnx_model.SerializeToString())

    print(f"✅ LightGBM ONNX saved at: {output_path}")


# -------------------------
# XGBoost Conversion (FIXED)
# -------------------------
def convert_xgboost_model():
    xgb_path = ARTIFACTS / "xgboost_model.pkl"

    if not xgb_path.exists():
        print("⚠️ XGBoost model not found, skipping...")
        return

    with open(xgb_path, "rb") as f:
        xgb_model = pickle.load(f)

    print("✅ Loaded XGBoost model")

    # 🔥 FIX: remove feature names (IMPORTANT)
    if hasattr(xgb_model, "get_booster"):
        booster = xgb_model.get_booster()
        booster.feature_names = None
        xgb_model._Booster = booster

    n_features = xgb_model.n_features_in_

    initial_type = [
        ("input", FloatTensorType([None, n_features]))
    ]

    onnx_model = convert_xgboost(
        xgb_model,
        initial_types=initial_type
    )

    output_path = ARTIFACTS / "xgboost.onnx"

    with open(output_path, "wb") as f:
        f.write(onnx_model.SerializeToString())

    print(f"✅ XGBoost ONNX saved at: {output_path}")


# -------------------------
# Run both
# -------------------------
if __name__ == "__main__":
    convert_lightgbm_model()
    convert_xgboost_model()