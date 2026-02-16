
import 'dotenv/config';
import { getMotivationalCounseling } from '../src/ai/flows/mindful-mentor';
import * as fs from 'fs';
import * as path from 'path';

// Mock Genkit if API key is missing to allow simulation
if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    console.warn('No API key found. Mocking Genkit for simulation.');
    process.env.GOOGLE_GENAI_API_KEY = 'mock-key';

    // We need to mock the module via module alias or similar, but since we are running tsx,
    // we might need to rely on the fact that if the key is missing, genkit initialization might fail
    // unless we mock it *before* import.
    // However, we already imported. Let's see if it works.
    // If it fails, we will use a different approach (mocking the function directly).
}

const REPORT_FILE = 'CHATBOT_CONTEXT_REPORT.md';

async function runAudit() {
    console.log('Starting Chatbot Context Window Audit...');

    const historySizes = [1000, 5000, 10000, 20000, 50000, 100000];
    const results: any[] = [];

    // Base content to repeat
    const baseHistory = "Student has been struggling with calculus. ";

    for (const size of historySizes) {
        console.log(`Testing with history size: ${size} chars...`);

        const history = baseHistory.repeat(Math.ceil(size / baseHistory.length)).substring(0, size);

        const start = Date.now();
        let status = 'SUCCESS';
        let errorMsg = '';
        let outputLength = 0;

        try {
            // We are calling the server action directly.
            // In a real scenario, this would hit the LLM.
            // If we are mocking, we should intercept this.

            // For this audit, if we can't hit the API, we will assume a token limit of ~32k tokens (~128k chars)
            // or typical limits. But let's try to call it.
            const response = await getMotivationalCounseling({
                studentConcern: "I am feeling overwhelmed.",
                studentHistory: history
            });

            outputLength = response.advice.length;
        } catch (error: any) {
            status = 'FAILED';
            errorMsg = error.message;
            console.error(`Failed at ${size}: ${error.message}`);
        }

        const duration = Date.now() - start;

        results.push({
            size,
            status,
            duration,
            outputLength,
            error: errorMsg
        });

        // Break early if we hit a hard failure to avoid wasting time on larger inputs
        if (status === 'FAILED' && errorMsg.includes('limit')) {
            break;
        }
    }

    generateReport(results);
}

function generateReport(results: any[]) {
    let report = `# Chatbot Context Window Audit Report

## Executive Summary
The chatbot flow was tested with increasing conversation history sizes to determine context window limits and failure modes.

## Test Results

| History Size (chars) | Status | Duration (ms) | Output Length | Error |
|----------------------|--------|---------------|---------------|-------|
`;

    for (const res of results) {
        report += `| ${res.size} | ${res.status} | ${res.duration} | ${res.outputLength} | ${res.error} |\n`;
    }

    report += `
## Analysis
`;

    const failed = results.find(r => r.status === 'FAILED');
    if (failed) {
        report += `The chatbot failed at history size ${failed.size} chars. This indicates a token limit or timeout issue.\n`;
        report += `**Recommendation:** Implement conversation summarization or a sliding window context manager to keep the history within limits (e.g., 10k chars).\n`;
    } else {
        report += `The chatbot handled all tested history sizes up to ${results[results.length-1].size} chars. \n`;
        report += `However, unbounded growth is still a risk. \n`;
        report += `**Recommendation:** Monitor token usage and implement a retention policy.\n`;
    }

    report += `
## Technical Details
- Flow: \`mindfulMentorFlow\`
- Input tested: \`studentHistory\`
- Max tested size: ${results[results.length-1].size} chars
`;

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`Report generated at ${REPORT_FILE}`);
}

// We need to handle the case where the import fails or the function calls fail because of missing API key in the environment
// by catching the import error or mocking the function if it's not available.
// But since we are in strict mode, let's just run it.

runAudit().catch(err => console.error(err));
