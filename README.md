# Sankalp (CognitoLearn) - Intelligent Learning Platform 🎓

## Project Overview

**Sankalp** (internally "CognitoLearn") is an **ML-driven** educational platform that combines machine learning predictions with generative AI to personalize the learning experience. Unlike traditional LLM-only approaches, Sankalp uses trained ML models to make data-driven decisions about what to teach, when to revise, and where students need help — then leverages LLMs to generate engaging explanations.

**Key Architecture:**  
`User → Quiz → Feature Extraction → ML Prediction → ADK Logic → LLM Content`

> **Status:** Functional Prototype with ML System  
> This project demonstrates a production-grade ML architecture with synthetic data. Real user data integration pending.

## Key Features 🚀

-   **Brain Map Dashboard**: Visualizes the syllabus structure and progress (Concept).
-   **Smart Revision Planner**: An AI-driven agent (`smart-revision-planner`) that generates personalized study schedules.
-   **Syllabus Generator**: Instantly retrieves and structures official syllabi for various exams (e.g., AP Calculus, NEET) with reference links and strategy guides.
-   **Cramming Helper**: A time-sensitive tool that activates 3 days before an exam to provide high-yield focus topics and quick tips.
-   **Adaptive Quiz Engine**: Generates quiz questions on the fly based on the user's weak areas (demonstrated in `adaptive-quiz-engine.ts`).
-   **Cognitive Chatbot**: An AI tutor available to answer varied queries and explain complex topics.

## Tech Stack 🛠️

### Frontend
-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
-   **Language**: TypeScript
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with `clsx` and `tailwind-merge`
-   **UI Library**: [Radix UI](https://www.radix-ui.com/) (accessible primitives) via `shadcn/ui` patterns
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Forms**: `react-hook-form` + `zod` validation

### Backend / AI
-   **AI Framework**: [Genkit](https://firebase.google.com/docs/genkit) (Google's AI SDK)
-   **Model Integration**: Google Generative AI (Gemini)
-   **Database/Auth**: [Firebase](https://firebase.google.com/) (configured dependencies)

### ML System
-   **Training**: Python 3.8+, scikit-learn (Logistic Regression for Topic Mastery)
-   **Inference**: Python scripts executed via Node.js subprocess
-   **Feature Engineering**: TypeScript (extracts quiz patterns into ML features)
-   **Production Path**: FastAPI microservice (documented for future deployment)

## Project Structure 📂

```
SANKALP/
├── src/
│   ├── ai/                 # AI backend logic
│   │   ├── flows/          # Genkit flows (Syllabus, Quiz, Chatbot)
│   │   ├── genkit.ts       # Genkit configuration
│   │   └── dev.ts          # Genkit dev server entry
│   ├── ml/                 # ML System (NEW)
│   │   ├── features/       # Feature engineering (TypeScript)
│   │   ├── training/       # Model training scripts (Python)
│   │   ├── inference/      # Prediction layer (Python + TS bridge)
│   │   ├── models/         # Trained .pkl models
│   │   └── README.md       # ML architecture documentation
│   ├── app/                # Next.js App Router (Frontend)
│   │   ├── (auth)/         # Authentication routes (Login/Signup)
│   │   ├── (main)/         # Main dashboard routes (Home, Syllabus, Quiz)
│   │   └── globals.css     # Global styles & Tailwind directives
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Radix/Shadcn primitives (Buttons, Cards, Inputs)
│   │   └── ...             # Feature-specific components
│   └── lib/                # Shared utilities
├── docs/                   # Documentation & Blueprints
├── env.txt                 # (WARNING) Contains secrets - move to .env
├── package.json            # Dependencies & Scripts
└── next.config.ts          # Next.js configuration
```

## How the Code Works 🧠

### 1. Syllabus Generator (`src/ai/flows/syllabus-generator.ts`)
This is a standard **Genkit Flow**. It defines an input schema (the exam name) and an output schema (title, structure, strategy, references) using `zod`.
-   **Prompt**: It constructs a structured prompt for the LLM to act as an "Academic Advisor".
-   **Flow**: The `syllabusGeneratorFlow` wraps the prompt call, ensuring the output matches the strict JSON schema required by the UI.

### 2. Syllabus Page (`src/app/(main)/syllabus/page.tsx`)
This is a **Client Component** that interacts with the AI backend.
-   **Search**: When a user enters a query, it calls `getSyllabus` (Simulated Server Action or API wrapper).
-   **State Management**: Uses `useState` to handle loading, error, and success states.
-   **Tabs**: Switches between the "Syllabus" view and the "Cramming Helper" (which conditionally activates based on a simulated exam date).

### 3. AI <-> UI Bridge
The project uses Next.js **Server Actions** (implied in `actions.ts`) to call Genkit flows directly from the React client. This removes the need for a separate API layer for simple operations.

## Setup & Installation ⚙️

### 1. Clone and Install Dependencies
```bash
git clone <repository_url>
cd SANKALP
npm install
```

### 2. Python ML Setup
```bash
cd src/ml/training
pip install -r requirements.txt
```

### 3. Train the ML Model
```bash
# Generate synthetic training data
python generate_data.py

# Train Topic Mastery model
python train_mastery_model.py
```
This creates `src/ml/models/mastery_model.pk`l with ~75-85% accuracy.

### 4. Environment Configuration
Create `.env.local` in the root:
```env
GEMINI_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_FIREBASE_API_KEY=...
```
⚠️ **Do not use `env.txt` in production!**

### 5. Run Development Server
```bash
npm run dev  # Access at http://localhost:3000
```

### 6. (Optional) Test AI Flows
```bash
npm run genkit:dev
```

## Converting to Production 🚧

This project is currently a functional prototype. To make it production-ready, specific steps are needed:

### 1. Security (CRITICAL) 🔐
-   **Remove `env.txt`**: This file contains a raw API key. Immediately rotate the key and use `.env.local` which is git-ignored.
-   **Authentication**: Fully implement the routes in `(auth)`. Ensure AI endpoints are protected and only accessible to logged-in users.

### 2. Code Quality & Testing
-   **Error Handling**: Replace generic "An unexpected error occurred" messages with specific error codes (e.g., quota exceeded, network timeout).
-   **Unit Tests**: Add tests for the Genkit flows (using mocks for the LLM) and React components.
-   **Type Safety**: Ensure `any` types are minimized and strict TypeScript checks are enabled.

### 3. Infrastructure
-   **Database**: Connect the mock data providers to a real Firestore/Postgres database to persist user progress and generated syllabi.
-   **Caching**: Implement caching (Redis or Next.js Cache) for common syllabus queries to save on API costs and reduce latency.

### 4. Documentation
-   Expand functionality documentation for the "Mindful Mentor" and "Teacher Dashboard" which are currently skeletal.

## Limitations
-   **Mock Data**: Some dates (like the "Exam Date" in the syllabus page) are hardcoded for demonstration (`new Date() + 2 days`).
-   **Session Persistence**: Refreshing the page may lose the generated syllabus if not saved to a database.

## License
MIT License (Placeholder)
