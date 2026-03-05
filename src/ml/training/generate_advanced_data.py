import numpy as np
import pandas as pd


def generate_advanced_data(n_students=1000):

    # Hidden ability (makes data realistic)
    ability = np.random.normal(0, 1, n_students)

    data = {
        # Mastery
        "avg_quiz_score": 60 + ability * 15,
        "topic_mastery_score": 0.5 + ability * 0.1,

        # Attempts / Behavior
        "attempts_per_topic": 4 - ability,
        "hints_used": np.random.randint(0, 5, n_students),

        # Spacing
        "days_since_last_revision": np.random.randint(0, 30, n_students),
        "study_sessions_per_week": np.random.randint(1, 7, n_students),

        # Engagement
        "login_frequency": np.random.randint(1, 30, n_students),
        "streak_days": np.random.randint(0, 15, n_students),

        # Cognitive
        "retention_score": 0.6 + ability * 0.1,
        "fatigue_index": np.random.uniform(0, 1, n_students),
    }

    df = pd.DataFrame(data)

    return df


if __name__ == "__main__":
    df = generate_advanced_data(1000)
    df.to_csv("advanced_training_data.csv", index=False)
    print("Advanced data generated successfully.")