import { calculateTrend } from '../src/lib/trend-utils';

const cases = [
    {
        name: "Empty",
        data: [],
        expected: "STABLE"
    },
    {
        name: "Single item",
        data: [{ score: 0.8, timestamp: new Date() }],
        expected: "STABLE"
    },
    {
        name: "2 items, Improving",
        data: [
            { score: 0.9, timestamp: new Date('2023-01-02') },
            { score: 0.7, timestamp: new Date('2023-01-01') }
        ],
        expected: "IMPROVING"
    },
    {
        name: "2 items, Declining",
        data: [
            { score: 0.6, timestamp: new Date('2023-01-02') },
            { score: 0.8, timestamp: new Date('2023-01-01') }
        ],
        expected: "DECLINING"
    },
    {
        name: "2 items, Stable",
        data: [
            { score: 0.85, timestamp: new Date('2023-01-02') },
            { score: 0.8, timestamp: new Date('2023-01-01') }
        ],
        expected: "STABLE"
    },
    {
        name: "4 items, Improving (Avg recent vs older)",
        data: [
            { score: 0.9, timestamp: new Date('2023-01-04') },
            { score: 0.8, timestamp: new Date('2023-01-03') },
            // Avg recent: 0.85
            { score: 0.7, timestamp: new Date('2023-01-02') },
            { score: 0.6, timestamp: new Date('2023-01-01') }
            // Avg prev: 0.65
            // Diff: 0.2
        ],
        expected: "IMPROVING"
    },
     {
        name: "4 items, Declining",
        data: [
            { score: 0.5, timestamp: new Date('2023-01-04') },
            { score: 0.6, timestamp: new Date('2023-01-03') },
            // Avg recent: 0.55
            { score: 0.8, timestamp: new Date('2023-01-02') },
            { score: 0.9, timestamp: new Date('2023-01-01') }
            // Avg prev: 0.85
            // Diff: -0.3
        ],
        expected: "DECLINING"
    },
    {
        name: "3 items, mixed (recent high vs avg low)",
        data: [
            { score: 0.9, timestamp: new Date('2023-01-03') },
            // Recent: 0.9
            { score: 0.6, timestamp: new Date('2023-01-02') },
            { score: 0.7, timestamp: new Date('2023-01-01') }
            // Prev avg: 0.65
            // Diff: 0.25
        ],
        expected: "IMPROVING"
    }
];

let passed = true;
for (const c of cases) {
    // @ts-ignore
    const result = calculateTrend(c.data);
    if (result !== c.expected) {
        console.error(`FAILED: ${c.name}. Expected ${c.expected}, got ${result}`);
        passed = false;
    } else {
        console.log(`PASSED: ${c.name}`);
    }
}

if (!passed) process.exit(1);
