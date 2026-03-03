

# 🔴 CORE INTELLIGENCE BLOCK UPGRADE STRATEGY

## **THE PROBLEM**
```
Current: Logistic Regression (5 features, synthetic data)
↓
Produces: Weak binary mastery predictions only
↓
Result: Your ADK layer gets garbage → LLM can't help
```

---

## **THE SOLUTION: Multi-Model Ensemble + Rich Feature Engineering + Dynamic LLM**

I'll give you **three tiers** of improvements, from immediate to advanced:

---

# **TIER 1: Immediate Upgrades (Week 1-2)**

### **1A. Replace Single Logistic Regression with Ensemble**

Instead of one weak model, use **LightGBM + XGBoost + Random Forest ensemble**:

```python name="src/ml/training/train_ensemble_models.py"
"""
Production-grade ML models using open-source libraries
Focuses on explainability + performance
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from lightgbm import LGBMClassifier
from xgboost import XGBClassifier
import joblib
from pathlib import Path

# ============================================
# MODEL 1: Mastery Prediction (Classification)
# ============================================

def train_mastery_ensemble():
    """
    Ensemble model for topic mastery prediction
    
    Combines:
    - LightGBM (fast, low memory, handles categorical)
    - XGBoost (gradient boosting, feature importance)
    - Random Forest (robust, interpretable)
    """
    
    # Load synthetic data (replace with real data later)
    from ml.training.generate_data import generate_training_data
    X_train, y_train, feature_names = generate_training_data(n_samples=5000)
    
    # Split into train/validation
    from sklearn.model_selection import train_test_split
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=0.2, random_state=42
    )
    
    # Normalize features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    
    # Train individual models
    print("🔧 Training ensemble models...")
    
    # Model 1: LightGBM
    lgb = LGBMClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=7,
        num_leaves=31,
        random_state=42,
        verbose=-1,
        is_unbalanced=True,  # Handle imbalanced data
    )
    lgb.fit(X_train, y_train, eval_set=[(X_val, y_val)], callbacks=[
        lgb.log_evaluation(period=0),
    ])
    
    # Model 2: XGBoost
    xgb = XGBClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=7,
        random_state=42,
        scale_pos_weight=sum(y_train == 0) / sum(y_train == 1),
        verbosity=0,
    )
    xgb.fit(X_train_scaled, y_train, eval_set=[(X_val_scaled, y_val)])
    
    # Model 3: Random Forest (interpretable)
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1,
    )
    rf.fit(X_train, y_train)
    
    # Evaluate individually
    from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
    
    print("\n📊 Individual Model Performance:")
    for name, model in [("LightGBM", lgb), ("XGBoost", xgb), ("RandomForest", rf)]:
        if name == "XGBoost":
            y_pred = model.predict(X_val_scaled)
        else:
            y_pred = model.predict(X_val)
        
        acc = accuracy_score(y_val, y_pred)
        f1 = f1_score(y_val, y_pred)
        auc = roc_auc_score(y_val, model.predict_proba(X_val_scaled if name == "XGBoost" else X_val)[:, 1])
        
        print(f"  {name}: Accuracy={acc:.3f}, F1={f1:.3f}, AUC={auc:.3f}")
    
    # Create ensemble (weighted voting)
    ensemble = {
        "lgb": (lgb, 0.4),      # Best for calibration
        "xgb": (xgb, 0.35),     # Best for feature importance
        "rf": (rf, 0.25),       # Best for robustness
        "scaler": scaler,
        "feature_names": feature_names,
    }
    
    # Save ensemble
    model_path = Path("src/ml/models/mastery_ensemble.pkl")
    joblib.dump(ensemble, model_path)
    print(f"✅ Ensemble saved to {model_path}")
    
    return ensemble


# ============================================
# MODEL 2: Forgetting Curve Prediction (Regression)
# ============================================

def train_forgetting_curve_model():
    """
    Predicts when student will forget (spaced repetition theory)
    
    Based on Ebbinghaus forgetting curve:
    R(t) = e^(-t/S)
    
    Where:
    - R(t) = retention at time t
    - S = strength of memory (depends on subject, repetition)
    - t = time since last review
    """
    
    # Generate synthetic forgetting data
    X_train, y_train = generate_forgetting_data(n_samples=5000)
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=0.2, random_state=42
    )
    
    # Use Gradient Boosting for regression
    gb = GradientBoostingClassifier(
        n_estimators=150,
        learning_rate=0.1,
        max_depth=6,
        random_state=42,
    )
    gb.fit(X_train, y_train)
    
    print(f"✅ Forgetting Curve Model trained")
    
    joblib.dump(gb, Path("src/ml/models/forgetting_curve.pkl"))
    return gb


# ============================================
# MODEL 3: Attention/Dropout Risk (Classification)
# ============================================

def train_attention_risk_model():
    """
    Predicts dropout/disengagement risk
    
    Features:
    - Session frequency (how often they login)
    - Session duration (how long they study)
    - Quiz completion rate (do they finish started quizzes)
    - Days inactive (recency)
    - Performance trend (improving vs declining)
    - Submission patterns (late at night = procrastination?)
    """
    
    X_train, y_train = generate_attention_data(n_samples=5000)
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=0.2, random_state=42
    )
    
    # Multi-class classification (LOW, MEDIUM, HIGH risk)
    xgb_attention = XGBClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=8,
        num_class=3,  # 3 risk levels
        random_state=42,
    )
    xgb_attention.fit(X_train, y_train, eval_set=[(X_val, y_val)])
    
    joblib.dump(xgb_attention, Path("src/ml/models/attention_risk.pkl"))
    return xgb_attention


if __name__ == "__main__":
    train_mastery_ensemble()
    train_forgetting_curve_model()
    train_attention_risk_model()
    print("🎉 All models trained and saved!")
```

### **1B. Enhanced Feature Engineering (40 features instead of 5)**

```typescript name="src/ml/features/advanced_student_features.ts"
/**
 * ADVANCED Feature Engineering
 * 
 * Extracts 40+ features from student interaction data
 * Based on learning science + cognitive psychology research
 */

export interface AdvancedStudentFeatures {
  // MASTERY SIGNALS (12 features)
  avg_quiz_score: number;
  recent_quiz_score: number;  // Last 3 quizzes
  score_improvement_rate: number;  // Linear trend
  score_variance: number;
  score_skewness: number;  // Asymmetry (struggling vs lucky)
  attempts_per_topic: number;
  time_on_task: number;  // Total minutes spent
  mistakes_per_attempt: number;
  correct_first_attempt_rate: number;
  partial_credit_pattern: number;  // Improvement within attempts
  topic_difficulty_adjusted_score: number;
  mastery_confidence: number;  // Student's self-reported confidence

  // SPACING & RETENTION (8 features)
  days_since_last_attempt: number;
  days_since_first_attempt: number;
  inter_attempt_days_avg: number;
  inter_attempt_days_variance: number;
  spaced_repetition_score: number;  // How well they follow spacing
  retention_decay_rate: number;  // Ebbinghaus curve fit
  forgetting_index: number;  // Empirical forgetting
  optimal_next_review_days: number;

  // ENGAGEMENT & ATTENTION (10 features)
  session_frequency: number;  // Logins per week
  avg_session_duration: number;
  quiz_completion_rate: number;  // Started / Finished
  days_inactive: number;
  time_of_day_consistency: number;  // Regular schedule = engagement
  chat_history_length: number;  // Questions asked = engagement
  help_seeking_frequency: number;
  solution_view_count: number;  // Hints/solutions viewed
  re_attempts_after_wrong: number;  // Persistence
  study_pattern_regularity: number;

  // COGNITIVE FACTORS (6 features)
  problem_solving_approach: number;  // Trial-and-error vs systematic
  question_reading_time: number;  // Do they rush or think?
  note_taking_pattern: number;  // Proxy for active learning
  peer_comparison_quartile: number;  // How they rank vs peers
  learning_curve_steepness: number;  // How fast they improve
  topic_affinity_score: number;  // Interest/preference level

  // META-COGNITIVE (4 features)
  self_assessment_accuracy: number;  // Quiz confidence vs actual
  help_quality_ratio: number;  // Quality of questions asked
  conceptual_vs_procedural_ratio: number;  // Deep vs shallow
  error_correction_pattern: number;  // Do they learn from mistakes?
}

/**
 * Extract all 40+ features for a student
 */
export function extractAdvancedFeatures(
  studentId: string,
  history: StudentHistory,
  referenceDate: Date = new Date()
): AdvancedStudentFeatures {
  
  // MASTERY SIGNALS
  const avgScore = calculateAverageScore(history);
  const recentScores = history.quizResults.slice(-3).map(q => q.score);
  const recentScore = recentScores.length > 0 ? 
    recentScores.reduce((a, b) => a + b) / recentScores.length : 0;
  
  const scoreImprovementRate = calculateLinearTrend(
    history.quizResults.map(q => q.score),
    history.quizResults.map(q => q.timestamp)
  );
  
  const scoreVariance = calculateVariance(history.quizResults.map(q => q.score));
  const scoreSkewness = calculateSkewness(history.quizResults.map(q => q.score));
  
  // SPACING & RETENTION (Ebbinghaus model)
  const daysOfHistory = calculateDaySpan(history);
  const spacingEffectiveness = calculateSpacingEffect(history);
  const forgetIndex = estimateForgetIndex(history, referenceDate);
  
  // ENGAGEMENT
  const sessionFrequency = calculateSessionFrequency(history, referenceDate);
  const avgSessionDuration = calculateAvgSessionDuration(history);
  const completionRate = calculateCompletionRate(history);
  const daysInactive = calculateDaysInactive(history, referenceDate);
  
  // And so on...
  
  return {
    avg_quiz_score: avgScore,
    recent_quiz_score: recentScore,
    score_improvement_rate: scoreImprovementRate,
    score_variance: scoreVariance,
    score_skewness: scoreSkewness,
    attempts_per_topic: history.quizResults.length,
    time_on_task: calculateTotalTimeOnTask(history),
    mistakes_per_attempt: calculateMistakesPerAttempt(history),
    correct_first_attempt_rate: calculateFirstAttemptSuccess(history),
    partial_credit_pattern: calculatePartialCreditTrend(history),
    topic_difficulty_adjusted_score: adjustForDifficulty(history),
    mastery_confidence: estimateMasteryConfidence(history),
    
    days_since_last_attempt: calculateDaysSinceLastAttempt(history, referenceDate),
    days_since_first_attempt: daysOfHistory,
    inter_attempt_days_avg: calculateAvgInterAttemptDays(history),
    inter_attempt_days_variance: calculateInterAttemptVariance(history),
    spaced_repetition_score: spacingEffectiveness,
    retention_decay_rate: calculateDecayRate(history),
    forgetting_index: forgetIndex,
    optimal_next_review_days: predictOptimalReviewDay(history),
    
    session_frequency: sessionFrequency,
    avg_session_duration: avgSessionDuration,
    quiz_completion_rate: completionRate,
    days_inactive: daysInactive,
    time_of_day_consistency: calculateScheduleConsistency(history),
    chat_history_length: calculateChatFrequency(history),
    help_seeking_frequency: calculateHelpSeeking(history),
    solution_view_count: calculateSolutionViews(history),
    re_attempts_after_wrong: calculateRetryRate(history),
    study_pattern_regularity: calculatePatternRegularity(history),
    
    problem_solving_approach: estimateProblemSolvingApproach(history),
    question_reading_time: estimateReadingTime(history),
    note_taking_pattern: estimateNoteTaking(history),
    peer_comparison_quartile: calculatePeerComparison(history),
    learning_curve_steepness: calculateLearningRate(history),
    topic_affinity_score: estimateTopicAffinity(history),
    
    self_assessment_accuracy: calculateSelfAssessmentAccuracy(history),
    help_quality_ratio: evaluateHelpQuality(history),
    conceptual_vs_procedural_ratio: analyzeConceptualUnderstanding(history),
    error_correction_pattern: analyzeErrorCorrection(history),
  };
}
```

### **1C. Better ADK Decision Engine with Multi-Signal Context**

```typescript name="src/ai/adk/advanced_decision_engine.ts"
/**
 * ADVANCED ADK Decision Engine
 * 
 * Makes nuanced decisions based on:
 * - Multiple ML signals (mastery, attention, forgetting)
 * - Student state (learning style, preferences)
 * - Context (time to exam, curriculum position)
 * - Teacher guidelines
 */

import { AdvancedStudentFeatures } from '@/ml/features/advanced_student_features';

export interface AdvancedADKContext {
  studentId: string;
  topic: string;
  features: AdvancedStudentFeatures;
  mlSignals: {
    mastery_probability: number;
    mastery_confidence: number;
    forgetting_days: number;
    attention_risk: 'LOW' | 'MEDIUM' | 'HIGH';
    learning_velocity: number;  // How fast improving
    engagement_trend: 'improving' | 'stable' | 'declining';
  };
  context: {
    daysUntilExam: number;
    currentGrade: number;
    classAverageMastery: number;
    prerequisitesMastered: boolean;
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    preferredDifficulty: 'easy' | 'medium' | 'hard';
  };
}

export function makeAdvancedRevisionDecision(
  ctx: AdvancedADKContext
): AdvancedADKDecision {
  
  const {
    features,
    mlSignals,
    context,
  } = ctx;
  
  // MASTERY SCORING (0-100)
  const masteryScore = (mlSignals.mastery_probability * 100);
  
  // URGENCY SCORING (based on Ebbinghaus)
  // If student is on forgetting curve boundary, urgency is HIGH
  const forgetUrgency = scoreForgetUrgency(
    mlSignals.forgetting_days,
    features.inter_attempt_days_avg
  );
  
  // ENGAGEMENT SCORING
  const engagementScore = scoreEngagement(
    features.session_frequency,
    features.avg_session_duration,
    features.days_inactive,
    mlSignals.attention_risk
  );
  
  // LEARNING VELOCITY (is student accelerating?)
  const velocityBonus = mlSignals.learning_velocity > 0.05 ? 
    "can_handle_challenge" : "needs_reinforcement";
  
  // EXAM PROXIMITY (crunch time = different strategy)
  const examProximityFactor = context.daysUntilExam < 7 ? 
    "intensive_cramming" : "spaced_learning";
  
  // PEER COMPARISON (gamification element)
  const peerPercentile = features.peer_comparison_quartile;
  
  // DECISION LOGIC with multiple thresholds
  let decision: AdvancedADKDecision;
  
  if (masteryScore >= 80 && engagementScore >= 70) {
    // Student mastered AND engaged → Challenge them
    decision = {
      action: "CHALLENGE_NEXT_TOPIC",
      priority: "LOW",
      contentStrategy: "CHALLENGE",
      intensity: "HIGH",
      reasoning: `Mastery at ${masteryScore}%, engagement strong. Ready for next topic.`,
    };
  } else if (forgetUrgency > 0.8 && masteryScore < 70) {
    // Critical forget window + weak mastery → Urgent spaced review
    decision = {
      action: "URGENT_SPACED_REVIEW",
      priority: "CRITICAL",
      contentStrategy: "REMEDIAL",
      intensity: "MEDIUM",
      spacing_days: calculateOptimalSpacingGap(features),
      reasoning: `Forgetting curve critical (${mlSignals.forgetting_days} days). Mastery ${masteryScore}% needs reinforcement.`,
    };
  } else if (mlSignals.attention_risk === 'HIGH' && engagementScore < 40) {
    // Student disengaging → Motivational intervention
    decision = {
      action: "MOTIVATIONAL_INTERVENTION",
      priority: "HIGH",
      contentStrategy: "MOTIVATIONAL",
      intensity: "LOW",
      intervention_type: "peer_leaderboard" | "progress_celebration",
      reasoning: `Attention risk HIGH. Engagement declining. Need motivation boost.`,
    };
  } else if (examProximityFactor === "intensive_cramming") {
    // Exam in <7 days → High-yield review
    decision = {
      action: "INTENSIVE_EXAM_PREP",
      priority: "HIGH",
      contentStrategy: "DEEP_DIVE",
      intensity: "HIGH",
      focus_on: "high_yield_concepts",  // 20% of content = 80% of exam
      reasoning: `Exam ${context.daysUntilExam} days away. Focus on high-yield topics.`,
    };
  } else {
    // Default: Steady progress with adaptive difficulty
    decision = {
      action: "ADAPTIVE_LEARNING",
      priority: "MEDIUM",
      contentStrategy: this.selectAdaptiveDifficulty(
        masteryScore,
        context.preferredDifficulty
      ),
      intensity: "MEDIUM",
      reasoning: `Steady progress. Adapt difficulty to ${context.preferredDifficulty} preference.`,
    };
  }
  
  return decision;
}

/**
 * Calculate optimal spacing gap based on spaced repetition science
 * 
 * Based on:
 * - Supermemo algorithm (SM-2)
 * - Leitner system
 * - Ebbinghaus spacing effect
 */
function calculateOptimalSpacingGap(features: AdvancedStudentFeatures): number {
  // SM-2 interval calculation
  const easinessFactor = calculateEasinessFactor(features);
  const previousInterval = features.inter_attempt_days_avg || 1;
  
  const nextInterval = previousInterval * easinessFactor;
  
  return Math.min(Math.max(1, nextInterval), 30);  // Clamp 1-30 days
}

function calculateEasinessFactor(features: AdvancedStudentFeatures): number {
  // EF := EF' + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // Where q = quality (0-5) based on:
  // - Quiz score (higher = better)
  // - Time to answer (faster = better)
  // - Consistency (low variance = better)
  
  const qualityScore = (
    features.avg_quiz_score * 0.4 +
    (1 - Math.min(features.question_reading_time / 60, 1)) * 0.3 +
    (1 - Math.min(features.score_variance / 0.5, 1)) * 0.3
  ) * 5;  // Scale to 0-5
  
  const EF_previous = 1.3;  // Default SuperMemo
  const EF_new = EF_previous + (0.1 - (5 - qualityScore) * (0.08 + (5 - qualityScore) * 0.02));
  
  return Math.max(1.3, EF_new);  // EF should never be < 1.3
}
```

---

# **TIER 2: Advanced ML (Week 3-4)**

### **2A. Deep Learning (Transformers) for Sequence Modeling**

Students don't learn linearly. Their learning is a **sequence of interactions**. Use transformer models to capture temporal patterns:

```python name="src/ml/training/train_transformer_models.py"
"""
Transformer-based models for sequence learning
Uses PyTorch/Hugging Face
"""

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
import numpy as np
from pathlib import Path

class StudentLearningDataset(Dataset):
    """
    Represents a student's quiz sequence as a learning trajectory
    
    Example:
    Quiz 1 (Algebra, score=0.4, time=180s)
    Quiz 2 (Algebra, score=0.5, time=160s)
    Quiz 3 (Geometry, score=0.3, time=200s)
    Quiz 4 (Algebra, score=0.7, time=140s)  <- Predict mastery for next Algebra quiz
    """
    
    def __init__(self, student_histories, max_sequence_length=50):
        self.sequences = []
        self.labels = []
        self.max_seq_len = max_sequence_length
        
        for student_id, history in student_histories.items():
            # Convert quiz sequence to embeddings
            sequence_embeddings = self._history_to_sequence(history)
            
            if len(sequence_embeddings) > 0:
                self.sequences.append(sequence_embeddings)
                # Label: is student mastered on next attempt?
                self.labels.append(self._get_next_mastery(history))
    
    def _history_to_sequence(self, history):
        """Convert quiz history to sequence of embeddings"""
        embeddings = []
        for quiz in history.quizResults:
            embedding = torch.tensor([
                quiz.score,
                quiz.timeSpent / 600,  # Normalize time (10 min = 1.0)
                self._topic_to_id(quiz.topic) / 100,  # Topic embedding
                # Add more features...
            ], dtype=torch.float32)
            embeddings.append(embedding)
        
        return torch.stack(embeddings[-self.max_seq_len:])
    
    def _get_next_mastery(self, history):
        """Get label: mastered (1) or not (0) on next attempt"""
        if len(history.quizResults) < 2:
            return 0
        last_score = history.quizResults[-1].score
        return 1 if last_score >= 0.7 else 0
    
    def __len__(self):
        return len(self.sequences)
    
    def __getitem__(self, idx):
        seq = self.sequences[idx]
        # Pad to max length
        padded = torch.zeros(self.max_seq_len, seq.shape[1])
        padded[:len(seq)] = seq
        return padded, self.labels[idx]


class StudentMasteryTransformer(nn.Module):
    """
    Transformer model for predicting student mastery trajectory
    
    Based on:
    - "Attention is All You Need" (Vaswani et al.)
    - "Deep Knowledge Tracing" (Piech et al.)
    """
    
    def __init__(
        self,
        input_dim: int = 10,
        hidden_dim: int = 256,
        num_heads: int = 8,
        num_layers: int = 4,
        dropout: float = 0.1,
    ):
        super().__init__()
        
        self.embedding = nn.Linear(input_dim, hidden_dim)
        
        # Positional encoding (important for sequence models!)
        self.positional_encoding = nn.Parameter(
            self._get_positional_encoding(50, hidden_dim)
        )
        
        # Transformer encoder
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_dim,
            nhead=num_heads,
            dim_feedforward=hidden_dim * 4,
            dropout=dropout,
            batch_first=True,
        )
        self.transformer_encoder = nn.TransformerEncoder(
            encoder_layer,
            num_layers=num_layers,
        )
        
        # Classification head
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim // 2, 1),
            nn.Sigmoid(),
        )
    
    def _get_positional_encoding(self, max_len, d_model):
        """Positional encoding (Vaswani et al.)"""
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(
            torch.arange(0, d_model, 2).float() * (-np.log(10000.0) / d_model)
        )
        pe[:, 0::2] = torch.sin(position * div_term)
        if d_model % 2 == 1:
            pe[:, 1::2] = torch.cos(position * div_term[:-1])
        else:
            pe[:, 1::2] = torch.cos(position * div_term)
        return pe
    
    def forward(self, x, mask=None):
        """
        Args:
            x: (batch_size, seq_len, input_dim)
            mask: attention mask for padding
        """
        # Embed input
        x = self.embedding(x)  # (batch_size, seq_len, hidden_dim)
        
        # Add positional encoding
        x = x + self.positional_encoding[:x.shape[1]]
        
        # Transformer
        x = self.transformer_encoder(x, src_key_padding_mask=mask)
        
        # Global average pooling
        x = x.mean(dim=1)  # (batch_size, hidden_dim)
        
        # Classification
        logits = self.fc(x)  # (batch_size, 1)
        
        return logits


def train_transformer():
    """Train transformer model for mastery prediction"""
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # Load data
    dataset = StudentLearningDataset({})  # Load from DB
    train_loader = DataLoader(dataset, batch_size=32, shuffle=True)
    
    # Initialize model
    model = StudentMasteryTransformer(
        input_dim=10,
        hidden_dim=256,
        num_heads=8,
        num_layers=4,
    ).to(device)
    
    # Training loop
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)
    criterion = nn.BCELoss()
    
    for epoch in range(50):
        total_loss = 0
        for sequences, labels in train_loader:
            sequences = sequences.to(device)
            labels = labels.float().to(device)
            
            # Forward pass
            logits = model(sequences)
            loss = criterion(logits.squeeze(), labels)
            
            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
        
        print(f"Epoch {epoch+1}/50 - Loss: {total_loss/len(train_loader):.4f}")
    
    # Save
    torch.save(model.state_dict(), Path("src/ml/models/transformer_mastery.pt"))
    print("✅ Transformer model trained!")
```

### **2B. Bayesian Models for Uncertainty**

Not just predict mastery, but predict **confidence intervals**. This helps with decision-making:

```python name="src/ml/training/train_bayesian_models.py"
"""
Bayesian ML models for uncertainty quantification
"""

import pymc as pm
import numpy as np
import arviz as az
from pathlib import Path

def train_bayesian_mastery_model():
    """
    Bayesian Hierarchical Model for topic mastery
    
    Accounts for:
    - Individual student differences (random effects)
    - Topic difficulties (random effects)
    - Uncertainty in predictions
    """
    
    # Load data (simplified)
    students = np.array([0, 0, 1, 1, 2, 2])  # Student IDs
    topics = np.array([0, 1, 0, 1, 0, 1])    # Topic IDs
    scores = np.array([0.4, 0.3, 0.7, 0.5, 0.6, 0.8])  # Quiz scores
    
    with pm.Model() as model:
        # Population-level priors
        mu_student = pm.Normal("mu_student", mu=0.5, sigma=0.2)
        sigma_student = pm.HalfNormal("sigma_student", sigma=0.2)
        
        mu_topic = pm.Normal("mu_topic", mu=0, sigma=0.1)
        sigma_topic = pm.HalfNormal("sigma_topic", sigma=0.1)
        
        # Student random effects
        student_offset = pm.Normal(
            "student_offset",
            mu=0,
            sigma=sigma_student,
            shape=len(np.unique(students))
        )
        
        # Topic random effects
        topic_offset = pm.Normal(
            "topic_offset",
            mu=0,
            sigma=sigma_topic,
            shape=len(np.unique(topics))
        )
        
        # Likelihood
        expected_score = (
            mu_student +
            student_offset[students] +
            mu_topic +
            topic_offset[topics]
        )
        
        # Clip to [0, 1]
        expected_score = pm.math.clip(expected_score, 0, 1)
        
        # Observation model
        pm.Beta(
            "obs",
            alpha=expected_score * 10,  # Scale parameter
            beta=(1 - expected_score) * 10,
            observed=scores
        )
        
        # Sample from posterior
        idata = pm.sample(
            2000,
            tune=1000,
            target_accept=0.9,
            random_seed=42,
        )
    
    # Save posterior samples
    az.to_netcdf(idata, Path("src/ml/models/bayesian_mastery_posterior.nc"))
    print("✅ Bayesian model trained!")
    
    return idata
```

---

# **TIER 3: Dynamic LLM Orchestration (Week 4-5)**

Instead of **hard-coded prompts**, use **learned routing** to determine which LLM strategy is best for each student:

```typescript name="src/ai/llm/dynamic_llm_orchestrator.ts"
/**
 * DYNAMIC LLM Orchestration
 * 
 * Instead of:
 * "If mastery < 0.4, use REMEDIAL strategy"
 * 
 * Use learned routing:
 * - What teaching strategy has worked best for this student?
 * - What works best for their learning style?
 * - What's the optimal content length/difficulty/tone?
 */

import { AdvancedADKContext, AdvancedADKDecision } from '@/ai/adk/advanced_decision_engine';
import { Anthropic } from '@anthropic-ai/sdk';

export interface DynamicLLMContext {
  studentId: string;
  topic: string;
  adkDecision: AdvancedADKDecision;
  features: any;
  historicalSuccess: {
    bestContentStrategy: string;
    bestTone: 'motivating' | 'challenging' | 'supportive';
    bestDuration: 'brief' | 'moderate' | 'comprehensive';
    averageComprehension: number;  // 0-100
    lastThreeSessions: Array<{
      strategy: string;
      outcome: 'mastered' | 'partial' | 'failed';
    }>;
  };
}

export async function dynamicLLMOrchestrate(
  ctx: DynamicLLMContext
): Promise<{
  content: string;
  metadata: {
    strategy_used: string;
    tokens_used: number;
    model_selected: string;
  };
}> {
  
  const { studentId, topic, adkDecision, features, historicalSuccess } = ctx;
  
  // ROUTE TO OPTIMAL LLM + PROMPT COMBINATION
  
  // Route 1: Claude for complex explanation
  // (Best for conceptual understanding)
  if (
    adkDecision.contentStrategy === 'DEEP_DIVE' ||
    features.conceptual_vs_procedural_ratio > 0.6
  ) {
    return await generateWithClaude(ctx);
  }
  
  // Route 2: Specialized Models (via OpenAI)
  // (Best for quick, focused explanations)
  if (
    adkDecision.contentStrategy === 'SHORT_FORM' ||
    adkDecision.contentStrategy === 'CHALLENGE'
  ) {
    return await generateWithGPT4(ctx);
  }
  
  // Route 3: Interactive Learning (via Gemini)
  // (Best for Socratic method)
  if (adkDecision.contentStrategy === 'INTERACTIVE') {
    return await generateWithGemini(ctx);
  }
  
  // Route 4: Motivational (specialized tuned model)
  if (adkDecision.contentStrategy === 'MOTIVATIONAL') {
    return await generateMotivational(ctx);
  }
}

async function generateWithClaude(
  ctx: DynamicLLMContext
): Promise<any> {
  const client = new Anthropic();
  
  const systemPrompt = buildSystemPrompt(ctx);
  const userPrompt = buildUserPrompt(ctx);
  
  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",  // Latest Claude
    max_tokens: calculateOptimalTokens(ctx),
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });
  
  return {
    content: message.content[0].type === 'text' ? message.content[0].text : '',
    metadata: {
      strategy_used: 'DEEP_CLAUDE',
      tokens_used: message.usage.output_tokens,
      model_selected: 'claude-3-5-sonnet',
    },
  };
}

function buildSystemPrompt(ctx: DynamicLLMContext): string {
  const { features, historicalSuccess } = ctx;
  
  const learningStyle = detectLearningStyle(features);
  const previousSuccessfulStrategies = historicalSuccess.lastThreeSessions
    .filter(s => s.outcome === 'mastered')
    .map(s => s.strategy);
  
  return `
You are an expert adaptive tutor for ${ctx.topic}.

STUDENT PROFILE:
- Learning Style: ${learningStyle}
- Current Comprehension: ${historicalSuccess.averageComprehension}%
- Preferred Tone: ${historicalSuccess.bestTone}
- Successful Strategies: ${previousSuccessfulStrategies.join(', ') || 'none yet'}

INSTRUCTIONS FOR THIS SESSION:
- Use the ${ctx.adkDecision.contentStrategy} strategy
- Target Duration: ${ctx.adkDecision.llmContext.targetDuration}
- Difficulty: ${ctx.adkDecision.llmContext.difficulty}
- Tone: ${ctx.adkDecision.llmContext.tone}

QUALITY CRITERIA:
1. **Clarity**: Explain like you're talking to someone at their level
2. **Engagement**: Ask questions to check understanding
3. **Relevance**: Connect to topics they know well
4. **Scaffolding**: Break complex ideas into steps
5. **Metacognition**: Explain not just WHAT, but WHY

OUTPUT FORMAT:
- Start with a brief hook related to their interests
- Build from foundational concepts up
- Include one worked example
- Finish with a self-reflection question
`;
}

function buildUserPrompt(ctx: DynamicLLMContext): string {
  const { topic, adkDecision, features } = ctx;
  
  return `
I need help understanding: ${topic}

Current Situation:
- My mastery level: ${(features.avg_quiz_score * 100).toFixed(0)}%
- Recent performance: ${features.score_improvement_rate > 0 ? 'improving' : 'declining'}
- Learning velocity: ${features.learning_curve_steepness}
- How I usually learn best: ${detectLearningStyle(features)}

What should I focus on?
${adkDecision.reasoning}

Please explain in a way that:
1. Builds on what I already know
2. Uses ${detectLearningStyle(features)} explanations
3. Takes about ${adkDecision.llmContext.targetDuration}
`;
}

/**
 * Select optimal token budget based on student profile
 * (More advanced students can handle deeper explanations)
 */
function calculateOptimalTokens(ctx: DynamicLLMContext): number {
  const { features } = ctx;
  
  // Base tokens based on content strategy
  const baseTokens: Record<string, number> = {
    'SHORT_FORM': 500,
    'DEEP_DIVE': 2000,
    'INTERACTIVE': 1500,
    'MOTIVATIONAL': 300,
    'CHALLENGE': 1800,
    'REMEDIAL': 1200,
  };
  
  let tokens = baseTokens[ctx.adkDecision.contentStrategy] || 1000;
  
  // Adjust for student mastery
  // More advanced → give them more depth
  tokens *= (1 + (features.avg_quiz_score * 0.5));
  
  return Math.min(Math.max(tokens, 300), 4000);  // Clamp 300-4000
}

function detectLearningStyle(features: any): string {
  // Analyze historical patterns to detect learning style
  // - Visual: prefer diagrams, visuals, spatial understanding
  // - Auditory: prefer explanations, discussions
  // - Kinesthetic: prefer hands-on, examples, practice
  
  if (features.note_taking_pattern > 0.7) {
    return 'visual (prefers diagrams and examples)';
  } else if (features.chat_history_length > 0.6) {
    return 'auditory (prefers discussions and explanations)';
  } else if (features.re_attempts_after_wrong > 0.7) {
    return 'kinesthetic (learns by doing and practice)';
  }
  
  return 'mixed';
}
```

---

# **TIER 4: Reference Models & Papers**

Use these **battle-tested** approaches:

| Model | Use Case | Paper | Open Source |
|-------|----------|-------|------------|
| **XGBoost** | Fast feature importance + baseline | [Chen & Guestrin, 2016](https://arxiv.org/abs/1603.02754) | ✅ Yes |
| **LightGBM** | Large datasets, low memory | [Ke et al., 2017](https://arxiv.org/abs/1705.07258) | ✅ Yes |
| **Transformers** | Sequential learning patterns | [Vaswani et al., 2017](https://arxiv.org/abs/1706.03762) | ✅ HuggingFace |
| **Deep Knowledge Tracing (DKT)** | LSTM for learning trajectories | [Piech et al., 2015](http://arxiv.org/abs/1506.05908) | ✅ Tensorflow |
| **Bayesian Knowledge Tracing** | Uncertainty quantification | [Corbett & Anderson, 1994](https://www.jstor.org/stable/41953695) | ✅ PyMC3 |
| **SuperMemo SM-2** | Spaced repetition algorithm | [Wozniak, 1990](https://www.supermemo.com/archives1990-2015/english/ol/beginning.htm) | ✅ Public domain |
| **Ebbinghaus Forgetting Curve** | Retention prediction | [Ebbinghaus, 1885](https://en.wikipedia.org/wiki/Forgetting_curve) | ✅ Classic |

---

# **QUICKSTART: Week 1 Action Items**

```bash
# 1. Install dependencies
pip install lightgbm xgboost scikit-learn pandas numpy torch transformers

# 2. Generate better synthetic data (with 40 features)
python src/ml/training/generate_advanced_data.py

# 3. Train ensemble models
python src/ml/training/train_ensemble_models.py

# 4. Evaluate and compare
python scripts/compare_models.py

# 5. Update feature extraction
# Replace src/ml/features/student_features.ts with advanced version

# 6. Update ADK decision logic
# Add multi-signal decision making

# 7. Deploy dynamic LLM orchestration
# Gradually route decisions to best LLM per student
```

---

# **RAG Pipeline Integration — How Production RAG Enables Each Tier**

The production-standard RAG pipeline (`src/ai/rag/`) has been explicitly designed to support each upgrade tier. The `retrieveContextWithMetadata()` API returns structured `RetrievalMetadata` that downstream ML, ADK, and LLM layers consume directly.

## Integration Points per Tier

### Tier 1A — Ensemble ML Models
| RAG Component | How It Feeds the Ensemble |
|---------------|---------------------------|
| `RetrievalMetadata.retrievalConfidence` | Ensemble models can use retrieval confidence as an additional input feature — if the knowledge base has strong context for a topic, the mastery prediction can be tempered by what the RAG found. |
| `RetrievalMetadata.topChunkSources` | Source identifiers let the ensemble correlate which student profiles were retrieved vs. the student being predicted, enabling peer-comparison features. |

### Tier 1B — Advanced Feature Engineering (40 features)
| Feature (from Core_block_upgrade) | RAG Metadata Source |
|-----------------------------------|---------------------|
| `chat_history_length` | `retrieveContextWithMetadata()` accepts `options.history` — the length of the chat history directly feeds this feature. |
| `help_seeking_frequency` | Each call to `retrieveContextWithMetadata()` counts as a help-seeking event; `queryTermCount` and `chunksReturned` proxy question complexity. |
| `topic_affinity_score` | `topChunkSources` reveals which student profiles / topics the user frequently queries — a proxy for topic interest. |

### Tier 1C — ADK Multi-Signal Decision Engine
```typescript
// Example: ADK using RAG metadata as an additional signal
import { retrieveContextWithMetadata } from '@/ai/rag/retriever';

const { context, metadata } = await retrieveContextWithMetadata(query, { history });

// Feed retrievalConfidence into ADK decision context
const adkContext = {
  ...existingContext,
  mlSignals: {
    ...existingSignals,
    // NEW: RAG confidence influences decision
    rag_confidence: metadata.retrievalConfidence,
  },
};

// ADK can now branch:
// - High confidence → ground LLM in retrieved context
// - Low confidence  → fall back to general knowledge mode
const decision = makeRevisionDecision(adkContext);
```

### Tier 2 — Transformer Sequence Models & Bayesian Uncertainty
| RAG Component | How It Supports Tier 2 |
|---------------|------------------------|
| `avgRelevanceScore` / `maxRelevanceScore` | These can be fed as time-series features into the `StudentMasteryTransformer` — the relevance of retrieved context over time correlates with how well the knowledge base covers a student's evolving needs. |
| `retrievalConfidence` | The Bayesian model can use retrieval confidence as an informative prior — when the RAG pipeline is confident, the Bayesian model's posterior can be more assertive. |

### Tier 3 — Dynamic LLM Orchestration
```typescript
// Example: Dynamic LLM routing using RAG metadata
import { retrieveContextWithMetadata } from '@/ai/rag/retriever';

const { context, metadata } = await retrieveContextWithMetadata(query, { history });

// Route based on RAG confidence
if (metadata.retrievalConfidence > 0.7) {
  // Strong RAG context → use it verbatim in a focused prompt
  return generateWithGemini({ context, strategy: 'DEEP_DIVE' });
} else if (metadata.retrievalConfidence > 0.3) {
  // Moderate → blend RAG context with general LLM knowledge
  return generateWithClaude({ context, strategy: 'INTERACTIVE' });
} else {
  // Weak → rely on LLM's own knowledge, skip RAG context
  return generateWithGPT4({ strategy: 'SHORT_FORM' });
}
```

## Data Flow Summary

```
Student interaction
    │
    ▼
retrieveContextWithMetadata()     ← Production RAG pipeline
    │
    ├── context (string)          → Injected into LLM prompt (existing flow)
    │
    └── metadata                  → Consumed by upgrade tiers:
        ├── queryTermCount        → Tier 1B (feature engineering)
        ├── chunksReturned        → Tier 1B (help_seeking_frequency)
        ├── avgRelevanceScore     → Tier 2  (transformer features)
        ├── maxRelevanceScore     → Tier 2  (Bayesian priors)
        ├── topChunkSources       → Tier 1B (topic_affinity_score)
        ├── retrievalConfidence   → Tier 1C (ADK decision weight)
        │                         → Tier 3  (LLM routing)
        └── totalIndexedChunks    → Observability / freshness monitoring
```

## VectorStore Migration Path

The `VectorStore` interface (`src/ai/rag/vector-store.ts`) provides a clean upgrade path:

| Phase | Backend | When |
|-------|---------|------|
| **Now** | `InMemoryVectorStore` | In-process, zero-config |
| **Tier 1** | `InMemoryVectorStore` + `refreshKnowledgeBase()` | Event-driven reindexing from Firestore |
| **Tier 2+** | Pinecone / pgvector / Weaviate | Implement `VectorStore` interface, swap factory in `retriever.ts` |

No changes to downstream consumers are needed — `retrieveContext()` and `retrieveContextWithMetadata()` abstract the backend.

---

# **Key Advantages of This Approach**

✅ **Ensemble**: Multiple models catch what single models miss  
✅ **40 Features**: Captures learning psychology (spacing, engagement, metacognition)  
✅ **Transformers**: Models temporal sequences → predicts learning trajectories  
✅ **Bayesian**: Knows when it's uncertain → safe decisions  
✅ **Dynamic LLM**: Routes to optimal model + prompt → better content  
✅ **Explainable**: Every decision has reasoning + feature importance  
✅ **Production-Ready**: All open-source, battle-tested in prod  
✅ **RAG-Integrated**: Production RAG pipeline feeds metadata directly into all tiers

This transforms your system from **toy ML → production-grade intelligence** 🚀