# Mindful Mentor Feature Completeness Roadmap

## Executive Summary
This roadmap documents the current "skeletal" state of the Mindful Mentor feature and outlines the critical gaps needed to evolve it into a production-ready emotional support assistant. Currently, the feature acts as a simple stateless chat interface with hardcoded context, severely limiting its personalization and therapeutic value.

## Scope
- **Components Audited**:
    - `src/app/(main)/mentor/page.tsx`: Chat UI.
    - `src/app/(main)/mentor/actions.ts`: Server Action for LLM inference.
    - `src/ai/flows/mindful-mentor.ts`: Genkit flow definition (implied).

## Gap Analysis

### 1. Missing Context Integration (Critical)
- **Current State**: The `getMotivationalAdvice` server action hardcodes the student's history:
  ```typescript
  studentHistory: "The student has been feeling overwhelmed with their chemistry coursework and has an upcoming exam."
  ```
- **Required State**: The system must inject real-time context from the `StudentNode` (e.g., recent quiz scores, upcoming deadlines from `ScheduleView`, identified weak areas).
- **Impact**: Without context, the advice is generic and potentially irrelevant to the student's actual struggles.

### 2. Lack of Persistence (Critical)
- **Current State**: Chat history is stored only in React state (`useState<Message[]>`). Refreshing the page wipes the conversation.
- **Required State**: Chat sessions should be persisted in a database (e.g., Firestore `conversations` collection) linked to the `studentId`.
- **Impact**: Students cannot review past advice or build a long-term relationship with the mentor. The AI also loses memory of previous sessions.

### 3. Shallow Sentiment Analysis
- **Current State**: The prompt asks the AI to "analyze sentiment first," but the structured output (if any) is not used to update the student's emotional profile.
- **Required State**: Extract sentiment scores (e.g., Anxiety Level, Motivation Score) from user messages and track them over time to trigger interventions (e.g., alert a teacher if anxiety is consistently high).
- **Impact**: Missed opportunity for proactive mental health monitoring.

## Implementation Roadmap

### Phase 1: Context Awareness (Next 2 Weeks)
- [ ] Update `getMotivationalAdvice` to accept `studentId`.
- [ ] Fetch `StudentNode` inside the action to get real `weaknesses`, `upcomingDeadlines`, and `recentGrades`.
- [ ] Construct a dynamic prompt including this context.

### Phase 2: Persistence & History (Month 1)
- [ ] Create `conversations` collection in DB.
- [ ] Implement `saveMessage` and `loadConversation` functions.
- [ ] Update `MentorPage` to load history on mount.

### Phase 3: Emotional Intelligence (Month 2)
- [ ] Enhance Genkit flow to output structured sentiment data (JSON).
- [ ] Store sentiment metrics in a time-series format (`emotional_logs`).
- [ ] Create a "Mood Tracker" visualization on the dashboard.

## Conclusion
The Mindful Mentor is currently a "demo-grade" feature. Integrating it with the existing `StudentContext` and adding a persistence layer are the immediate blockers to making it a viable product feature.
