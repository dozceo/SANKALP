import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
import os

def generate_test_set():
    """Generates a fixed test set from training data"""

    # Load training data
    data_path = os.path.join(os.path.dirname(__file__), "training_data.csv")
    if not os.path.exists(data_path):
        print(f"❌ Error: {data_path} not found!")
        return

    print("📊 Loading training data...")
    df = pd.read_csv(data_path)

    # Separate features and target
    # We only need to split, but we want to keep all columns in the test set to mimic real data

    # Split into train and test sets with a fixed random state
    train_df, test_df = train_test_split(
        df, test_size=0.2, random_state=42, stratify=df['mastered']
    )

    print(f"   Total samples: {len(df)}")
    print(f"   Test samples: {len(test_df)}")

    # Save test set
    output_dir = os.path.join(os.path.dirname(__file__), "../models")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "test_set.csv")

    test_df.to_csv(output_path, index=False)
    print(f"\n💾 Test set saved to: {output_path}")

if __name__ == "__main__":
    generate_test_set()
