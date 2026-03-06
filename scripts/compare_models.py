import pandas as pd
import lightgbm as lgb
import xgboost as xgb
import time

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score


def compare_models():
    df = pd.read_csv("src/ml/training/training_data.csv")

    X = df.drop("mastered", axis=1)
    y = df["mastered"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    models = {
        "LogisticRegression": LogisticRegression(max_iter=1000),
        "LightGBM": lgb.LGBMClassifier(),
        "XGBoost": xgb.XGBClassifier(eval_metric="logloss"),
        "RandomForest": RandomForestClassifier(n_estimators=100)
    }

    results = []

    for name, model in models.items():
        print(f"\nTraining {name}...")

        model.fit(X_train, y_train)

        preds = model.predict(X_test)
        probs = model.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, preds)
        f1 = f1_score(y_test, preds)
        auc = roc_auc_score(y_test, probs)

        results.append([name, acc, f1, auc])

    results_df = pd.DataFrame(
        results,
        columns=["Model", "Accuracy", "F1 Score", "AUC"]
    )

    print("\nModel Comparison\n")
    print(results_df)


if __name__ == "__main__":
    start = time.time()

    compare_models()

    end = time.time()
    print("\nExecution Time:", end - start, "seconds")