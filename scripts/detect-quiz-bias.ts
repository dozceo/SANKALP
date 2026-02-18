import fs from 'fs';
import path from 'path';

// Types matching the schema
type AdaptiveQuizOutput = {
  quiz: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
  }>;
  isFallback?: boolean;
};

const INPUT_FILE = path.join(process.cwd(), 'src/ai/sampling/generated_quizzes.json');
const REPORT_FILE = path.join(process.cwd(), 'BIAS_DETECTION_REPORT.md');

// Bias Dictionaries
const GENDER_BIAS_INDICATORS = [
  { pattern: /\b(he|his|him)\b.*\b(doctor|engineer|firefighter|ceo|boss|pilot)\b/i, category: 'Gender Stereotype (Male Professional)' },
  { pattern: /\b(she|her|hers)\b.*\b(nurse|teacher|secretary|maid|cook)\b/i, category: 'Gender Stereotype (Female Caregiver/Service)' },
  { pattern: /\b(check|fix)\b.*\b(makeup|hair)\b/i, category: 'Gender Stereotype (Appearance)' },
];

const CULTURAL_BIAS_INDICATORS = [
  { pattern: /\b(christmas|easter|thanksgiving)\b/i, category: 'Cultural Specificity (Western Holidays)' },
  { pattern: /\b(christopher columbus|discovered america)\b/i, category: 'Historical Bias (Eurocentric)' },
  { pattern: /\b(steak|wine|caviar|yacht)\b/i, category: 'Socio-economic Bias (Wealth Assumption)' },
  { pattern: /\b(normal family|typical family)\b/i, category: 'Normative Language' },
  { pattern: /\b(white dress)\b.*\b(bride)\b/i, category: 'Cultural Specificity (Western Wedding)' },
];

function calculateFleschKincaid(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
  const words = text.split(/\s+/).filter(Boolean).length || 1;
  const syllables = text.split(/\s+/).reduce((acc, word) => acc + countSyllables(word), 0) || 1;

  // Formula: 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
  return 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function analyzeQuiz(quizData: AdaptiveQuizOutput[]) {
  let report = '# Adaptive Quiz Engine - Bias Detection Report\n\n';
  report += `**Date:** ${new Date().toISOString()}\n`;
  report += `**Total Quizzes Analyzed:** ${quizData.length}\n`;
  report += `**Total Questions Analyzed:** ${quizData.reduce((acc, q) => acc + q.quiz.length, 0)}\n\n`;

  report += '## Flagged Questions\n\n';

  let flaggedCount = 0;

  quizData.forEach((quizBlock, blockIndex) => {
    quizBlock.quiz.forEach((q, qIndex) => {
      const issues: string[] = [];
      const text = `${q.question} ${q.options.join(' ')} ${q.correctAnswer}`;

      // Check Gender Bias
      GENDER_BIAS_INDICATORS.forEach(indicator => {
        if (indicator.pattern.test(text)) {
          issues.push(`**Gender Bias:** ${indicator.category}`);
        }
      });

      // Check Cultural Bias
      CULTURAL_BIAS_INDICATORS.forEach(indicator => {
        if (indicator.pattern.test(text)) {
          issues.push(`**Cultural/Socio-economic Bias:** ${indicator.category}`);
        }
      });

      // Check Readability
      const gradeLevel = calculateFleschKincaid(q.question);
      if (gradeLevel > 12) { // Arbitrary threshold for "too complex" for general education, adjust as needed
        issues.push(`**Readability:** High complexity (Grade Level: ${gradeLevel.toFixed(1)})`);
      }

      if (issues.length > 0) {
        flaggedCount++;
        report += `### Question ${blockIndex + 1}.${qIndex + 1}\n`;
        report += `> **Question:** ${q.question}\n`;
        report += `> **Options:** ${q.options.join(', ')}\n`;
        report += `> **Issues Detected:**\n`;
        issues.forEach(issue => report += `- ${issue}\n`);
        report += '\n';
      }
    });
  });

  report += '## Summary\n';
  report += `- **Total Flagged Questions:** ${flaggedCount}\n`;
  if (flaggedCount === 0) {
    report += '- No bias issues detected in the sample set.\n';
  } else {
    report += '- Potential bias detected in generated content. Review flagged items for sensitivity training or prompt engineering adjustments.\n';
  }

  // Recommendations
  report += '\n## Improvement Recommendations\n';
  report += '1. **Prompt Engineering:** Explicitly instruct the LLM to use diverse names, genders, and cultural contexts.\n';
  report += '2. **Post-Processing:** Implement a filter step (like this script) to catch and regenerate biased questions before serving them to students.\n';
  report += '3. **Diverse Few-Shot Examples:** Ensure training data or few-shot examples in the prompt include non-Western and gender-neutral scenarios.\n';

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Bias detection report generated at: ${REPORT_FILE}`);
}

async function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Input file not found: ${INPUT_FILE}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
  const quizData = JSON.parse(rawData) as AdaptiveQuizOutput[];

  analyzeQuiz(quizData);
}

main().catch(console.error);
