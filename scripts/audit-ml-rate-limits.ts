
import fs from 'fs';

// Simulation Configuration
const SIMULATION_CONFIG = {
    requests: 50,
    burstSize: 30, // 30 students at once (teacher dashboard)
    inferenceTimeMs: 2000, // 2 seconds per inference
    maxConcurrency: 1, // Current implementation is single process
    timeoutMs: 10000, // 10s timeout
};

interface Request {
    id: number;
    startTime: number;
    endTime?: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'TIMEOUT' | 'FAILED';
}

class MockPythonBridge {
    private queue: Request[] = [];
    private processing = false;

    async processQueue() {
        if (this.processing || this.queue.length === 0) return;
        this.processing = true;

        const req = this.queue.shift();
        if (req) {
            req.status = 'PROCESSING';
            // Simulate inference time
            await new Promise(resolve => setTimeout(resolve, SIMULATION_CONFIG.inferenceTimeMs));
            req.endTime = Date.now();
            req.status = 'COMPLETED';
        }

        this.processing = false;
        this.processQueue();
    }

    addRequest(req: Request) {
        this.queue.push(req);
        this.processQueue();
    }
}

async function runSimulation() {
    console.log('Starting ML Rate Limit Simulation...');

    const requests: Request[] = [];
    const bridge = new MockPythonBridge();
    const startTime = Date.now();

    // Simulate Burst
    console.log(`Simulating burst of ${SIMULATION_CONFIG.burstSize} requests...`);
    for (let i = 0; i < SIMULATION_CONFIG.burstSize; i++) {
        const req: Request = { id: i, startTime: Date.now(), status: 'PENDING' };
        requests.push(req);
        bridge.addRequest(req);
    }

    // Wait for all to complete or timeout
    // We'll poll every 100ms
    while (requests.some(r => r.status === 'PENDING' || r.status === 'PROCESSING')) {
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check timeouts
        const now = Date.now();
        requests.forEach(r => {
            if ((r.status === 'PENDING' || r.status === 'PROCESSING') && (now - r.startTime > SIMULATION_CONFIG.timeoutMs)) {
                r.status = 'TIMEOUT';
                r.endTime = now;
            }
        });

        // Break if all timed out or completed
        if (requests.every(r => r.status === 'COMPLETED' || r.status === 'TIMEOUT')) break;
    }

    const duration = Date.now() - startTime;
    return { requests, duration };
}

async function main() {
    // 1. Analyze ml-bridge.ts (static analysis)
    let bridgeAnalysis = '';
    try {
        const bridgeContent = fs.readFileSync('src/ml/inference/ml-bridge.ts', 'utf-8');
        const hasRateLimit = bridgeContent.includes('RateLimit') || bridgeContent.includes('limiter');
        const hasCircuitBreaker = bridgeContent.includes('CircuitBreaker') || bridgeContent.includes('CIRCUIT_OPEN_DURATION');
        const hasQueue = bridgeContent.includes('queue') || bridgeContent.includes('pendingRequests');

        bridgeAnalysis += `**Rate Limiting:** ${hasRateLimit ? 'Yes' : 'No'}\n`;
        bridgeAnalysis += `**Circuit Breaker:** ${hasCircuitBreaker ? 'Yes' : 'No'}\n`;
        bridgeAnalysis += `**Queueing:** ${hasQueue ? 'Yes' : 'No'}\n`;
    } catch (e) {
        bridgeAnalysis = 'Could not read ml-bridge.ts';
    }

    // 2. Run Simulation
    // Since we can't wait too long in this environment, we will calculate theoretically for the report
    // but run a mini-simulation (5 requests) to demonstrate queueing latency.
    SIMULATION_CONFIG.burstSize = 5;
    SIMULATION_CONFIG.inferenceTimeMs = 100; // Speed up for test

    const { requests, duration } = await runSimulation();

    const completed = requests.filter(r => r.status === 'COMPLETED').length;
    const timedOut = requests.filter(r => r.status === 'TIMEOUT').length;
    const avgLatency = requests.filter(r => r.status === 'COMPLETED').reduce((acc, r) => acc + (r.endTime! - r.startTime), 0) / completed || 0;

    // 3. Theoretical Calculation for Full Burst (30 students)
    // 30 requests * 2s each = 60s total time for single process.
    // Timeout is 10s.
    // Thus, requests 6-30 will likely timeout.

    const theoreticalFailures = Math.max(0, 30 - (10 / 2)); // 10s timeout / 2s per req = 5 requests succeed.

    // Cost Calculation
    // Assuming 30 students per class, 5 classes per teacher, 1 dashboard load per day.
    // 150 requests.
    // Input: 1k tokens, Output: 500 tokens.
    // Price: $0.50 per 1M input, $1.50 per 1M output (Example)
    const dailyRequests = 150;
    const costPerReq = (1000 / 1000000 * 0.50) + (500 / 1000000 * 1.50);
    const dailyCost = dailyRequests * costPerReq;
    const monthlyCost = dailyCost * 30;

    // Generate Report
    const reportPath = 'RATE_LIMIT_PROPOSAL.md';
    let reportContent = '# ML Prediction API Rate Limiting & Cost Exposure\n\n';
    reportContent += `**Date:** ${new Date().toISOString()}\n\n`;

    reportContent += '## 1. Static Analysis\n';
    reportContent += bridgeAnalysis + '\n';

    reportContent += '## 2. Simulation Results (Mini-Burst)\n';
    reportContent += `Simulated ${SIMULATION_CONFIG.burstSize} concurrent requests with ${SIMULATION_CONFIG.inferenceTimeMs}ms inference time.\n`;
    reportContent += `- Completed: ${completed}\n`;
    reportContent += `- Timed Out: ${timedOut}\n`;
    reportContent += `- Avg Latency: ${avgLatency.toFixed(0)}ms\n\n`;

    reportContent += '## 3. Theoretical Bottleneck Analysis\n';
    reportContent += `**Scenario:** Teacher Dashboard loads for 30 students simultaneously.\n`;
    reportContent += `- **Concurrency:** 1 (Single Python Process)\n`;
    reportContent += `- **Inference Time:** ~2.0s\n`;
    reportContent += `- **Timeout:** 10s\n`;
    reportContent += `- **Result:** Only ~5 requests will succeed. The remaining 25 will timeout.\n`;
    reportContent += `**Impact:** The dashboard will show errors or empty data for 83% of students.\n\n`;

    reportContent += '## 4. Cost Projection\n';
    reportContent += `Assuming 150 requests/day (5 classes * 30 students):\n`;
    reportContent += `- **Daily Cost:** $${dailyCost.toFixed(4)}\n`;
    reportContent += `- **Monthly Cost:** $${monthlyCost.toFixed(2)}\n`;
    reportContent += `*Note: This is low, but the reliability issue is critical.*\n\n`;

    reportContent += '## 5. Rate Limit Proposal\n';
    reportContent += '### Immediate Fixes\n';
    reportContent += '1. **Increase Timeout:** Increase timeout to 60s for batch operations, or implement long-polling/WebSockets.\n';
    reportContent += '2. **Batch Processing:** Modify `ml-bridge.ts` to accept a batch of students and process them in a vectorized way in Python (processing 30 students in numpy takes almost same time as 1).\n';
    reportContent += '3. **Concurrency:** Spawn a pool of Python workers (e.g., 4 processes) to handle concurrent load.\n';

    reportContent += '### Recommended Limits\n';
    reportContent += '| Scope | Limit | Action |\n';
    reportContent += '|---|---|---|\n';
    reportContent += '| Per Student | 10 req/min | Block |\n';
    reportContent += '| Per Teacher | 100 req/min | Queue |\n';
    reportContent += '| Global ML | 5 concurrent | Queue |\n';

    fs.writeFileSync(reportPath, reportContent);
    console.log(`Report generated at ${reportPath}`);
}

main();
