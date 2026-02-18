
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_OUTPUT_PATH = path.join(__dirname, '../src/data/mock_quiz_generations.json');

// --- TYPES ---

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

// --- DATA ---

const MOCK_QUIZZES: QuizGeneration[] = [
    // Original Student 1
    {
    "studentId": "student1",
    "topic": "Basic Math",
    "difficulty": "Easy",
    "educationLevel": "Elementary",
    "numQuestions": 3,
    "questions": [
      {
        "question": "If John has 5 apples and Mary takes 2, how many does John have left?",
        "options": ["1", "2", "3", "4"],
        "correctAnswer": "3"
      },
      {
        "question": "Sarah buys 3 packs of gum for $1 each. How much did she spend?",
        "options": ["$1", "$2", "$3", "$4"],
        "correctAnswer": "$3"
      },
      {
        "question": "Tom runs 2 miles on Monday and 3 miles on Tuesday. Total miles?",
        "options": ["4", "5", "6", "7"],
        "correctAnswer": "5"
      }
    ],
    "generatedAt": "2023-10-26T10:00:00Z"
  },
  // Original Student 2
  {
    "studentId": "student2",
    "topic": "World History",
    "difficulty": "Medium",
    "educationLevel": "High School",
    "numQuestions": 3,
    "questions": [
      {
        "question": "Who discovered America in 1492?",
        "options": ["Christopher Columbus", "Leif Erikson", "Amerigo Vespucci", "Vasco da Gama"],
        "correctAnswer": "Christopher Columbus"
      },
      {
        "question": "Which US President signed the Emancipation Proclamation?",
        "options": ["George Washington", "Abraham Lincoln", "Thomas Jefferson", "Franklin D. Roosevelt"],
        "correctAnswer": "Abraham Lincoln"
      },
      {
        "question": "What was the capital of the Roman Empire?",
        "options": ["Athens", "Rome", "Cairo", "Paris"],
        "correctAnswer": "Rome"
      }
    ],
    "generatedAt": "2023-10-26T11:00:00Z"
  },
  // Original Student 3
  {
    "studentId": "student3",
    "topic": "Science",
    "difficulty": "Hard",
    "educationLevel": "University",
    "numQuestions": 3,
    "questions": [
      {
        "question": "Who is considered the father of modern physics?",
        "options": ["Isaac Newton", "Albert Einstein", "Niels Bohr", "Max Planck"],
        "correctAnswer": "Albert Einstein"
      },
      {
        "question": "Which scientist won two Nobel Prizes in different fields?",
        "options": ["Marie Curie", "Linus Pauling", "Albert Einstein", "Richard Feynman"],
        "correctAnswer": "Marie Curie"
      },
      {
        "question": "What is the powerhouse of the cell?",
        "options": ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
        "correctAnswer": "Mitochondria"
      }
    ],
    "generatedAt": "2023-10-26T12:00:00Z"
  },
  // Original Student 4
  {
    "studentId": "student4",
    "topic": "Geography",
    "difficulty": "Medium",
    "educationLevel": "Middle School",
    "numQuestions": 3,
    "questions": [
      {
        "question": "What is the capital of Japan?",
        "options": ["Beijing", "Seoul", "Tokyo", "Bangkok"],
        "correctAnswer": "Tokyo"
      },
      {
        "question": "Which river flows through Egypt?",
        "options": ["Amazon", "Nile", "Mississippi", "Yangtze"],
        "correctAnswer": "Nile"
      },
      {
        "question": "Where is the Eiffel Tower located?",
        "options": ["London", "Berlin", "Paris", "Madrid"],
        "correctAnswer": "Paris"
      }
    ],
    "generatedAt": "2023-10-26T13:00:00Z"
  },

  // Gender Bias Example
  {
      studentId: "student_bias_1",
      topic: "Career Studies",
      difficulty: "Medium",
      educationLevel: "High School",
      numQuestions: 3,
      questions: [
          {
              question: "A doctor is examining his patient. What should he check first?",
              options: ["Heart rate", "Blood pressure", "Temperature", "Reflexes"],
              correctAnswer: "Heart rate"
          },
          {
              question: "When a nurse enters the room, she should sanitize her hands.",
              options: ["True", "False", "Maybe", "Sometimes"],
              correctAnswer: "True"
          },
          {
              question: "The engineer designed his bridge to withstand strong winds.",
              options: ["True", "False", "Maybe", "Sometimes"],
              correctAnswer: "True"
          }
      ],
      generatedAt: new Date().toISOString()
  },

  // Cultural Bias Example (Eurocentric)
  {
      studentId: "student_bias_2",
      topic: "World History",
      difficulty: "Hard",
      educationLevel: "University",
      numQuestions: 3,
      questions: [
          {
              question: "The Dark Ages refers to the period after the fall of Rome.",
              options: ["True", "False", "Maybe", "Sometimes"],
              correctAnswer: "True"
          },
          {
              question: "Christopher Columbus discovered America in 1492.",
              options: ["True", "False", "Maybe", "Sometimes"],
              correctAnswer: "True"
          },
          {
              question: "The Far East is known for its unique spices.",
              options: ["True", "False", "Maybe", "Sometimes"],
              correctAnswer: "True"
          }
      ],
      generatedAt: new Date().toISOString()
  },

  // Diverse Names Example (Good practice)
  {
      studentId: "student_diverse_1",
      topic: "Social Studies",
      difficulty: "Easy",
      educationLevel: "Middle School",
      numQuestions: 3,
      questions: [
          {
              question: "Priya and Wei are working on a project. Priya does half. How much is left?",
              options: ["None", "Half", "All", "Quarter"],
              correctAnswer: "Half"
          },
          {
              question: "Fatima travels from Cairo to Dubai. What continent is she in?",
              options: ["Asia", "Africa", "Europe", "Australia"],
              correctAnswer: "Africa/Asia"
          },
           {
              question: "Hiro helps his community by recycling.",
              options: ["True", "False", "Maybe", "Sometimes"],
              correctAnswer: "True"
          }
      ],
      generatedAt: new Date().toISOString()
  }
];

// --- MAIN EXECUTION ---

/**
 * Main function to generate mock data.
 * Can be configured via CLI arguments in a real production environment.
 */
function generateMockData() {
    const outputPath = process.argv[2] || DEFAULT_OUTPUT_PATH;

    try {
        console.log(`[INFO] Generating mock quiz data...`);

        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            console.log(`[INFO] Creating directory: ${dir}`);
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(MOCK_QUIZZES, null, 2));
        console.log(`[SUCCESS] Successfully generated ${MOCK_QUIZZES.length} mock quizzes to ${outputPath}`);
    } catch (error: any) {
        console.error(`[ERROR] Failed to generate mock data: ${error.message}`);
        process.exit(1);
    }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    generateMockData();
} else {
    // Also run if executed via tsx directly on the file
    generateMockData();
}
