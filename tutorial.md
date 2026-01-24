# Sankalp (CognitoLearn) Codebase Tutorial

## 1. High-Level Architecture Overview

**Sankalp** is a **Next.js** web application that acts as an intelligent educational interface. It uses a **client-server** architecture where the frontend (React) communicates with an AI backend (Google Genkit) via Next.js **Server Actions**.

### **Architecture Style: Modular Monolith**
-   **Modular**: Features (Quiz, Syllabus, Planner) are separated into distinct folders in both the frontend (`src/app/(main)/*`) and backend logic (`src/ai/flows/*`).
-   **Monolith**: The frontend UI and the backend AI logic reside in the same repository and run in the same Next.js runtime.

### **Major Systems**
1.  **Frontend (Next.js App Router)**: Handles routing, UI rendering, and user state.
2.  **Middleware (Server Actions)**: Acts as the bridge. Instead of a separate REST API, React components simply call async functions that run on the server.
3.  **AI Layer (Genkit)**: A framework by Google to structure LLM interactions. It handles prompt engineering, schema validation (Input/Output), and model communication.

---

## 2. Folder-by-Folder Breakdown

### `src/ai/` (The Brain)
-   **`flows/`**: Contains the definition of every AI feature. Each file here corresponds to a specific capability (e.g., generating a quiz, planning revision).
-   **`dev.ts`**: The entry point for the Genkit Developer UI (a local tool to test AI flows without the frontend).
-   **`genkit.ts`**: The configuration file that initializes the AI SDK and selects the model (`gemini-2.5-flash`).

### `src/app/` (The Face)
-   **`(auth)/`**: Contains pages for Sign In and Sign Up. The parentheses `()` mean this folder is a "Route Group" and doesn't add `/auth` to the URL.
-   **`(main)/`**: The authenticated part of the app. It includes the `layout.tsx` which puts the Sidebar and Header around every page in this folder.
-   **`components/`**: Reusable UI blocks (buttons, inputs) and feature-specific widgets (Sidebar, Header).

---

## 3. File-by-File & Snippet Logic

### A. AI Logic: `src/ai/flows/adaptive-quiz-engine.ts`
**Responsibility**: Defines the logic for creating a quiz.

**Snippet 1: Schema Definition**
```typescript
const AdaptiveQuizInputSchema = z.object({
  topic: z.string().describe('The topic of the quiz.'),
  numQuestions: z.number().describe('The number of questions in the quiz.'),
  // ...
});
```
-   **What it does**: Defines the strict "shape" of data the AI expects.
-   **Why**: LLMs are unpredictable. This forces the AI to understand exactly what inputs (`topic`, `numQuestions`) are available.
-   **Dependencies**: Uses `zod` for validation.

**Snippet 2: Prompt Definition**
```typescript
const adaptiveQuizPrompt = ai.definePrompt({
  name: 'adaptiveQuizPrompt',
  input: {schema: AdaptiveQuizInputSchema},
  output: {schema: AdaptiveQuizOutputSchema},
  prompt: `You are an expert quiz generator... Generate a quiz with {{numQuestions}} questions...`
});
```
-   **What it does**: This is the instruction manual for the AI. It binds the input variables (like `{{topic}}`) to the text prompt.
-   **Flow**: When this snippet runs, it constructs a text string to send to Gemini.

**Snippet 3: Flow Definition**
```typescript
export async function generateQuiz(input: AdaptiveQuizInput) {
  return adaptiveQuizFlow(input);
}
```
-   **What it does**: Exports a simple TypeScript function that the frontend can call.
-   **Connection**: This is the function imported by `actions.ts`.

---

### B. Configuration: `src/ai/genkit.ts`
**Responsibility**: Bootstrapping the AI engine.

**Snippet:**
```typescript
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
```
-   **What it does**: Initializes the Genkit instance.
-   **Why**: `gemini-2.5-flash` is chosen likely for speed and low latency, which is crucial for interactive apps like quizzes.

---

### C. Frontend Page: `src/app/(main)/quiz/page.tsx`
**Responsibility**: The user interface for taking a quiz.

**Snippet 1: Form Handling**
```typescript
const form = useForm<z.infer<typeof quizFormSchema>>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: { topic: "Algebra", numQuestions: 3 ... },
});
```
-   **What it does**: Manages the "Create Quiz" form state.
-   **Why**: It uses `react-hook-form` to prevent re-rendering the whole page on every keystroke, improving performance.

**Snippet 2: Submission & Server Call**
```typescript
const onSubmit = async (values: z.infer<typeof quizFormSchema>) => {
    setIsLoading(true);
    const result = await createQuiz(values); // <--- Server Action Call
    setQuiz(result.quiz);
    setIsLoading(false);
};
```
-   **What it does**: When the user clicks "Start Quiz", it pauses the UI (`setIsLoading`), calls the server function `createQuiz`, and waits for the AI to reply.
-   **Important**: This `createQuiz` function runs on the Server, not the Browser.

---

## 4. Data Flow (Step-by-Step)

### Scenario: User Generates a Quiz on "Photosynthesis"

1.  **User Input**: User types "Photosynthesis" into the input field on `QuizPage`.
2.  **Form Submission**: React captures this input and validates it (e.g., ensuring length > 2).
3.  **Server Action**: The browser sends a POST request to Next.js.
4.  **Genkit Flow**:
    -   The server receives `{ topic: "Photosynthesis" }`.
    -   It injects this into the Prompt: "Generate a quiz... on Photosynthesis".
    -   It sends this prompt to the **Google Gemini API**.
5.  **AI Processing**: Gemini generates the questions in JSON format.
6.  **Validation**: Genkit checks if the JSON matches `AdaptiveQuizOutputSchema`.
7.  **Response**: The server sends the verified JSON back to the browser.
8.  **Render**: `QuizPage` updates its state (`setQuiz`), hiding the form and showing the first question card.

---

## 5. Dependencies & Coupling

-   **Tightly Coupled**:
    -   **Frontend <-> Server Actions**: The frontend imports types (`AdaptiveQuizOutput`) directly from the backend files. This is good for type safety but means you can't easily swap the backend for a Python API later without rewriting the frontend types.
    -   **Genkit <-> Zod**: The entire AI logic relies heavily on `zod` for schemas.

-   **Loosely Coupled**:
    -   **UI Components**: The `src/components/ui` are independent. You could copy `button.tsx` to another project and it would work fine.

---

## 6. Control Flow & Execution Path

**Startup Sequence**:
1.  `npm run dev` starts the Next.js server.
2.  `src/app/page.tsx` runs immediately on root access (`/`) and redirects to `/home`.
3.  `src/app/(main)/layout.tsx` renders, loading the Sidebar and Header.
4.  `src/app/(main)/home/page.tsx` renders the dashboard using **mock data** (the `brainMapData` array).

**Happy Path (User Flow)**:
-   User lands on `/home` -> Clicks "Take Quiz".
-   Navigates to `/quiz`.
-   Enters topic -> "Start".
-   React waits -> Server generates -> React renders questions.
-   User clicks answer -> "Next" -> "Finish".
-   Score is calculated locally in `page.tsx`.

---

## 7. Demo vs. Production Analysis

This codebase is a **high-quality prototype**. It proves the value of AI but lacks the infrastructure for a real product.

### **Gaps & Missing Features**
1.  **Security Risk**: The API key is in `env.txt`. This file is often accidentally committed to Git. **Fix**: Move to `.env.local` and add `env.txt` to `.gitignore`.
2.  **Mock Data**: The Dashboard (`/home`) is purely visual. It shows "Mathematics: 85%" hardcoded. It does not reflect the quizzes you actually take.
3.  **No Logic in Auth**: The Data doesn't belong to a user. `SignInPage` is just a shell. There is no database saving your quiz results to your user ID.
4.  **Error Handling**: If the AI times out or creates invalid JSON, the UI generic error "An unexpected error occurred" is shown. It needs retry logic.

### **Roadmap to Production**
1.  **Database**: Integrate **Firebase Firestore**.
    -   Create a `users` collection.
    -   Create a `quiz_results` collection.
    -   Update `QuizPage` to save the score to Firestore after finishing.
2.  **Real Dashboard**: Update `HomePage` to fetch real data from Firestore instead of the `brainMapData` constant.
3.  **Authentication**: Wire up `SignInPage` with **Firebase Auth** or **NextAuth.js**.

---
