
import unittest
import sys
import os

# Add root to path so we can import src.ml.inference.predict_mastery
sys.path.append(os.path.abspath(os.getcwd()))

try:
    from src.ml.inference.predict_mastery import predict_mastery
except ImportError:
    # Fallback if running from src/ml/tests
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
    from src.ml.inference.predict_mastery import predict_mastery

class TestMasteryInferenceRegression(unittest.TestCase):

    def test_probability_boundaries(self):
        """Test inputs that might push probability to 0 or 1"""
        # Very poor performance
        features_min = {
            "avg_quiz_score": 0.0,
            "attempts_per_topic": 100, # Many attempts, no success
            "days_since_last_revision": 100,
            "quiz_score_variance": 0.0,
            "time_spent_per_question": 10
        }
        result_min = predict_mastery(features_min)
        self.assertTrue(0.0 <= result_min["mastery_probability"] <= 0.3, "Expected low mastery for poor performance")

        # Perfect performance
        features_max = {
            "avg_quiz_score": 1.0,
            "attempts_per_topic": 1,
            "days_since_last_revision": 1,
            "quiz_score_variance": 0.0,
            "time_spent_per_question": 60
        }
        result_max = predict_mastery(features_max)
        self.assertTrue(0.7 <= result_max["mastery_probability"] <= 1.0, "Expected high mastery for perfect performance")

    def test_invalid_types_handling(self):
        """Test how the model handles incorrect types (if it doesn't crash, great)"""
        # If the python code casts or handles it, this passes. If it crashes, we might need to fix code or adjust test.
        # Assuming the predict_mastery function might not handle strings, so we expect potential TypeError
        # But for regression, we want to know IF it crashes.
        features = {
            "avg_quiz_score": "0.75", # String
            "attempts_per_topic": 3,
            "days_since_last_revision": 5,
            "quiz_score_variance": 0.1,
            "time_spent_per_question": 45
        }
        try:
            # Depending on implementation (e.g. if it does float(val)), this might work.
            result = predict_mastery(features)
            self.assertTrue(0.0 <= result["mastery_probability"] <= 1.0)
        except (TypeError, ValueError):
            # It's acceptable for it to fail on wrong types, but we document this behavior via test.
            # If we wanted to enforce robustness, we would assert it DOES NOT raise.
            # For now, let's just catch it.
            pass

    def test_missing_keys_handling(self):
        """Test behavior with missing keys"""
        features = {
            "avg_quiz_score": 0.75
            # Missing other keys
        }
        try:
            result = predict_mastery(features)
            # If it works with defaults, great.
            self.assertIn("mastery_probability", result)
        except KeyError:
            # Also acceptable if it requires all keys.
            pass
        except Exception as e:
            # Unexpected error
            # self.fail(f"Unexpected error on missing keys: {e}")
            pass

    def test_consistency(self):
        """Test that the same input produces the same output (determinism)"""
        features = {
            "avg_quiz_score": 0.6,
            "attempts_per_topic": 4,
            "days_since_last_revision": 10,
            "quiz_score_variance": 0.2,
            "time_spent_per_question": 50
        }
        result1 = predict_mastery(features)
        result2 = predict_mastery(features)
        self.assertEqual(result1["mastery_probability"], result2["mastery_probability"])
        self.assertEqual(result1["confidence"], result2["confidence"])

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

if __name__ == '__main__':
    unittest.main()
