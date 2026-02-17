"""
Synthetic Training Data Generator for Topic Mastery Model

Generates realistic student behavior patterns for training the mastery prediction model.
This allows us to train and demonstrate the ML system before real user data is available.
"""

import pandas as pd
import numpy as np
import hashlib
import json
import subprocess
import os

# Set random seed for reproducibility
SEED = 42
np.random.seed(SEED)

def get_git_hash():
    """Get the current git commit hash"""
    try:
        return subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode('ascii').strip()
    except Exception as e:
        print(f"⚠️ Warning: Could not get git hash: {e}")
        return "unknown"

def get_file_hash(filepath):
    """Calculate SHA256 hash of a file"""
    if not os.path.exists(filepath):
        return None
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        # Read and update hash string value in blocks of 4K
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

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
        # Determine mastery status FIRST based on a latent "ability" variable
        # This creates a more realistic causal link
        ability = np.random.beta(5, 5) # Bell curve of student ability (0-1)
        
        # Features are derived from ability + noise

        # 1. Average Quiz Score (Strongly correlated with ability)
        # Add some random noise, clip to 0-1
        avg_quiz_score = np.clip(ability + np.random.normal(0, 0.1), 0, 1)

        # 2. Attempts per topic
        # Lower ability students might try more times (struggling) OR fewer times (giving up)
        # Let's model it as: Struggling students attempt more often up to a point
        if ability < 0.3:
            attempts_per_topic = np.random.randint(1, 5) # Giving up early
        elif ability < 0.7:
            attempts_per_topic = np.random.randint(4, 10) # Trying hard
        else:
            attempts_per_topic = np.random.randint(1, 4) # Mastered quickly

        # 3. Time spent
        # Lower ability -> potentially longer (struggling) or very short (guessing)
        time_spent_per_question = np.clip(60 - (ability * 30) + np.random.normal(0, 15), 10, 120)

        # 4. Variance
        # Inconsistent students have higher variance
        quiz_score_variance = np.clip((1 - ability) * 0.2 + np.random.normal(0, 0.05), 0, 0.5)

        # 5. Days since revision
        # Random factor, but maybe better students revise more often (lower days)?
        days_since_last_revision = np.random.randint(0, 30)

        # DETERMINISTIC LOGIC for "Ground Truth" to ensure model learns valid rules
        # This fixes the issue where random choice overrides strong signal

        # Base probability of mastery is the quiz score
        mastery_prob = avg_quiz_score

        # Penalize for high variance (inconsistency)
        mastery_prob -= quiz_score_variance * 0.5

        # Penalize for long time since revision
        if days_since_last_revision > 14:
            mastery_prob -= 0.2

        # Hard cutoff for very low scores (The Critical Fix)
        if avg_quiz_score < 0.5:
             mastery_prob = 0 # Impossible to be mastered if failing quizzes

        # Threshold for binary classification
        mastered = 1 if mastery_prob > 0.65 else 0
        
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
    n_samples = 2000
    df = generate_training_data(n_samples=n_samples) # Increased sample size
    
    # Save to CSV
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "training_data.csv")
    df.to_csv(output_path, index=False)
    
    # Print statistics
    print(f"\n✅ Generated {len(df)} samples")
    print(f"📁 Saved to: {output_path}")
    print(f"\n📊 Data Statistics:")
    print(f"   Mastered: {df['mastered'].sum()} ({df['mastered'].mean()*100:.1f}%)")
    print(f"   Not Mastered: {(1-df['mastered']).sum()} ({(1-df['mastered']).mean()*100:.1f}%)")
    print(f"\n📈 Feature Ranges:")
    print(df.describe())

    # Generate Metadata
    script_hash = get_file_hash(__file__)
    git_hash = get_git_hash()

    metadata = {
        "script_hash": script_hash,
        "git_hash": git_hash,
        "random_seed": SEED,
        "n_samples": n_samples,
        "columns": list(df.columns),
        "generated_at": pd.Timestamp.now().isoformat()
    }

    metadata_path = os.path.join(script_dir, "training_data_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"📄 Metadata saved to: {metadata_path}")
