import unittest
import sys
import os
import json
from unittest.mock import MagicMock, patch
import numpy as np

# Add repo root to sys.path to allow imports
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
sys.path.insert(0, repo_root)

# Import the module under test
# We use importlib to ensure we get a fresh module if needed, but standard import is fine for now
from src.ml.inference.predict_mastery import predict_mastery

class TestPredictMastery(unittest.TestCase):

    @patch('src.ml.inference.predict_mastery.joblib.load')
    @patch('os.path.exists')
    def test_predict_mastery_mastered(self, mock_exists, mock_load):
        # Mock model file exists
        mock_exists.return_value = True

        # Mock the loaded model
        mock_model = MagicMock()
        # predict_proba returns [prob_class_0, prob_class_1]
        # Let's say 0.3 probability of failure (class 0), 0.7 probability of mastery (class 1)
        mock_model.predict_proba.return_value = np.array([[0.3, 0.7]])
        mock_load.return_value = mock_model

        # Reset global model in predict_mastery module to force reload
        import src.ml.inference.predict_mastery as pm
        pm.model = None

        features = {
            'avg_quiz_score': 0.8,
            'attempts_per_topic': 2,
            'days_since_last_revision': 5,
            'quiz_score_variance': 0.1,
            'time_spent_per_question': 45
        }

        result = predict_mastery(features)

        self.assertEqual(result['predicted_class'], 'mastered')
        self.assertEqual(result['mastery_probability'], 0.7)
        self.assertEqual(result['confidence'], 0.7)

    @patch('src.ml.inference.predict_mastery.joblib.load')
    @patch('os.path.exists')
    def test_predict_mastery_not_mastered(self, mock_exists, mock_load):
        mock_exists.return_value = True

        mock_model = MagicMock()
        # 0.8 prob of failure, 0.2 prob of mastery
        mock_model.predict_proba.return_value = np.array([[0.8, 0.2]])
        mock_load.return_value = mock_model

        import src.ml.inference.predict_mastery as pm
        pm.model = None

        features = {
            'avg_quiz_score': 0.3,
            'attempts_per_topic': 5,
            'days_since_last_revision': 20,
            'quiz_score_variance': 0.2,
            'time_spent_per_question': 10
        }

        result = predict_mastery(features)

        self.assertEqual(result['predicted_class'], 'not_mastered')
        self.assertEqual(result['mastery_probability'], 0.2)
        # Confidence is max(0.8, 0.2) = 0.8
        self.assertEqual(result['confidence'], 0.8)

    @patch('src.ml.inference.predict_mastery.joblib.load')
    @patch('os.path.exists')
    def test_predict_mastery_legacy_dict_format(self, mock_exists, mock_load):
        mock_exists.return_value = True

        mock_sklearn_model = MagicMock()
        mock_sklearn_model.predict_proba.return_value = np.array([[0.1, 0.9]])

        # Mock loading a dict containing the model
        mock_load.return_value = {'model': mock_sklearn_model}

        import src.ml.inference.predict_mastery as pm
        pm.model = None

        features = {
            'avg_quiz_score': 0.9,
            'attempts_per_topic': 1,
            'days_since_last_revision': 1,
            'quiz_score_variance': 0.05,
            'time_spent_per_question': 50
        }

        result = predict_mastery(features)

        self.assertEqual(result['predicted_class'], 'mastered')
        self.assertEqual(result['mastery_probability'], 0.9)

if __name__ == '__main__':
    unittest.main()
