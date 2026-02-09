import { AdaptiveQuizOutput } from "@/ai/flows/adaptive-quiz-engine";

/**
 * Provides a high-quality fallback quiz when AI generation fails.
 * Designed to be deterministic and zero-dependency.
 */
export function getFallbackQuiz(topic: string, numQuestions: number = 3): AdaptiveQuizOutput {
  console.log(`[QuizFallback] Serving fallback quiz for topic: ${topic}`);

  // Base question bank for various common topics
  const questionBank: Record<string, any[]> = {
    "Algebra": [
      {
        question: "What is the value of x in the equation 2x + 5 = 13?",
        options: ["3", "4", "5", "6"],
        correctAnswer: "4"
      },
      {
        question: "Which of the following is a quadratic equation?",
        options: ["y = mx + b", "x^2 + 5x + 6 = 0", "A = πr^2", "V = lwh"],
        correctAnswer: "x^2 + 5x + 6 = 0"
      },
      {
        question: "What is the slope of the line represented by y = 3x - 7?",
        options: ["-7", "3", "3x", "0"],
        correctAnswer: "3"
      }
    ],
    "Biology": [
      {
        question: "Which organelle is known as the powerhouse of the cell?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
        correctAnswer: "Mitochondria"
      },
      {
        question: "What is the process by which plants make their own food?",
        options: ["Respiration", "Photosynthesis", "Fermentation", "Transpiration"],
        correctAnswer: "Photosynthesis"
      },
      {
        question: "Which molecule carries genetic information?",
        options: ["ATP", "DNA", "Glucose", "Hemoglobin"],
        correctAnswer: "DNA"
      }
    ],
    "History": [
      {
        question: "Who was the first President of the United States?",
        options: ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"],
        correctAnswer: "George Washington"
      },
      {
        question: "In which year did World War II end?",
        options: ["1918", "1941", "1945", "1950"],
        correctAnswer: "1945"
      },
      {
        question: "Which ancient civilization built the Great Pyramids of Giza?",
        options: ["Romans", "Greeks", "Egyptians", "Mayans"],
        correctAnswer: "Egyptians"
      }
    ]
  };

  // Default questions if topic is not found
  const defaultQuestions = [
    {
      question: `What is the most important thing to remember about ${topic}?`,
      options: ["Consistency is key", "Details matter", "Always keep learning", "Practice makes perfect"],
      correctAnswer: "Always keep learning"
    },
    {
      question: `Which approach is best when studying ${topic}?`,
      options: ["Active recall", "Passive reading", "Cramming", "Multitasking"],
      correctAnswer: "Active recall"
    },
    {
      question: "What is the primary goal of the Sankalp platform?",
      options: ["Entertainment", "Empowering education", "Social networking", "Gaming"],
      correctAnswer: "Empowering education"
    }
  ];

  // Try to find matching questions or use defaults
  let selectedQuestions = [];
  const normalizedTopic = Object.keys(questionBank).find(
    k => topic.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(topic.toLowerCase())
  );

  if (normalizedTopic) {
    selectedQuestions = [...questionBank[normalizedTopic]];
  } else {
    selectedQuestions = [...defaultQuestions];
  }

  // Slice to requested number of questions
  return {
    quiz: selectedQuestions.slice(0, numQuestions),
    isFallback: true
  };
}
