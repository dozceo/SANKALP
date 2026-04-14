const { spawn } = require('child_process');
const path = require('path');

const NUM_REQUESTS = 100;
const PYTHON_SCRIPT = path.join(__dirname, '../src/ml/inference/predict_mastery.py');

function runSimulation() {
  return new Promise((resolve, reject) => {
    console.log(`Starting simulation with ${NUM_REQUESTS} requests...`);
    const python = spawn('python3', [PYTHON_SCRIPT]);

    python.on('error', (err) => {
      console.error('Failed to start python process:', err);
      reject(err);
    });

    const startTime = Date.now();
    let responsesReceived = 0;
    let requestsSent = 0;

    python.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(l => l.trim());
      responsesReceived += lines.length;
      if (responsesReceived >= NUM_REQUESTS) {
        const duration = Date.now() - startTime;
        console.log(`Completed ${responsesReceived} requests in ${duration}ms`);
        console.log(`Throughput: ${(responsesReceived / (duration / 1000)).toFixed(2)} req/sec`);
        python.kill();
        resolve(duration);
      }
    });

    python.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });

    // Send requests
    for (let i = 0; i < NUM_REQUESTS; i++) {
      const payload = {
        _id: `req-${i}`,
        avg_quiz_score: Math.random(),
        attempts_per_topic: Math.floor(Math.random() * 10),
        days_since_last_revision: Math.floor(Math.random() * 30),
        quiz_score_variance: Math.random() * 0.3,
        time_spent_per_question: Math.random() * 100
      };
      const success = python.stdin.write(JSON.stringify(payload) + '\n');
      if (!success) {
        // console.warn('Backpressure detected at req', i);
      }
      requestsSent++;
    }
    console.log(`Sent ${requestsSent} requests.`);
  });
}

runSimulation().catch(console.error);
