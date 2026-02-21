# Core Block Upgrade — Step-by-Step Implementation Plan

> This document breaks down the upgrade path for each core architectural block of the SANKALP application. Each block lists its current status, known gaps, and the ordered steps required to bring it to production quality.

---

## Overview of Core Blocks

| Block | Status | Completion |
|-------|--------|------------|
| [1. Brain Map Dashboard](#1-brain-map-dashboard) | 🚧 Buggy | 70% |
| [2. Smart Revision Planner](#2-smart-revision-planner) | 🚧 Partial | 50% |
| [3. Adaptive Quiz Engine](#3-adaptive-quiz-engine) | 🚧 Partial | 40% |
| [4. Multilingual Cognitive Chatbot](#4-multilingual-cognitive-chatbot) | 🚧 UI only | 30% |
| [5. Offline-First Mode](#5-offline-first-mode) | 📝 Planned | 0% |
| [6. Teacher Risk Dashboard](#6-teacher-risk-dashboard) | 🚧 Partial | 60% |
| [7. Analytics Export](#7-analytics-export) | 📝 Planned | 5% |

---

## 1. Brain Map Dashboard

**Blueprint spec:** Interactive syllabus graph with progress nodes (red/yellow/green).

### Current State
- ✅ Force-directed graph renders topic connections
- ✅ Node click interactions work
- ✅ API endpoint `/api/student/graph` exists
- ⚠️ Graph-to-data sync errors persist
- ⚠️ Student data does not load reliably
- ❌ Node colour (red/yellow/green) is not driven by real mastery data

### Upgrade Steps

**Step 1 — Fix data loading**
- [ ] Debug `StudentContext` — verify Firestore `students` document is fetched before graph renders
- [ ] Add loading skeleton to `src/app/(main)/brain-map/page.tsx` so the graph waits for data
- [ ] Confirm `/api/student/graph` returns the authenticated user's data, not mock data

**Step 2 — Connect mastery scores to node colour**
- [ ] Extend the `GraphNode` type in `src/data/docsData.ts` to include `masteryScore: number`
- [ ] In `generateGraphData()`, map `masteryScore` → node colour:
  - `< 0.4` → red
  - `0.4–0.7` → yellow
  - `>= 0.7` → green
- [ ] Pass colour through to `InteractiveGraph.tsx` canvas render

**Step 3 — Node editing capabilities**
- [ ] Add an "Edit Topic" modal triggered by right-click or a button on node hover
- [ ] Allow students to mark a topic as "studied", which writes to Firestore and re-fetches the graph

**Step 4 — Performance optimisation**
- [ ] Memoize `generateGraphData` using stable student data reference
- [ ] Limit initial render to 20 closest nodes; add "Show All" toggle
- [ ] Profile with React DevTools and remove unnecessary re-renders

**Step 5 — Validation**
- [ ] Manual test: login, open Brain Map, confirm nodes show correct colours
- [ ] Unit test: `generateGraphData` assigns correct colours for three mastery ranges

---

## 2. Smart Revision Planner

**Blueprint spec:** AI-powered daily revision list auto-generated via spaced repetition; suggests revisions.

### Current State
- ✅ Calendar/list UI exists at `src/app/(main)/planner/page.tsx`
- ❌ Tasks are not persisted to Firestore
- ❌ No AI schedule generation
- ❌ No reminder/notification system

### Upgrade Steps

**Step 1 — Persist tasks manually**
- [ ] Create Firestore collection `plannerTasks` with schema:
  ```
  { studentId, taskId, topic, scheduledDate, completed, createdAt }
  ```
- [ ] Add POST `/api/planner/tasks` — create a task
- [ ] Add GET `/api/planner/tasks?studentId=` — fetch tasks for a date range
- [ ] Add PATCH `/api/planner/tasks/[taskId]` — mark complete / reschedule
- [ ] Wire the planner page to call these endpoints with optimistic UI updates

**Step 2 — Add spaced-repetition scheduling**
- [ ] Implement a basic SM-2 algorithm in `src/lib/spaced-repetition.ts`
  - Inputs: `topic`, `lastReviewedAt`, `efactor`, `interval`, `quality (0–5)`
  - Output: `nextReviewDate`, updated `efactor` and `interval`
- [ ] When a quiz completes, record the SM-2 result and schedule the next review date
- [ ] Planner page: show AI-suggested tasks in a separate "Suggested Today" section

**Step 3 — AI schedule generation**
- [ ] Create Genkit flow `src/ai/flows/planner-generator.ts`
  - Input: student's weak topics, available study hours per day, exam date
  - Output: a week's worth of prioritised tasks
- [ ] Add POST `/api/planner/generate` that invokes the flow
- [ ] Add a "Generate Schedule" button on the planner page

**Step 4 — Reminders**
- [ ] Add a daily summary email/notification trigger (Firebase Cloud Messaging or email)
- [ ] User setting: enable/disable reminders in Settings page

**Step 5 — Validation**
- [ ] Manual test: create a task, reload page, confirm it persists
- [ ] Integration test: submit a quiz → verify a new planner task is auto-scheduled

---

## 3. Adaptive Quiz Engine

**Blueprint spec:** 2–5 minute quizzes; results update Brain Map. Generative AI selects questions.

### Current State
- ✅ Quiz UI at `src/app/(main)/quiz/page.tsx`
- ✅ Submit endpoint `/api/quiz/submit` (partial)
- ❌ No question bank or generation
- ❌ No difficulty adaptation
- ❌ Quiz results do not update the Brain Map / mastery scores

### Upgrade Steps

**Step 1 — Build a question bank**
- [ ] Create Firestore collection `questionBank`:
  ```
  { questionId, topic, difficulty (1–5), type (mcq|short), body, options[], answer, explanation }
  ```
- [ ] Seed the bank with at least 10 questions per core topic (use Genkit to generate initial set)
- [ ] Add admin script `scripts/seed-questions.ts`

**Step 2 — AI question selection**
- [ ] Create Genkit flow `src/ai/flows/quiz-generator.ts`
  - Input: `topic`, `studentMasteryScore`, `count`
  - Output: array of question objects tailored to the student's current level
- [ ] Add GET `/api/quiz/generate?topic=&studentId=` that invokes the flow
- [ ] Update quiz page to fetch questions from this endpoint instead of static data

**Step 3 — Difficulty adaptation**
- [ ] After each quiz, compute a delta mastery score using the SM-2 quality rating
- [ ] Store result in `quizResults` Firestore collection:
  ```
  { studentId, topic, score, difficulty, timeTaken, timestamp }
  ```
- [ ] Adjust next quiz difficulty based on rolling average of last 3 attempts

**Step 4 — Update Brain Map on quiz completion**
- [ ] On quiz submit, call `/api/student/graph` to recalculate mastery and refresh the Brain Map node colour
- [ ] Show a toast notification: "Brain Map updated — Algebra improved to 72%!"

**Step 5 — Performance analytics per student**
- [ ] Compute per-topic accuracy, speed, and trend over the last 7 days
- [ ] Expose via GET `/api/student/analytics?studentId=`
- [ ] Display a mini chart on the quiz results screen

**Step 6 — Validation**
- [ ] Manual test: complete a quiz → Brain Map node changes colour
- [ ] Unit test: difficulty selection function returns harder questions when mastery > 0.7

---

## 4. Multilingual Cognitive Chatbot

**Blueprint spec:** Anchored to Brain Map to explain concepts; multilingual.

### Current State
- ✅ Chat UI at `src/app/(main)/chat/page.tsx`
- ✅ Message history stored in component state
- ❌ No AI backend integration
- ❌ No Brain Map context injection
- ❌ No multilingual support

### Upgrade Steps

**Step 1 — Connect the Genkit chatbot flow**
- [ ] Verify `src/ai/flows/custom-cognitive-chatbot.ts` flow is wired to an API endpoint
- [ ] Create POST `/api/chat/message` that invokes the flow with:
  - `message` — user's input
  - `history` — last 10 messages
  - `studentContext` — current topic from Brain Map
- [ ] Update chat page to call this endpoint and stream responses

**Step 2 — Anchor to Brain Map**
- [ ] Pass the currently highlighted Brain Map node (topic) as `studentContext` to the chat
- [ ] Show a "Discussing: [Topic]" chip in the chat header
- [ ] Allow users to switch context by clicking a different Brain Map node

**Step 3 — Multilingual support**
- [ ] Add a language selector (English, Hindi, regional languages) to the chat header
- [ ] Pass `language` to the Genkit prompt; update prompt to respond in the selected language
- [ ] Persist language preference in student Firestore document

**Step 4 — Persist chat history**
- [ ] Create Firestore collection `chatHistory`:
  ```
  { studentId, topic, messages: [{role, content, timestamp}], sessionId }
  ```
- [ ] Load the last session's messages when the chat page opens for the same topic

**Step 5 — Validation**
- [ ] Manual test: type a message, receive an AI response in under 5 seconds
- [ ] Manual test: switch language to Hindi, confirm response is in Hindi

---

## 5. Offline-First Mode

**Blueprint spec:** Caches the next 3–5 days of revision content for offline use.

### Current State
- ❌ No service worker
- ❌ No local caching strategy

### Upgrade Steps

**Step 1 — Add a service worker**
- [ ] Use `next-pwa` or a custom Workbox configuration
- [ ] Register service worker in `src/app/layout.tsx`
- [ ] Add `manifest.json` to `public/`

**Step 2 — Define cache strategy**
- [ ] Cache quiz questions for the next 3 days (fetched at login via background sync)
- [ ] Cache planner tasks for the next 5 days
- [ ] Cache Brain Map graph data after each load

**Step 3 — Background sync for quiz submissions**
- [ ] Queue failed quiz submissions (when offline) in IndexedDB
- [ ] Replay the queue when connectivity is restored

**Step 4 — Offline UI indicators**
- [ ] Show an "Offline" banner when `navigator.onLine` is false
- [ ] Disable features that require live data (AI Chatbot, real-time analytics)

**Step 5 — Validation**
- [ ] Manual test: load app, disable network, navigate to planner — content is visible
- [ ] Manual test: submit quiz offline — submission syncs when reconnected

---

## 6. Teacher Risk Dashboard

**Blueprint spec:** Class heatmap of weak spots and predicted dropout probability.

### Current State
- ✅ Teacher dashboard at `src/app/(main)/teacher/page.tsx`
- ✅ Student list and network graph
- ⚠️ Teacher flow still routes to errors in some cases
- ❌ Class management (create/join) not implemented
- ❌ Automated intervention detection not implemented

### Upgrade Steps

**Step 1 — Fix teacher authentication flow**
- [ ] Trace the redirect bug: `login → teacher dashboard` should not hit error pages
- [ ] Ensure teacher onboarding sets `role: "teacher"` in Firestore `users` collection
- [ ] Middleware must route `teacher` role to `/teacher` and `student` role to `/home`

**Step 2 — Class management**
- [ ] Create Firestore collection `classes`:
  ```
  { classId, classCode, teacherId, studentIds[], subject, grade }
  ```
- [ ] Add POST `/api/classes/create` — teacher creates a class and receives a class code
- [ ] Update student onboarding: if class code entered, add `studentId` to `classes.studentIds`
- [ ] Teacher dashboard: list classes, click to see per-class analytics

**Step 3 — Heatmap of weak spots**
- [ ] Aggregate `quizResults` by topic across all students in a class
- [ ] Compute average mastery per topic; expose via GET `/api/teacher/analytics?classId=`
- [ ] Render a heatmap grid: topics (rows) × students (columns), colour-coded by mastery

**Step 4 — Dropout probability prediction**
- [ ] Use the ML mastery model to compute a risk score per student
- [ ] Expose via GET `/api/teacher/risk?studentId=`
- [ ] Flag students with risk score > 0.7 as "High Risk" with a red badge on the dashboard

**Step 5 — Intervention system**
- [ ] Teacher marks a student for intervention → creates a document in `teacherInterventions`
- [ ] Student sees a "Your teacher has flagged this topic" banner on their home page
- [ ] Auto-suggest interventions (extra quiz, chatbot session) based on weak topic

**Step 6 — Validation**
- [ ] Manual test: create a class, student joins using class code, teacher sees student in dashboard
- [ ] Manual test: student completes quiz with low score → teacher risk dashboard reflects change

---

## 7. Analytics Export

**Blueprint spec:** CSV/PDF reports for principals and admins.

### Current State
- ❌ No export functionality
- ❌ No analytics aggregation API

### Upgrade Steps

**Step 1 — Data aggregation API**
- [ ] Add GET `/api/teacher/analytics/export?classId=&format=json` that aggregates:
  - Per-student mastery per topic
  - Quiz attempt count and average score
  - Risk scores
  - Activity hours

**Step 2 — CSV export**
- [ ] Install `papaparse` or use Node's built-in CSV serialisation
- [ ] Add GET `/api/teacher/analytics/export?format=csv` — streams a `.csv` file
- [ ] Add "Export CSV" button to the teacher analytics page

**Step 3 — PDF export**
- [ ] Install `@react-pdf/renderer`
- [ ] Create a `ClassReportPDF` component with the class summary
- [ ] Add "Export PDF" button that generates and downloads the file client-side

**Step 4 — Admin portal (optional phase 2)**
- [ ] Create `/admin` route protected by an `admin` role check
- [ ] Admin can select multiple classes and export aggregated school-wide reports

**Step 5 — Validation**
- [ ] Manual test: click "Export CSV" → file downloads with correct columns and data
- [ ] Manual test: click "Export PDF" → PDF contains class name, date, and student table

---

## Cross-Cutting Upgrade Tasks

These tasks apply to all blocks and should be done in parallel.

### Authentication Hardening
- [ ] Add Firebase ID token validation to every API route (`src/lib/auth-helpers.ts`)
- [ ] Replace hardcoded `studentId` parameters with `auth.currentUser.uid`
- [ ] Add rate limiting to `/api/quiz/submit` and `/api/chat/message`

### Mock Data Removal
- [ ] Search for `"demo_student"` and `"test_user"` strings; replace with real auth IDs
- [ ] Remove static fallback data in `src/app/api/intelligence/student/route.ts`

### Error Handling
- [ ] Wrap all API routes with a `try/catch` that returns structured `{ error, code }` JSON
- [ ] Add React Error Boundaries around each major page section
- [ ] Display user-friendly error messages instead of blank screens

### Testing Baseline
- [ ] Write Jest unit tests for: `generateGraphData`, `SM-2 algorithm`, `quiz difficulty selection`
- [ ] Write integration tests for: quiz submit flow, planner task CRUD
- [ ] Target 60% test coverage on `src/lib/` and `src/ai/`

---

## Recommended Implementation Order

1. **Fix Auth & Data Loading** (Blocks 1 + 6 Step 1) — 2 days
2. **Quiz Engine — Question Bank + Submit** (Block 3 Steps 1–4) — 3 days
3. **Planner — Task Persistence** (Block 2 Step 1) — 1 day
4. **Brain Map — Mastery Colours** (Block 1 Steps 2–3) — 1 day
5. **Teacher Class Management** (Block 6 Steps 2–3) — 3 days
6. **Chatbot AI Integration** (Block 4 Steps 1–2) — 2 days
7. **Analytics Export** (Block 7 Steps 1–3) — 2 days
8. **Spaced-Repetition Planner** (Block 2 Steps 2–3) — 2 days
9. **Multilingual Chatbot** (Block 4 Steps 3–4) — 1 day
10. **Offline-First Mode** (Block 5) — 3 days

**Estimated total: ~20 developer-days to reach feature-complete MVP**

---

*See also: [blueprint.md](./blueprint.md) · [PRE_ROLLOUT_CHECKLIST.md](./PRE_ROLLOUT_CHECKLIST.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)*
