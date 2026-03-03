# Sankalp AEI-Attention Engagement Intelligence Learning Architecture 🎓

## Project Overview

**Sankalp**  is an **ML-driven** educational platform that combines machine learning predictions with generative AI to personalize the learning experience. Unlike traditional LLM-only approaches, Sankalp uses trained ML models to make data-driven decisions about what to teach, when to revise, and where students need help — then leverages LLMs to generate engaging explanations.

**Key Architecture:**  
`User → Quiz → Feature Extraction → ML Prediction → ADK Decision Engine → LLM Content Generation`

**What Makes This Different:**
- ✅ **ML makes predictions** (mastery, attention risk, forgetting curves)
- ✅ **ADK makes decisions** (when to revise, how to teach, when to alert teachers)
- ✅ **LLM generates content** (explanations, motivational messaging)
- ✅ **Explainable by design** (every decision has reasoning)

> **Status:** Production-Ready Architecture with Synthetic Data  
> Complete ML → ADK → Frontend integration. Database integration with Firebase is active.

## Key Features 🚀

-   **ML-Driven Intelligence Dashboard**: Real-time mastery predictions, attention risk analysis, and ADK-powered learning recommendations
-   **Smart Revision Planner**: ML predicts mastery → ADK decides urgency → LLM explains why (see `smart-revision-planner.ts`)
-   **Student Intelligence API**: Unified `/api/intelligence/student` endpoint serving ML predictions and ADK decisions
-   **Explainable AI**: Visual tooltips showing "Why am I seeing this?" based on quiz history and ML analysis
-   **Teacher Analytics** : Risk dashboards, intervention suggestions, class-level intelligence
-   **Syllabus Generator**: Retrieves official syllabi with exam strategies
-   **Adaptive Quiz Engine**: Generates questions based on weak areas
-   **Mindful Mentor**: An AI tutor available to answer varied queries, providing motivation and explaining complex topics with context awareness.

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
-   **Database/Auth**: [Firebase](https://firebase.google.com/) (Firestore & Auth)

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
│   │   ├── (auth)/         # Authentication routes (Login/Signup/Onboarding)
│   │   ├── (main)/         # Main dashboard routes (Home, Syllabus, Quiz, Teacher)
│   │   └── globals.css     # Global styles & Tailwind directives
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Radix/Shadcn primitives (Buttons, Cards, Inputs)
│   │   └── ...             # Feature-specific components
│   └── lib/                # Shared utilities
│       ├── validations/    # Zod schemas for form validation
│       └── styles/         # Design tokens
├── docs/                   # Documentation & Blueprints
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

### 4. RAG — Retrieval-Augmented Generation (`src/ai/rag/`)

**Yes, RAG is applied in SANKALP — here is how it works:**

RAG (Retrieval-Augmented Generation) is the practice of *retrieving* relevant documents from a knowledge base and *augmenting* the LLM prompt with that retrieved context before *generating* the final answer.  This grounds the model's output in real, curated data rather than relying on generic world knowledge alone.

The RAG pipeline has been upgraded to production standards aligned with the Core Intelligence Block Upgrade Strategy:

| Dimension | Implementation |
|-----------|---------------|
| **Retrieval** | Hybrid sparse BM25 + dense TF-IDF cosine similarity (`scoring.ts`) |
| **Index** | Pluggable `VectorStore` interface — in-memory default; swap to Pinecone / pgvector / Weaviate (`vector-store.ts`) |
| **Chunking** | Context-aware paragraph chunking targeting 512–1024 tokens (`chunking.ts`) |
| **Scoring** | Real Okapi BM25 with k1/b tuning + normalised TF-IDF dense vectors |
| **Reranking** | Heuristic cross-encoder with term proximity, section match, and exact-phrase overlap (`reranker.ts`) |
| **Query** | Full user chat history merged into an enriched query for conversational context |
| **Freshness** | Incremental reindexing via `refreshKnowledgeBase()` and `upsertDocument()` |
| **Method** | Async `retrieveContext()` API to prevent blocking the UI |
| **Upgrade Integration** | `retrieveContextWithMetadata()` returns structured `RetrievalMetadata` for downstream ML / ADK / LLM tiers |

**Knowledge base:** All student-profile markdown files under `data/students/` (e.g. `alex-kumar.md`, `arjun-reddy.md`, …) are loaded at server startup and split into context-aware paragraph chunks (~600 tokens each with ~100 token overlap).

**Retrieval step:** When a user asks a question in the Chat page, `retrieveContext(query, { history })` in `src/ai/rag/retriever.ts` is called.  The pipeline enriches the query with recent chat history, then runs hybrid BM25 + TF-IDF dense retrieval followed by cross-encoder reranking.

**Augmentation step:** The retrieved string is passed as the `brainMapContext` field to `explainConcept()` (the multilingual chatbot Genkit flow in `src/ai/flows/multilingual-cognitive-chatbot.ts`).  The prompt template already contains `Brain Map Context: {{{brainMapContext}}}`, so the LLM sees the retrieved student data as part of its context window.

**Generation step:** The LLM (Gemini 2.0 Flash) generates a personalised explanation that is aware of the topics, strengths, weaknesses, and recent quiz results of the relevant student profiles.

**Upgrade integration:** The `retrieveContextWithMetadata()` API returns a `RetrievalResult` with both the formatted context and structured `RetrievalMetadata` (retrieval confidence, score statistics, source identifiers).  This metadata feeds directly into the Core Intelligence Block Upgrade tiers — see `docs/upcoming manual changess/Core_block_upgrade.md` § "RAG Pipeline Integration" for the full mapping.

**Full pipeline:**
```
User question + chat history
    │
    ▼
buildEnrichedQuery()               ← Query enrichment (retriever.ts)
    │   merges current message with recent chat history
    ▼
hybridScore()                      ← Hybrid retrieval (scoring.ts)
    │   BM25 sparse + TF-IDF dense scoring
    ▼
heuristicRerank()                  ← Cross-encoder reranking (reranker.ts)
    │   term proximity + section match + exact phrase
    ▼
brainMapContext string              ← Augmentation (chat/actions.ts)
    │   injected into LLM prompt
    ▼
RetrievalMetadata                  ← Upgrade bridge (retriever.ts)
    │   confidence, scores, sources → ML / ADK / LLM tiers
    ▼
explainConceptFlow (Genkit)        ← Generation (multilingual-cognitive-chatbot.ts)
    │   Gemini 2.0 Flash generates grounded explanation
    ▼
Personalised answer in the Chat UI
```

The in-memory vector store runs entirely in-process.  For large-scale deployments, swap the `InMemoryVectorStore` for a managed vector database (Pinecone, pgvector, or Weaviate) by implementing the `VectorStore` interface in `src/ai/rag/vector-store.ts`.

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
This creates `src/ml/models/mastery_model.pk`l with >90% accuracy.

### 4. Environment Configuration
Create `.env.local` in the root:
```env
GEMINI_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_FIREBASE_API_KEY=...
# ... other Firebase config variables
```

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
-   **Authentication**: Fully implemented in `(auth)` using Firebase Auth and Zod validation. Ensure AI endpoints are protected and only accessible to logged-in users.

### 2. Code Quality & Testing
-   **Error Handling**: Replace generic "An unexpected error occurred" messages with specific error codes (e.g., quota exceeded, network timeout).
-   **Unit Tests**: Add tests for the Genkit flows (using mocks for the LLM) and React components.
-   **Type Safety**: Ensure `any` types are minimized and strict TypeScript checks are enabled.

### 3. Infrastructure
-   **Database**: Connected to Firebase Firestore for user progress, syllabi, and teacher data.
-   **Caching**: Implement caching (Redis or Next.js Cache) for common syllabus queries to save on API costs and reduce latency.

## Limitations
-   **Mock Data**: Some dates (like the "Exam Date" in the syllabus page) are hardcoded for demonstration (`new Date() + 2 days`).
-   **ML Model**: Trained on synthetic data; needs real user data for production accuracy.

## License
MIT License (Placeholder)
