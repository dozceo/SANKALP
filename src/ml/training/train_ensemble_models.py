import os
import lightgbm as lgb
import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score


def train_mastery_ensemble(X_train, y_train, X_val, y_val):
    """
    Train an ensemble of models (LightGBM, XGBoost, RandomForest)
    and evaluate their performance.
    """

    models = {
        "LightGBM": lgb.LGBMClassifier(),
        "XGBoost": xgb.XGBClassifier(use_label_encoder=False, eval_metric="logloss"),
        "RandomForest": RandomForestClassifier(n_estimators=100)
    }

    results = {}

    for name, model in models.items():

        print(f"\nTraining {name}...")

        # Train model
        model.fit(X_train, y_train)

        # Predictions
        preds = model.predict(X_val)
        probs = model.predict_proba(X_val)[:, 1]

        # Metrics
        accuracy = accuracy_score(y_val, preds)
        f1 = f1_score(y_val, preds)
        auc = roc_auc_score(y_val, probs)

        print(f"{name} Performance:")
        print("Accuracy:", accuracy)
        print("F1 Score:", f1)
        print("AUC:", auc)

        results[name] = {
            "accuracy": accuracy,
            "f1_score": f1,
            "auc": auc
        }

    return results

if __name__ == "__main__":
    import pandas as pd
    from sklearn.model_selection import train_test_split

    # Load dataset
    df = pd.read_csv("src/ml/training/training_data.csv")

    # Features and label
    X = df.drop("mastered", axis=1)
    y = df["mastered"]

    # Train / validation split
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Call the function
    train_mastery_ensemble(X_train, y_train, X_val, y_val)