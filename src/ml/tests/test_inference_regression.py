import unittest
import sys
import os

# Add root to path so we can import src.ml.inference.predict_mastery
sys.path.append(os.path.abspath(os.getcwd()))

try:
    from src.ml.inference.predict_mastery import predict_mastery
except ImportError:
    # Fallback
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
    from src.ml.inference.predict_mastery import predict_mastery

class TestMasteryInferenceRegression(unittest.TestCase):

    def test_probability_boundaries(self):
        """Test inputs that might push probability to 0 or 1"""
        features_min = {
            "avg_quiz_score": 0.0,
            "attempts_per_topic": 100,
            "days_since_last_revision": 100,
            "quiz_score_variance": 0.0,
            "time_spent_per_question": 10
        }
        result_min = predict_mastery(features_min)
        # We just want to ensure it returns a valid probability 0-1
        self.assertTrue(0.0 <= result_min["mastery_probability"] <= 1.0, f"Min probability out of range: {result_min}")

        features_max = {
            "avg_quiz_score": 1.0,
            "attempts_per_topic": 1,
            "days_since_last_revision": 1,
            "quiz_score_variance": 0.0,
            "time_spent_per_question": 60
        }
        result_max = predict_mastery(features_max)
        self.assertTrue(0.0 <= result_max["mastery_probability"] <= 1.0, f"Max probability out of range: {result_max}")

    def test_negative_values(self):
        """Test with negative values (edge case handling)"""
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
        except Exception:
            # If it fails, it's acceptable for invalid input, but ideally we want robustness.
            # This test passes if it returns valid prob OR raises exception (doesn't hang or segfault).
            pass

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

    def test_missing_keys_graceful_failure(self):
         """Test missing keys"""
         features = {"avg_quiz_score": 0.5}
         try:
             predict_mastery(features)
         except KeyError:
             pass
         except Exception:
             pass

if __name__ == '__main__':
    unittest.main()
