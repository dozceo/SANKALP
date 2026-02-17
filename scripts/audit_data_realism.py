import sys
import os
import pandas as pd
import numpy as np

# Add src/ml/training to path to import the module
current_dir = os.path.dirname(os.path.abspath(__file__))
module_path = os.path.join(current_dir, '../src/ml/training')
sys.path.append(module_path)

try:
    from generate_data import generate_training_data
except ImportError:
    print("Could not import generate_training_data. Defining mock function based on code analysis.")
    # Fallback if import fails (e.g. missing dependencies in env or path issues)
    def generate_training_data(n_samples=1000):
        # ... logic copied from read file ...
        np.random.seed(42)
        data = []
        for _ in range(n_samples):
            mastered = np.random.choice([0, 1], p=[0.4, 0.6])
            if mastered == 1:
                avg_quiz_score = np.random.beta(8, 2)
                attempts_per_topic = np.random.randint(3, 10)
                days_since_last_revision = np.random.randint(0, 7)
                quiz_score_variance = np.random.uniform(0.0, 0.15)
                time_spent_per_question = np.random.uniform(20, 60)
            else:
                avg_quiz_score = np.random.beta(2, 5)
                attempts_per_topic = np.random.randint(1, 6)
                days_since_last_revision = np.random.randint(5, 30)
                quiz_score_variance = np.random.uniform(0.1, 0.3)
                time_spent_per_question = np.random.uniform(10, 120)

            data.append({
                'avg_quiz_score': round(avg_quiz_score, 2),
                'attempts_per_topic': attempts_per_topic,
                'days_since_last_revision': days_since_last_revision,
                'quiz_score_variance': round(quiz_score_variance, 2),
                'time_spent_per_question': round(time_spent_per_question, 1),
                'mastered': mastered
            })
        return pd.DataFrame(data)

def analyze_data():
    print("Generating 1000 samples...")
    df = generate_training_data(1000)

    print("\n--- Data Realism Audit ---")
    print(f"Total Samples: {len(df)}")

    # Class Balance
    mastery_rate = df['mastered'].mean()
    print(f"Mastery Rate: {mastery_rate:.2%} (Expected ~60%)")

    # Feature Stats by Class
    print("\n--- Feature Statistics by Class ---")
    print(df.groupby('mastered').mean().round(2))

    print("\n--- Outlier Detection ---")
    # Check for unrealistic combinations
    # e.g., High score but very high variance?
    # or Low score but very low time spent (guessing)?

    guessers = df[(df['avg_quiz_score'] < 0.3) & (df['time_spent_per_question'] < 15)]
    print(f"Potential Guessers (Score < 0.3, Time < 15s): {len(guessers)} ({len(guessers)/len(df):.1%})")

    crammers = df[(df['days_since_last_revision'] < 2) & (df['attempts_per_topic'] > 8)]
    print(f"Potential Crammers (Days < 2, Attempts > 8): {len(crammers)} ({len(crammers)/len(df):.1%})")

    # Overlap Analysis
    print("\n--- Distribution Overlap ---")
    # Check if distributions are too separated (easy classification)
    m_scores = df[df['mastered']==1]['avg_quiz_score']
    nm_scores = df[df['mastered']==0]['avg_quiz_score']

    # Simple overlap approximation
    overlap_min = max(m_scores.min(), nm_scores.min())
    overlap_max = min(m_scores.max(), nm_scores.max())

    print(f"Score Overlap Range: [{overlap_min}, {overlap_max}]")
    in_overlap = df[(df['avg_quiz_score'] >= overlap_min) & (df['avg_quiz_score'] <= overlap_max)]
    print(f"Samples in Overlap Region: {len(in_overlap)} ({len(in_overlap)/len(df):.1%})")

    if len(in_overlap) < 100:
        print("⚠️ WARNING: Low overlap indicates synthetic data might be too easily separable.")

if __name__ == "__main__":
    analyze_data()
