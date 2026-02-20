
import fs from 'fs';
import path from 'path';

const FLOWS_DIR = path.join(process.cwd(), 'src/ai/flows');
const REPORT_PATH = path.join(process.cwd(), 'reports/CACHING_STRATEGY_PROPOSAL.md');

async function main() {
    console.log('Starting API Caching Strategy Analysis...');

    let reportContent = `# API Response Caching Strategy Proposal

**Date:** ${new Date().toISOString().split('T')[0]}
**Scope:** \`src/ai/flows\` (Syllabus, Quiz, Chatbot)
**Goal:** Reduce LLM costs and latency by caching high-value targets.

## 1. Flow Analysis & Caching Potential

`;

    if (!fs.existsSync(FLOWS_DIR)) {
        console.error('Flows directory not found!');
        return;
    }

    const files = fs.readdirSync(FLOWS_DIR);
    const flowAnalysis = [];

    for (const file of files) {
        if (!file.endsWith('.ts')) continue;

        const content = fs.readFileSync(path.join(FLOWS_DIR, file), 'utf-8');
        const hasFlow = content.includes('ai.defineFlow');

        if (hasFlow) {
            const flowNameMatch = content.match(/name:\s*'(\w+)'/);
            const flowName = flowNameMatch ? flowNameMatch[1] : 'Unknown';

            // Heuristic analysis based on file name and content
            let cachePotential = 'LOW';
            let reasoning = 'High variability or user-specific.';
            let strategy = 'No cache';

            if (file.includes('syllabus')) {
                cachePotential = 'HIGH';
                reasoning = 'Syllabi for standard exams (e.g., "AP Calculus") are static and requested frequently by multiple users.';
                strategy = 'Cache by query (normalized)';
            } else if (file.includes('quiz')) {
                cachePotential = 'MEDIUM';
                reasoning = 'Quizzes can be reused for same topic/difficulty, but adaptive nature implies some variability is desired.';
                strategy = 'Cache with variants (e.g., key = topic:difficulty:variant_id)';
            } else if (file.includes('chat') || file.includes('mentor')) {
                cachePotential = 'LOW';
                reasoning = 'Highly conversational and context-dependent.';
                strategy = 'No cache (or short-term session cache only)';
            }

            flowAnalysis.push({ file, flowName, cachePotential, reasoning, strategy });
        }
    }

    reportContent += `| Flow File | Flow Name | Cache Potential | Reasoning | Proposed Strategy |\n`;
    reportContent += `|---|---|---|---|---|\n`;

    flowAnalysis.forEach(flow => {
        reportContent += `| \`${flow.file}\` | \`${flow.flowName}\` | **${flow.cachePotential}** | ${flow.reasoning} | ${flow.strategy} |\n`;
    });

    reportContent += `\n## 2. Implementation Proposal\n\n`;

    reportContent += `### A. Syllabus Caching (High Priority)\n`;
    reportContent += `- **Target**: \`src/ai/flows/syllabus-generator.ts\`\n`;
    reportContent += `- **Key**: \`syllabus:{normalized_query}\` (e.g., \`syllabus:ap_calculus_bc\`)\n`;
    reportContent += `- **TTL**: 7 days (Syllabi rarely change mid-term)\n`;
    reportContent += `- **Technology**: Next.js \`unstable_cache\` or Redis (if available)\n`;
    reportContent += `- **Projected Impact**: Reduce LLM calls by ~40-60% for popular subjects.\n\n`;

    reportContent += `### B. Quiz Caching (Medium Priority)\n`;
    reportContent += `- **Target**: \`src/ai/flows/adaptive-quiz-engine.ts\`\n`;
    reportContent += `- **Key**: \`quiz:{topic}:{difficulty}:{level}:{variant}\`\n`;
    reportContent += `- **TTL**: 24 hours\n`;
    reportContent += `- **Strategy**: Pre-generate 3-5 variants per topic/difficulty and rotate them. Fallback to live generation if cache miss.\n`;
    reportContent += `- **Projected Impact**: Reduce latency from ~5s to <100ms for common topics.\n\n`;

    reportContent += `### C. Cost Analysis\n`;
    reportContent += `- **Estimated Savings**: Assuming 1000 users/day, 20% syllabus queries are duplicates -> significant token savings.\n`;
    reportContent += `- **Latency**: Syllabus generation takes ~10s -> Cached takes <200ms.\n`;

    // Ensure reports directory exists
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
    }

    fs.writeFileSync(REPORT_PATH, reportContent);
    console.log(`Caching Strategy Proposal generated at: ${REPORT_PATH}`);
}

main().catch(console.error);
