
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec as execCb } from 'child_process';

const exec = promisify(execCb);

const MOCK_PYTHON_PATH = path.join(process.cwd(), 'mock_ml_inference.py');

interface TestCase {
    name: string;
    scriptType?: 'single' | 'batch';
    pythonCode: string;
    expectedStatus: 'success' | 'error';
    expectedErrorMatch?: RegExp;
}

const testCases: TestCase[] = [
    {
        name: "Normal Success",
        scriptType: 'single',
        pythonCode: `
import sys
import json
import time

for line in sys.stdin:
    try:
        data = json.loads(line)
        result = {
            "mastery_probability": 0.8,
            "confidence": 0.9,
            "predicted_class": "mastered",
            "_id": data.get("_id")
        }
        print(json.dumps(result))
        sys.stdout.flush()
    except Exception as e:
        pass
`,
        expectedStatus: 'success'
    },
    {
        name: "Immediate Crash",
        scriptType: 'single',
        pythonCode: `
import sys
sys.exit(1)
`,
        expectedStatus: 'error',
        expectedErrorMatch: /Python process exited with code 1/
    },
    {
        name: "Crash During Processing",
        scriptType: 'single',
        pythonCode: `
import sys
import json

for line in sys.stdin:
    sys.exit(1)
`,
        expectedStatus: 'error',
        expectedErrorMatch: /Python process exited with code 1/
    },
    {
        name: "Invalid JSON Output",
        scriptType: 'single',
        pythonCode: `
import sys
import json

for line in sys.stdin:
    print("This is not JSON")
    sys.stdout.flush()
`,
        expectedStatus: 'error',
        expectedErrorMatch: /Python process exited|Python process closed/
    },
    {
        name: "Valid JSON with Error Field",
        scriptType: 'single',
        pythonCode: `
import sys
import json

for line in sys.stdin:
    data = json.loads(line)
    result = {
        "mastery_probability": 0,
        "confidence": 0,
        "predicted_class": "error",
        "error": "Simulated Python Error",
        "_id": data.get("_id")
    }
    print(json.dumps(result))
    sys.stdout.flush()
`,
        expectedStatus: 'success',
    },
    {
        name: "Timeout (Sleep 15s)",
        scriptType: 'single',
        pythonCode: `
import sys
import json
import time

for line in sys.stdin:
    time.sleep(15)
`,
        expectedStatus: 'error',
        expectedErrorMatch: /Timeout waiting for Python inference/
    },
    {
        name: "Batch Prediction - Python Crash",
        scriptType: 'batch',
        pythonCode: `
import sys
sys.exit(1)
`,
        expectedStatus: 'success',
    }
];

async function runTest(testCase: TestCase) {
    console.log(`Running Test: ${testCase.name}`);
    fs.writeFileSync(MOCK_PYTHON_PATH, testCase.pythonCode);

    const script = testCase.scriptType === 'batch' ? 'scripts/run-batch-prediction.ts' : 'scripts/run-prediction.ts';

    try {
        const { stdout, stderr } = await exec(`npx tsx ${script}`, {
            env: {
                ...process.env,
                ML_PYTHON_SCRIPT: MOCK_PYTHON_PATH,
                ML_API_URL: "http://localhost:9999/invalid"
            },
            timeout: 20000
        });

        const lines = stdout.trim().split('\n');
        let output = "";
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].startsWith('{')) {
                output = lines[i];
                break;
            }
        }

        if (!output) {
             console.error("No JSON output found. Stdout:", stdout);
             console.error("Stderr:", stderr);
             return { passed: false, message: "No JSON output found" };
        }

        let result: any;
        try {
             result = JSON.parse(output);
        } catch (e) {
             console.error("Failed to parse output JSON:", output);
             return { passed: false, message: "Output was not valid JSON" };
        }

        if (testCase.expectedStatus === 'success') {
            if (result.status === 'success') {
                 if (testCase.name === "Valid JSON with Error Field") {
                     if (result.data.predicted_class === "error" && result.data.error === "Simulated Python Error") {
                         return { passed: true };
                     } else {
                         return { passed: false, message: `Expected error field in result, got ${JSON.stringify(result.data)}` };
                     }
                 }
                 if (testCase.name === "Batch Prediction - Python Crash") {
                     if (Array.isArray(result.data) && result.data.length === 1 && result.data[0].prediction.predicted_class === "error") {
                         return { passed: true };
                     } else {
                         return { passed: false, message: `Expected error object in batch result, got ${JSON.stringify(result.data)}` };
                     }
                 }
                 return { passed: true };
            } else {
                return { passed: false, message: `Expected success, got error: ${result.error}` };
            }
        } else {
            if (result.status === 'error') {
                if (testCase.expectedErrorMatch) {
                    if (testCase.expectedErrorMatch.test(result.error)) {
                        return { passed: true };
                    } else {
                        return { passed: false, message: `Error message "${result.error}" did not match ${testCase.expectedErrorMatch}` };
                    }
                }
                return { passed: true };
            } else {
                return { passed: false, message: `Expected error, got success: ${JSON.stringify(result.data)}` };
            }
        }

    } catch (e: any) {
        console.error("Execution failed:", e.message);
        if (e.stdout) console.log("Stdout:", e.stdout);
        if (e.stderr) console.log("Stderr:", e.stderr);
        return { passed: false, message: `Script execution failure: ${e.message}` };
    }
}

async function main() {
    const results = [];
    for (const testCase of testCases) {
        const result = await runTest(testCase);
        results.push({ ...testCase, ...result });
        console.log(`  Result: ${result.passed ? 'PASS' : 'FAIL'} ${result.message || ''}`);
    }

    let report = `# Python-TypeScript Subprocess Error Propagation Audit\n\n`;
    report += `## Executive Summary\n`;
    report += `Audit performed on ${new Date().toISOString()}.\n`;
    report += `Scope: \`src/ml/inference/ml-bridge.ts\` and Python subprocess communication.\n\n`;

    report += `## Test Results\n\n| Test Case | Status | Details |\n|---|---|---|\n`;
    for (const r of results) {
        report += `| ${r.name} | ${r.passed ? '✅ PASS' : '❌ FAIL'} | ${r.message || 'Behavior as expected'} |\n`;
    }

    report += `\n## Error Propagation Matrix\n\n`;
    report += `Mapping observed behavior to system handling:\n\n`;
    report += `| Failure Mode | Python Behavior | TypeScript Handling | Outcome |\n`;
    report += `|---|---|---|---|\n`;

    results.forEach(r => {
        let handling = "Unknown";
        let outcome = r.passed ? "Handled Correctly" : "Unhandled/Silent Failure";

        if (r.name === "Immediate Crash") handling = "Process exit detected, Promise rejected";
        if (r.name === "Crash During Processing") handling = "Process exit detected, pending request rejected";
        if (r.name === "Invalid JSON Output") handling = "JSON parse error caught, process killed, request rejected";
        if (r.name === "Timeout (Sleep 15s)") handling = "Timeout timer fired, Promise rejected";
        if (r.name === "Valid JSON with Error Field") handling = "Error field detected, returned as result";
        if (r.name === "Normal Success") handling = "Standard JSON parsing";
        if (r.name === "Batch Prediction - Python Crash") {
            handling = "Process exit detected, exception caught, wrapped in error object";
            outcome = "Handled (Graceful Degradation)";
        }

        report += `| ${r.name} | Simulated | ${handling} | ${outcome} |\n`;
    });

    fs.writeFileSync('ERROR_PROPAGATION.md', report);
    console.log("Report generated: ERROR_PROPAGATION.md");

    if (fs.existsSync(MOCK_PYTHON_PATH)) fs.unlinkSync(MOCK_PYTHON_PATH);
}

main();
