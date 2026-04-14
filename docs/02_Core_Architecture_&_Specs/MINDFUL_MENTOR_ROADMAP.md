# Mindful Mentor Feature Roadmap

## Executive Summary
The "Mindful Mentor" feature is currently a functional prototype consisting of a basic chat interface and a Genkit-powered AI prompt. It lacks critical production features such as conversation persistence, real-time context integration (e.g., grades, recent activity), and proactive engagement capabilities. To become a fully realized "AI Counselor," significant backend and integration work is required.

## Current Implementation Status

| Component | Status | Description |
| :--- | :--- | :--- |
| **AI Flow** | **Prototype** | `mindfulMentorFlow` wraps a structured prompt but lacks memory/context window management. |
| **User Interface** | **Basic** | Simple chat UI (`mentor/page.tsx`) with ephemeral local state. History is lost on refresh. |
| **Context Integration** | **Hardcoded** | `src/app/(main)/mentor/actions.ts` feeds a static string ("The student has been feeling overwhelmed with their chemistry coursework...") to the AI, completely ignoring real student data. |
| **Persistence** | **None** | Chat logs are not saved to the database. |

## Gap Analysis

### 1. Lack of Persistence
*   **Gap:** Conversations are not stored. A student cannot revisit advice or continue a session later.
*   **Requirement:** Implement a `chatSessions` collection in Firestore to store message history.

### 2. Context Blindness
*   **Gap:** The AI does not know the student's actual grades, recent quiz failures, or study habits. It relies on a hardcoded string.
*   **Requirement:** Fetch `StudentNode` (mastery, recent activity) in `actions.ts` and inject a summary into the AI prompt (e.g., "Student failed Algebra quiz yesterday").

### 3. Reactive Only
*   **Gap:** The mentor only responds when messaged. It does not proactively reach out (e.g., "I noticed you struggled with Calculus...").
*   **Requirement:** Implement triggers (e.g., `onQuizComplete`) that can initiate a mentor session or notification.

## Roadmap to Production

### Phase 1: Foundation (MVP)
*   [ ] **Database Schema:** Create `chat_sessions` and `messages` collections.
*   [ ] **Context Injection:** Update `getMotivationalAdvice` in `actions.ts` to fetch real student data (grades, recent struggles) via `db-helpers.ts` and pass it to the prompt, replacing the hardcoded string.
*   [ ] **Persistence:** Save user and bot messages to Firestore.

### Phase 2: Enhanced Intelligence
*   [ ] **Sentiment Tracking:** Parse the AI's "Sentiment Analysis" output (currently text) into structured data to track student mood over time.
*   [ ] **Memory:** Implement a sliding window context or summary of previous sessions so the AI remembers past advice.

### Phase 3: Proactive & Integrated
*   [ ] **Proactive Triggers:** Automatically suggest a mentor session after significant grade drops or long inactivity.
*   [ ] **Dashboard Widget:** Display "Mood Trend" or "Mentor Tips" on the main student dashboard.
