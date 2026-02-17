
import fs from 'fs';
import path from 'path';

// Types
interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizGeneration {
  studentId: string;
  topic: string;
  difficulty: string;
  educationLevel: string;
  numQuestions: number;
  questions: Question[];
  generatedAt: string;
}

interface BiasReport {
  totalQuizzes: number;
  totalQuestions: number;
  genderBias: {
    malePronouns: number;
    femalePronouns: number;
    ratio: string;
  };
  culturalBias: {
    westernNames: number;
    nonWesternNames: number;
    westernLocations: number;
    nonWesternLocations: number;
  };
  readingLevel: {
    averageGradeLevel: number;
    minGradeLevel: number;
    maxGradeLevel: number;
  };
  flaggedQuestions: {
    question: string;
    reason: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
}

// Constants for detection
const MALE_PRONOUNS = /\b(he|him|his|himself)\b/gi;
const FEMALE_PRONOUNS = /\b(she|her|hers|herself)\b/gi;

const WESTERN_NAMES = ['John', 'Mary', 'Tom', 'Sarah', 'James', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Donald', 'Mark', 'Paul', 'Steven', 'Andrew', 'Kenneth', 'Joshua', 'Kevin', 'Brian', 'George', 'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Frank', 'Gregory', 'Raymond', 'Alexander', 'Patrick', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose', 'Adam', 'Henry', 'Nathan', 'Douglas', 'Zachary', 'Peter', 'Kyle', 'Walter', 'Ethan', 'Jeremy', 'Harold', 'Keith', 'Christian', 'Roger', 'Noah', 'Gerald', 'Carl', 'Terry', 'Sean', 'Austin', 'Arthur', 'Lawrence', 'Jesse', 'Dylan', 'Bryan', 'Joe', 'Jordan', 'Billy', 'Bruce', 'Albert', 'Willie', 'Gabriel', 'Logan', 'Alan', 'Juan', 'Wayne', 'Roy', 'Ralph', 'Randy', 'Eugene', 'Vincent', 'Russell', 'Louis', 'Philip', 'Bobby', 'Johnny', 'Bradley'];
const NON_WESTERN_NAMES = ['Wei', 'Arjun', 'Priya', 'Hiro', 'Fatima', 'Muhammad', 'Chen', 'Li', 'Santiago', 'Mateo', 'Aarav', 'Vihaan', 'Aditya', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Advaith', 'Aaryansh', 'Dhruv', 'Kabir', 'Rian', 'Vivaan', 'Rudransh', 'Ansh', 'Aaryan', 'Ayush', 'Sarthak', 'Tanmay', 'Vedant', 'Shreyas', 'Dhruv', 'Rohan', 'Rahul', 'Amit', 'Suresh', 'Ramesh', 'Sanjay', 'Manoj', 'Vijay', 'Anil', 'Sunil', 'Rajesh', 'Rakesh', 'Ajay'];

const WESTERN_LOCATIONS = ['New York', 'London', 'Paris', 'Berlin', 'Rome', 'Madrid', 'Chicago', 'Los Angeles', 'Toronto', 'Sydney', 'Melbourne', 'Europe', 'America', 'USA', 'UK', 'France', 'Germany', 'Italy', 'Spain'];
const NON_WESTERN_LOCATIONS = ['Beijing', 'Tokyo', 'Mumbai', 'Delhi', 'Cairo', 'Lagos', 'Nairobi', 'Shanghai', 'Seoul', 'Bangkok', 'Jakarta', 'Istanbul', 'Tehran', 'Baghdad', 'Riyadh', 'Dubai', 'Karachi', 'Dhaka', 'Manila', 'Hanoi', 'Asia', 'Africa', 'South America'];

const EUROCENTRIC_PHRASES = [
  { phrase: 'discovered America', reason: 'Eurocentric perspective (ignores indigenous population)' },
  { phrase: 'Father of', reason: 'Gendered language / Great Man theory bias' },
  { phrase: 'Dark Ages', reason: 'Eurocentric historical periodization' },
  { phrase: 'Far East', reason: 'Eurocentric geographical term' },
  { phrase: 'Middle East', reason: 'Eurocentric geographical term' }
];

// Helper functions
function countMatches(text: string, regex: RegExp): number {
  return (text.match(regex) || []).length;
}

function countOccurrences(text: string, list: string[]): number {
  const lowerText = text.toLowerCase();
  let count = 0;
  list.forEach(item => {
    if (lowerText.includes(item.toLowerCase())) count++;
  });
  return count;
}

// Simple Flesch-Kincaid Grade Level implementation
function calculateGradeLevel(text: string): number {
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length - 1 || 1;
  const syllables = countSyllables(text);

  if (words === 0 || sentences === 0) return 0;

  return 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
}

function countSyllables(text: string): number {
  text = text.toLowerCase().replace(/[^a-z]/g, '');
  if (text.length <= 3) return 1;
  return text.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '')
    .match(/[aeiouy]{1,2}/g)?.length || 1;
}

// Main analysis logic
async function analyzeBias() {
  const mockDataPath = path.join(process.cwd(), 'src/data/mock_quiz_generations.json');

  if (!fs.existsSync(mockDataPath)) {
    console.error('Mock data file not found:', mockDataPath);
    process.exit(1);
  }

  const rawData = fs.readFileSync(mockDataPath, 'utf-8');
  const quizGenerations: QuizGeneration[] = JSON.parse(rawData);

  const report: BiasReport = {
    totalQuizzes: quizGenerations.length,
    totalQuestions: 0,
    genderBias: { malePronouns: 0, femalePronouns: 0, ratio: '0:0' },
    culturalBias: { westernNames: 0, nonWesternNames: 0, westernLocations: 0, nonWesternLocations: 0 },
    readingLevel: { averageGradeLevel: 0, minGradeLevel: 100, maxGradeLevel: 0 },
    flaggedQuestions: []
  };

  let totalGradeLevel = 0;

  quizGenerations.forEach(quiz => {
    quiz.questions.forEach(q => {
      report.totalQuestions++;
      const text = `${q.question} ${q.options.join(' ')}`;

      // Gender Bias
      report.genderBias.malePronouns += countMatches(text, MALE_PRONOUNS);
      report.genderBias.femalePronouns += countMatches(text, FEMALE_PRONOUNS);

      // Cultural Bias
      report.culturalBias.westernNames += countOccurrences(text, WESTERN_NAMES);
      report.culturalBias.nonWesternNames += countOccurrences(text, NON_WESTERN_NAMES);
      report.culturalBias.westernLocations += countOccurrences(text, WESTERN_LOCATIONS);
      report.culturalBias.nonWesternLocations += countOccurrences(text, NON_WESTERN_LOCATIONS);

      // Reading Level
      const gradeLevel = calculateGradeLevel(q.question);
      totalGradeLevel += gradeLevel;
      if (gradeLevel < report.readingLevel.minGradeLevel) report.readingLevel.minGradeLevel = gradeLevel;
      if (gradeLevel > report.readingLevel.maxGradeLevel) report.readingLevel.maxGradeLevel = gradeLevel;

      // Flagging
      EUROCENTRIC_PHRASES.forEach(check => {
        if (text.includes(check.phrase)) {
          report.flaggedQuestions.push({
            question: q.question,
            reason: check.reason,
            severity: 'MEDIUM'
          });
        }
      });

      // Flag heavily gendered questions if disparity is high within the question
      const m = countMatches(text, MALE_PRONOUNS);
      const f = countMatches(text, FEMALE_PRONOUNS);
      if (m > 2 && f === 0) {
        report.flaggedQuestions.push({ question: q.question, reason: 'Heavily male-gendered language', severity: 'LOW' });
      }
    });
  });

  if (report.totalQuestions > 0) {
    report.readingLevel.averageGradeLevel = totalGradeLevel / report.totalQuestions;
    report.genderBias.ratio = `${report.genderBias.malePronouns}:${report.genderBias.femalePronouns}`;
  }

  // Generate Markdown Report
  const markdown = `
# Adaptive Quiz Engine Bias Detection Report

**Domain:** ML System
**Scope:** Quiz generation logic
**Date:** ${new Date().toISOString()}

## Summary
- **Total Quizzes Analyzed:** ${report.totalQuizzes}
- **Total Questions Analyzed:** ${report.totalQuestions}

## Bias Metrics

### Gender Bias
- **Male Pronouns:** ${report.genderBias.malePronouns}
- **Female Pronouns:** ${report.genderBias.femalePronouns}
- **Ratio (M:F):** ${report.genderBias.ratio}
> *Interpretation:* A significant imbalance suggests the model may default to one gender in examples.

### Cultural Bias
- **Western Names:** ${report.culturalBias.westernNames}
- **Non-Western Names:** ${report.culturalBias.nonWesternNames}
- **Western Locations:** ${report.culturalBias.westernLocations}
- **Non-Western Locations:** ${report.culturalBias.nonWesternLocations}
> *Interpretation:* High counts of Western names/locations vs Non-Western indicates a cultural bias in the training data or prompt.

### Accessibility (Reading Level)
- **Average Flesch-Kincaid Grade Level:** ${report.readingLevel.averageGradeLevel.toFixed(2)}
- **Min Grade Level:** ${report.readingLevel.minGradeLevel.toFixed(2)}
- **Max Grade Level:** ${report.readingLevel.maxGradeLevel.toFixed(2)}

## Flagged Questions

| Question | Reason | Severity |
| :--- | :--- | :--- |
${report.flaggedQuestions.map(f => `| "${f.question}" | ${f.reason} | **${f.severity}** |`).join('\n')}

## Recommendations
1. **Prompt Engineering:** Update system prompts to explicitly request diverse names (e.g., "Use names from various cultures like Wei, Priya, Fatima").
2. **Post-Processing:** Implement a "critic" layer to reject questions with known Eurocentric phrases.
3. **Accessibility:** Monitor grade level to ensure it matches the target \`educationLevel\`.
`;

  fs.writeFileSync('BIAS_DETECTION_REPORT.md', markdown);
  console.log('Bias detection report generated: BIAS_DETECTION_REPORT.md');
}

analyzeBias().catch(console.error);
