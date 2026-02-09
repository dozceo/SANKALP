
// Use global fetch if available in Node 18+

async function runBenchmark() {
    const EVENT_COUNT = 100;
    const ENDPOINT = 'http://localhost:9002/api/activity/log';

    console.log(`🚀 Preparing benchmark with ${EVENT_COUNT} events...`);

    const events = Array.from({ length: EVENT_COUNT }, (_, i) => ({
        id: `evt_${Date.now()}_${i}`,
        studentId: `student_bench_${Date.now()}`,
        sessionId: `session_bench_${Date.now()}`,
        action: 'benchmark_test',
        timing: 123,
        data: { test: true, index: i },
        metadata: { source: 'benchmark' }
    }));

    const payload = {
        events: events
    };

    console.log(`📡 Sending request to ${ENDPOINT}...`);
    const startTime = performance.now();

    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const endTime = performance.now();
        const duration = endTime - startTime;

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
        }

        const result = await response.json();
        console.log(`✅ Success!`);
        console.log(`⏱️ Duration: ${duration.toFixed(2)} ms`);
        console.log(`📄 Processed: ${result.processed}`);

        // rudimentary validation
        if (result.processed !== EVENT_COUNT) {
            console.error(`⚠️ Mismatch! Expected ${EVENT_COUNT}, got ${result.processed}`);
        }

    } catch (error) {
        console.error('❌ Benchmark failed:', error);
        process.exit(1);
    }
}

runBenchmark();
