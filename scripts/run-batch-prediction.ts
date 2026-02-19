
import { batchPredictMastery } from "../src/ml/inference/ml-bridge";

const mockInput = [
    {
        topic: "topic1",
        features: {
            avg_quiz_score: 0.75,
            attempts_per_topic: 5,
            days_since_last_revision: 3,
            quiz_score_variance: 0.05,
            time_spent_per_question: 45
        }
    }
];

(async () => {
    try {
        const result = await batchPredictMastery(mockInput);
        console.log(JSON.stringify({ status: "success", data: result }));
        process.exit(0);
    } catch (e: any) {
        console.log(JSON.stringify({ status: "error", error: e.message }));
        process.exit(0);
    }
})();
