import time
import asyncio
import httpx
import statistics
from datetime import datetime, timezone

API_URL = "http://localhost:8080/predict/batch"

def generate_mock_feature(learner_id: str) -> dict:
    return {
        "learnerId": learner_id,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "conceptMasteryMean": 0.65,
        "conceptMasteryStdDev": 0.1,
        "subjectMasteryDistribution": 0.5,
        "masteryVelocity": 0.02,
        "conceptStrengthVariance": 0.05,
        "learningAsymptoteEstimate": 0.8,
        "conceptsMasteredCount": 10,
        "conceptsLearningCount": 5,
        "conceptsStrugglingCount": 2,
        "masteryPercentile": 0.7,
        "daysSinceLastInteraction": 0.1,
        "interactionFrequencyPerWeek": 0.8,
        "sessionConsistencyScore": 0.9,
        "learningPatternSignature": 0.6,
        "optimalSpacingAdherence": 0.7,
        "timeOfDayPreference": 0.5,
        "sessionDurationTrend": 0.5,
        "interSessionIntervalAvg": 0.2,
        "chatFrequency": 0.1,
        "quizAttemptPattern": 0.8,
        "resourceExplorationDepth": 0.4,
        "engagementVolatility": 0.2,
        "errorPatternSignature": 0.1,
        "learningStyleIndicator": 0.5,
        "hintUsageRate": 0.3,
        "revisionBehavior": 0.6,
        "persistenceIndicator": 0.8,
        "peerComparisonEngagement": 0.2,
        "deviceConsistency": 0.9,
        "socialStudyBehavior": 0.1,
        "attentionSpanEstimation": 0.8,
        "distractionFrequency": 0.1,
        "mentalFatigueIndicator": 0.2,
        "optimalLearningWindow": 0.8,
        "processingSpeedEstimate": 0.7,
        "contextSwitchingFrequency": 0.3,
        "cognitiveLoadCapacity": 0.6,
        "recoveryTimeAfterFailure": 0.8,
        "questionComplexityPreference": 0.5,
        "multiTaskingIndicator": 0.4
    }

async def run_benchmark(batch_size: int = 50, num_requests: int = 100):
    print(f"Starting benchmark: {num_requests} requests, batch size {batch_size}")
    
    payload = {
        "features": [generate_mock_feature(f"learner_{i}") for i in range(batch_size)]
    }
    
    latencies = []
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Warmup
        try:
            await client.post(API_URL, json=payload)
        except Exception as e:
            print(f"Failed to connect to API: {e}")
            return
            
        for i in range(num_requests):
            start = time.perf_counter()
            response = await client.post(API_URL, json=payload)
            duration_ms = (time.perf_counter() - start) * 1000
            
            if response.status_code == 200:
                latencies.append(duration_ms)
            else:
                print(f"Request failed: {response.status_code}")
                
    if not latencies:
        print("All requests failed.")
        return
        
    avg_latency = statistics.mean(latencies)
    p95_latency = statistics.quantiles(latencies, n=20)[18]
    p99_latency = statistics.quantiles(latencies, n=100)[98]
    
    print("\n--- Benchmark Results ---")
    print(f"Total Requests: {len(latencies)}")
    print(f"Batch Size: {batch_size}")
    print(f"Average Latency: {avg_latency:.2f} ms")
    print(f"P95 Latency: {p95_latency:.2f} ms")
    print(f"P99 Latency: {p99_latency:.2f} ms")
    
    if p95_latency < 500:
        print("✅ Target met: P95 latency is < 500ms")
    else:
        print("❌ Target failed: P95 latency is >= 500ms")

if __name__ == "__main__":
    asyncio.run(run_benchmark())