import unittest
import sys
import os

# Add root to path so we can import src.ml.inference.predict_mastery
# This assumes we run from the repository root
sys.path.append(os.path.abspath(os.getcwd()))

try:
    from src.ml.inference.predict_mastery import predict_mastery
except ImportError:
    # Fallback if running from src/ml/tests
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
    from src.ml.inference.predict_mastery import predict_mastery

class TestMasteryInference(unittest.TestCase):

    def test_valid_input(self):
        """Test with normal valid input"""
        features = {
            "avg_quiz_score": 0.75,
            "attempts_per_topic": 3,
            "days_since_last_revision": 5,
            "quiz_score_variance": 0.1,
            "time_spent_per_question": 45
        }
        result = predict_mastery(features)

        self.assertIn("mastery_probability", result)
        self.assertIn("confidence", result)
        self.assertIn("predicted_class", result)

        prob = result["mastery_probability"]
        self.assertTrue(0.0 <= prob <= 1.0, f"Probability {prob} out of range")

        conf = result["confidence"]
        self.assertTrue(0.0 <= conf <= 1.0, f"Confidence {conf} out of range")

        self.assertIn(result["predicted_class"], ["mastered", "not_mastered"])

    def test_boundary_zero(self):
        """Test with all zero inputs"""
        features = {
            "avg_quiz_score": 0.0,
            "attempts_per_topic": 0,
            "days_since_last_revision": 0,
            "quiz_score_variance": 0.0,
            "time_spent_per_question": 0
        }
        result = predict_mastery(features)
        self.assertTrue(0.0 <= result["mastery_probability"] <= 1.0)

    def test_boundary_max(self):
        """Test with high values"""
        features = {
            "avg_quiz_score": 1.0,
            "attempts_per_topic": 100,
            "days_since_last_revision": 365,
            "quiz_score_variance": 1.0,
            "time_spent_per_question": 300
        }
        result = predict_mastery(features)
        self.assertTrue(0.0 <= result["mastery_probability"] <= 1.0)

    def test_negative_values(self):
        """Test with negative values (edge case handling)"""
        # The model might not throw, but should return a valid probability
        features = {
            "avg_quiz_score": -1.0,
            "attempts_per_topic": -5,
            "days_since_last_revision": -10,
            "quiz_score_variance": -0.5,
            "time_spent_per_question": -30
        }
        try:
            result = predict_mastery(features)
            self.assertTrue(0.0 <= result["mastery_probability"] <= 1.0)
        except Exception as e:
            # If the model explicitly rejects negatives, that's also valid,
            # but usually sklearn models just compute.
            self.fail(f"Prediction failed on negative input: {e}")

    def test_extreme_outliers(self):
        """Test with extreme outliers"""
        features = {
            "avg_quiz_score": 0.5,
            "attempts_per_topic": 10000,
            "days_since_last_revision": 9999,
            "quiz_score_variance": 100.0,
            "time_spent_per_question": 10000
        }
        result = predict_mastery(features)
        self.assertTrue(0.0 <= result["mastery_probability"] <= 1.0)

if __name__ == '__main__':
    unittest.main()
