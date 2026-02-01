"""
Synthetic Training Data Generator for Topic Mastery Model

Generates realistic student behavior patterns for training the mastery prediction model.
This allows us to train and demonstrate the ML system before real user data is available.
"""

import pandas as pd
import numpy as np

# Set random seed for reproducibility
np.random.seed(42)

def generate_training_data(n_samples=1000):
    """
    Generate synthetic student learning data
    
    Features:
    - avg_quiz_score: 0.0 to 1.0
    - attempts_per_topic: 1 to 10
    - days_since_last_revision: 0 to 30
    - quiz_score_variance: 0.0 to 0.3
    - time_spent_per_question: 10 to 120 seconds
    
    Target:
    - mastered: 0 (not mastered) or 1 (mastered)
    """
    
    # Generate mastery status for all samples
    # p=[0.4, 0.6] means 40% not mastered, 60% mastered
    mastered = np.random.choice([0, 1], size=n_samples, p=[0.4, 0.6])
    
    # Initialize feature arrays
    avg_quiz_score = np.zeros(n_samples)
    attempts_per_topic = np.zeros(n_samples, dtype=int)
    days_since_last_revision = np.zeros(n_samples, dtype=int)
    quiz_score_variance = np.zeros(n_samples)
    time_spent_per_question = np.zeros(n_samples)

    # Boolean masks for vectorized operations
    is_mastered = (mastered == 1)
    not_mastered = (mastered == 0)

    n_mastered = np.sum(is_mastered)
    n_not_mastered = np.sum(not_mastered)

    # Mastered students have higher scores, more practice, better consistency
    if n_mastered > 0:
        avg_quiz_score[is_mastered] = np.random.beta(8, 2, size=n_mastered)
        attempts_per_topic[is_mastered] = np.random.randint(3, 10, size=n_mastered)
        days_since_last_revision[is_mastered] = np.random.randint(0, 7, size=n_mastered)
        quiz_score_variance[is_mastered] = np.random.uniform(0.0, 0.15, size=n_mastered)
        time_spent_per_question[is_mastered] = np.random.uniform(20, 60, size=n_mastered)
        
    # Non-mastered students have lower scores, inconsistency
    if n_not_mastered > 0:
        avg_quiz_score[not_mastered] = np.random.beta(2, 5, size=n_not_mastered)
        attempts_per_topic[not_mastered] = np.random.randint(1, 6, size=n_not_mastered)
        days_since_last_revision[not_mastered] = np.random.randint(5, 30, size=n_not_mastered)
        quiz_score_variance[not_mastered] = np.random.uniform(0.1, 0.3, size=n_not_mastered)
        time_spent_per_question[not_mastered] = np.random.uniform(10, 120, size=n_not_mastered)

    data = {
        'avg_quiz_score': np.round(avg_quiz_score, 2),
        'attempts_per_topic': attempts_per_topic,
        'days_since_last_revision': days_since_last_revision,
        'quiz_score_variance': np.round(quiz_score_variance, 2),
        'time_spent_per_question': np.round(time_spent_per_question, 1),
        'mastered': mastered
    }
    
    return pd.DataFrame(data)

if __name__ == "__main__":
    # Generate data
    print("Generating synthetic training data...")
    df = generate_training_data(n_samples=1000)
    
    # Save to CSV
    output_path = "training_data.csv"
    df.to_csv(output_path, index=False)
    
    # Print statistics
    print(f"\n✅ Generated {len(df)} samples")
    print(f"📁 Saved to: {output_path}")
    print(f"\n📊 Data Statistics:")
    print(f"   Mastered: {df['mastered'].sum()} ({df['mastered'].mean()*100:.1f}%)")
    print(f"   Not Mastered: {(1-df['mastered']).sum()} ({(1-df['mastered']).mean()*100:.1f}%)")
    print(f"\n📈 Feature Ranges:")
    print(df.describe())
