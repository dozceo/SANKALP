
import { generateQuiz } from '../src/ai/flows/adaptive-quiz-engine';

async function main() {
  try {
    console.log("Attempting to generate quiz...");
    const quiz = await generateQuiz({
      topic: 'History of Science',
      numQuestions: 2,
      educationLevel: 'High School',
      difficulty: 'Medium'
    });
    console.log("Quiz generated successfully:", JSON.stringify(quiz, null, 2));
  } catch (error) {
    console.error("Error generating quiz:", error);
  }
}

main();
