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
    
    data = []
    
    for _ in range(n_samples):
        # Determine mastery status first (ground truth)
        mastered = np.random.choice([0, 1], p=[0.4, 0.6])
        
        if mastered == 1:
            # Mastered students have higher scores, more practice, better consistency
            avg_quiz_score = np.random.beta(8, 2)  # skewed toward high values
            attempts_per_topic = np.random.randint(3, 10)
            days_since_last_revision = np.random.randint(0, 7)
            quiz_score_variance = np.random.uniform(0.0, 0.15)
            time_spent_per_question = np.random.uniform(20, 60)
        else:
            # Non-mastered students have lower scores, inconsistency
            avg_quiz_score = np.random.beta(2, 5)  # skewed toward low values
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
