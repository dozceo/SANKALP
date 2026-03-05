import pandas as pd
import lightgbm as lgb
import xgboost as xgb
import time

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score


def train_mastery_ensemble():
    """
    Train LightGBM, XGBoost, and RandomForest models
    and print Accuracy, F1 Score, and AUC for each.
    """

    # ---------------------------
    # 1. Data Preparation
    # ---------------------------
    df = pd.read_csv("src/ml/training/training_data.csv")

    X = df.drop("mastered", axis=1)
    y = df["mastered"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    # ---------------------------
    # 2. Model Initialization
    # ---------------------------
    models = {
        "LightGBM": lgb.LGBMClassifier(),
        "XGBoost": xgb.XGBClassifier(eval_metric="logloss"),
        "RandomForest": RandomForestClassifier(n_estimators=100)
    }

    # ---------------------------
    # 3. Training + Evaluation
    # ---------------------------
    for name, model in models.items():

        print(f"\nTraining {name}...")

        model.fit(X_train, y_train)

        preds = model.predict(X_test)
        probs = model.predict_proba(X_test)[:, 1]

        accuracy = accuracy_score(y_test, preds)
        f1 = f1_score(y_test, preds)
        auc = roc_auc_score(y_test, probs)

        print(f"\n{name} Performance")
        print("----------------------")
        print("Accuracy :", accuracy)
        print("F1 Score :", f1)
        print("AUC (ROC):", auc)


if __name__ == "__main__":
    start = time.time()

    train_mastery_ensemble()

    end = time.time()
    print("\nExecution Time:", end - start, "seconds")