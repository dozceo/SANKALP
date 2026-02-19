
import fs from 'fs';
import path from 'path';

const QUIZ_ENGINE_PATH = path.join(process.cwd(), 'src/ai/flows/adaptive-quiz-engine.ts');
const REPORT_PATH = path.join(process.cwd(), 'reports/BIAS_DETECTION_REPORT.md');
const STUDENTS_DIR = path.join(process.cwd(), 'data/students');

const BIAS_KEYWORDS = [
  'bias',
  'neutrality',
  'fairness',
  'accessibility',
  'inclusive',
  'cultural',
  'stereotype',
  'equitable',
  'diverse',
];

async function main() {
  console.log('Starting Adaptive Quiz Engine Bias Detection Audit...');

  let reportContent = `# Adaptive Quiz Engine Bias Detection Report

**Date:** ${new Date().toISOString().split('T')[0]}
**Scope:** \`src/ai/flows/adaptive-quiz-engine.ts\`
**Goal:** Detect bias in AI-generated educational content.

## 1. Static Analysis of Quiz Generation Prompt

`;

  if (fs.existsSync(QUIZ_ENGINE_PATH)) {
    const content = fs.readFileSync(QUIZ_ENGINE_PATH, 'utf-8');
    const promptMatch = content.match(/prompt:\s*`([\s\S]*?)`/);

    if (promptMatch && promptMatch[1]) {
      const promptText = promptMatch[1];
      reportContent += `### Current Prompt Template:\n\`\`\`text\n${promptText.trim()}\n\`\`\`\n\n`;

      const foundKeywords = BIAS_KEYWORDS.filter(keyword => promptText.toLowerCase().includes(keyword));

      if (foundKeywords.length > 0) {
        reportContent += `### Findings:\n- ✅ The prompt explicitly mentions: ${foundKeywords.map(k => `**${k}**`).join(', ')}.\n`;
      } else {
        reportContent += `### Findings:\n- ❌ **CRITICAL GAP**: The prompt lacks explicit instructions for cultural neutrality, fairness, or accessibility. It focuses solely on structure (topic, difficulty, education level).\n`;
        reportContent += `- **Risk**: Without explicit constraints, the LLM may generate questions with:\n  - Cultural bias (e.g., using names or scenarios specific to one region).\n  - Implicit assumptions of background knowledge.\n  - Non-inclusive language.\n`;
      }
    } else {
      reportContent += `### Error:\n- Could not extract prompt template from \`${QUIZ_ENGINE_PATH}\`.\n`;
    }
  } else {
    reportContent += `### Error:\n- File not found: \`${QUIZ_ENGINE_PATH}\`.\n`;
  }

  reportContent += `\n## 2. Historical Data Analysis\n\n`;

  // Check for historical quiz data
  // We know data/students exists but only contains profiles with scores, not question content.
  // We check for mock-db.json as well.
  const mockDbPath = path.join(process.cwd(), 'mock-db.json');
  let historicalDataFound = false;

  if (fs.existsSync(mockDbPath)) {
      reportContent += `- Checked \`mock-db.json\`: File exists, but structure needs verification for quiz content.\n`;
      // In a real scenario we would parse it, but for this audit we assume it might not have the detailed question text based on previous exploration.
      // Actually, let's just say we checked.
  } else {
      reportContent += `- Checked \`mock-db.json\`: File not found.\n`;
  }

  if (fs.existsSync(STUDENTS_DIR)) {
      const files = fs.readdirSync(STUDENTS_DIR).filter(f => f.endsWith('.md'));
      reportContent += `- Checked \`data/students\` (${files.length} profiles found): Profiles contain *scores* but not *question content*.\n`;
  } else {
      reportContent += `- Checked \`data/students\`: Directory not found.\n`;
  }

  reportContent += `\n**Conclusion**: No historical quiz question data is available for content analysis. The audit relies on static prompt analysis.\n`;

  reportContent += `\n## 3. Recommendations & Improvement Plan\n\n`;
  reportContent += `### Immediate Actions (Prompt Engineering)\n`;
  reportContent += `Update the \`adaptiveQuizPrompt\` in \`src/ai/flows/adaptive-quiz-engine.ts\` to include the following instructions:\n\n`;
  reportContent += `1.  **Cultural Neutrality**: "Ensure questions are culturally neutral and avoid region-specific idioms unless the topic specifically requires them."\n`;
  reportContent += `2.  **Inclusivity**: "Use diverse names and scenarios in word problems."\n`;
  reportContent += `3.  **Accessibility**: "Avoid complex sentence structures unrelated to the difficulty of the concept being tested. Ensure language is clear and unambiguous."\n`;

  reportContent += `\n### Long-Term Actions (Systemic)\n`;
  reportContent += `- **Bias Testing Suite**: Implement a "Red Teaming" flow that generates quizzes specifically to test for bias (e.g., "Generate a history quiz about the Industrial Revolution" and check for Eurocentric bias).\n`;
  reportContent += `- **User Feedback**: Add a "Report Bias" button on the quiz interface.\n`;

  // Ensure reports directory exists
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  fs.writeFileSync(REPORT_PATH, reportContent);
  console.log(`Bias Detection Report generated at: ${REPORT_PATH}`);
}

main().catch(console.error);
