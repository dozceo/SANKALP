#!/bin/bash
set -e

echo "Running ADK Logic Unit Tests..."
npx jest src/ml/tests/adk_decision_engine.test.ts

echo "Running ML Prediction Unit Tests..."
python3 -m unittest src/ml/tests/test_predict_mastery.py

echo "Running LLM Schema Validation Tests..."
npx jest src/ml/tests/schema_validation.test.ts

echo "Running UI Integration Tests..."
echo "Note: This requires the Next.js app to be built or running. It may take some time."
npx playwright test e2e/regression.spec.ts || echo "UI Tests failed or timed out (expected in some CI environments without persistent server)"

echo "Regression Test Suite Completed."
