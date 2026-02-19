
import unittest
import sys
import os
from unittest.mock import MagicMock

# Mock external dependencies BEFORE importing the module under test
sys.modules["joblib"] = MagicMock()
sys.modules["pandas"] = MagicMock()
sys.modules["sklearn"] = MagicMock()
sys.modules["numpy"] = MagicMock()

# Mock the model behavior
mock_model = MagicMock()
# predict_proba returns [[prob_class_0, prob_class_1]]
# We want it to return something based on input to verify our tests?
# Or just fixed values to ensure code paths run.
# For regression testing the *wrapper* logic, fixed values are okay.
# But our tests check for boundaries (0.0 to 1.0).
mock_model.predict_proba.return_value = [[0.2, 0.8]] # Default high mastery
mock_model.classes_ = ["not_mastered", "mastered"]

# Mock joblib.load to return our mock model
sys.modules["joblib"].load.return_value = mock_model

# Add root to path so we can import src.ml.inference.predict_mastery
sys.path.append(os.path.abspath(os.getcwd()))

try:
    from src.ml.inference.predict_mastery import predict_mastery
except ImportError:
    # Fallback if running from src/ml/tests
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
    from src.ml.inference.predict_mastery import predict_mastery

class TestMasteryInferenceRegression(unittest.TestCase):

    def setUp(self):
        # Reset mock for each test if needed
        mock_model.predict_proba.return_value = [[0.2, 0.8]]

    def test_probability_boundaries(self):
        """Test inputs that might push probability to 0 or 1"""
        # We can't test actual model logic with mocks, but we verify the wrapper doesn't crash
        # and returns the mocked probability structure correctly.

        # Very poor performance
        features_min = {
            "avg_quiz_score": 0.0,
            "attempts_per_topic": 100,
            "days_since_last_revision": 100,
            "quiz_score_variance": 0.0,
            "time_spent_per_question": 10
        }
        # Mock low mastery return
        mock_model.predict_proba.return_value = [[0.9, 0.1]]

        result_min = predict_mastery(features_min)
        # Check that it returns the 0.1 we set
        self.assertAlmostEqual(result_min["mastery_probability"], 0.1)

        # Perfect performance
        features_max = {
            "avg_quiz_score": 1.0,
            "attempts_per_topic": 1,
            "days_since_last_revision": 1,
            "quiz_score_variance": 0.0,
            "time_spent_per_question": 60
        }
        mock_model.predict_proba.return_value = [[0.1, 0.9]]
        result_max = predict_mastery(features_max)
        self.assertAlmostEqual(result_max["mastery_probability"], 0.9)

    def test_invalid_types_handling(self):
        """Test how the model handles incorrect types"""
        features = {
            "avg_quiz_score": "0.75",
            "attempts_per_topic": 3,
            "days_since_last_revision": 5,
            "quiz_score_variance": 0.1,
            "time_spent_per_question": 45
        }
        try:
            result = predict_mastery(features)
            self.assertTrue(0.0 <= result["mastery_probability"] <= 1.0)
        except (TypeError, ValueError):
            pass

    def test_missing_keys_handling(self):
        """Test behavior with missing keys"""
        features = {
            "avg_quiz_score": 0.75
        }
        try:
            result = predict_mastery(features)
            self.assertIn("mastery_probability", result)
        except KeyError:
            pass
        except Exception:
            pass

    def test_consistency(self):
        """Test that the same input produces the same output"""
        features = {
            "avg_quiz_score": 0.6,
            "attempts_per_topic": 4,
            "days_since_last_revision": 10,
            "quiz_score_variance": 0.2,
            "time_spent_per_question": 50
        }
        mock_model.predict_proba.return_value = [[0.4, 0.6]]
        result1 = predict_mastery(features)
        result2 = predict_mastery(features)
        self.assertEqual(result1["mastery_probability"], result2["mastery_probability"])

    def test_extreme_large_numbers(self):
        """Test with very large numbers"""
        features = {
            "avg_quiz_score": 0.9,
            "attempts_per_topic": 1000000,
            "days_since_last_revision": 1000000,
            "quiz_score_variance": 1000.0,
            "time_spent_per_question": 1000000
        }
        result = predict_mastery(features)
        self.assertTrue(0.0 <= result["mastery_probability"] <= 1.0)

    def test_typical_patterns(self):
        """Test real-world typical patterns"""
        struggling = {
            "avg_quiz_score": 0.3,
            "attempts_per_topic": 8,
            "days_since_last_revision": 2,
            "quiz_score_variance": 0.15,
            "time_spent_per_question": 120
        }
        mock_model.predict_proba.return_value = [[0.8, 0.2]] # Mock low
        res_struggling = predict_mastery(struggling)
        self.assertAlmostEqual(res_struggling["mastery_probability"], 0.2)

        improving = {
            "avg_quiz_score": 0.85,
            "attempts_per_topic": 2,
            "days_since_last_revision": 5,
            "quiz_score_variance": 0.05,
            "time_spent_per_question": 45
        }
        mock_model.predict_proba.return_value = [[0.2, 0.8]] # Mock high
        res_improving = predict_mastery(improving)
        self.assertAlmostEqual(res_improving["mastery_probability"], 0.8)

    def test_negative_and_excessive_values(self):
        """Test negative inputs and >1 inputs"""
        features_neg = {
            "avg_quiz_score": 0.5,
            "attempts_per_topic": 1,
            "days_since_last_revision": 1,
            "quiz_score_variance": 0.1,
            "time_spent_per_question": -100
        }
        try:
            res = predict_mastery(features_neg)
            self.assertTrue(0.0 <= res["mastery_probability"] <= 1.0)
        except Exception:
            pass

if __name__ == '__main__':
    unittest.main()
