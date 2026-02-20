# UX Flow Entropy Report

## 1. Executive Summary
- **Total States (Nodes)**: 25
- **Total Transitions (Edges)**: 225
- **High Complexity Pages**: 4
- **Dead-Ends (Contextual)**: 13

## 2. Cognitive Load Heatmap
| Page | Elements | Decisions | Complexity (Hicks) | Attention Cost | Status |
|---|---|---|---|---|---|
| `/teacher/classes` | 13 | 12 | 3.70 | 67 | 🟡 High |
| `/test-accessibility` | 10 | 10 | 3.46 | 15 | 🟡 High |
| `/quiz` | 9 | 9 | 3.32 | 44 | 🟡 High |
| `/home` | 16 | 8 | 3.17 | 33 | 🟡 High |
| `/onboarding` | 7 | 7 | 3.00 | 55 | 🟢 Optimal |
| `/sign-up` | 7 | 6 | 2.81 | 28 | 🟢 Optimal |
| `/teacher/classes/:classId` | 6 | 6 | 2.81 | 32 | 🟢 Optimal |
| `/teacher/students` | 6 | 6 | 2.81 | 68 | 🟢 Optimal |
| `/login` | 7 | 5 | 2.58 | 22 | 🟢 Optimal |
| `/teacher-onboarding` | 5 | 5 | 2.58 | 47 | 🟢 Optimal |
| `/chat` | 5 | 5 | 2.58 | 36 | 🟢 Optimal |
| `/settings` | 5 | 5 | 2.58 | 47 | 🟢 Optimal |
| `/syllabus` | 5 | 4 | 2.32 | 20 | 🟢 Optimal |
| `/teacher/students/:studentId` | 4 | 4 | 2.32 | 14 | 🟢 Optimal |
| `/classes` | 3 | 3 | 2.00 | 64 | 🟢 Optimal |
| `/join-class` | 2 | 2 | 1.58 | 8 | 🟢 Optimal |
| `/mentor` | 2 | 2 | 1.58 | 13 | 🟢 Optimal |
| `/teacher` | 3 | 2 | 1.58 | 7 | 🟢 Optimal |
| `/teacher/student/:studentId` | 2 | 1 | 1.00 | 6 | 🟢 Optimal |
| `/` | 0 | 0 | 0.00 | 5 | 🟢 Optimal |
| `/brain-map` | 0 | 0 | 0.00 | 20 | 🟢 Optimal |
| `/planner` | 0 | 0 | 0.00 | 5 | 🟢 Optimal |
| `/profile` | 0 | 0 | 0.00 | 5 | 🟢 Optimal |
| `/rewards` | 0 | 0 | 0.00 | 70 | 🟢 Optimal |
| `/test-charts` | 0 | 0 | 0.00 | 0 | 🟢 Optimal |

## 3. Decision Entropy & Paralysis Risk
Pages with high entropy offer too many choices without clear guidance.

| Page | Entropy (bits) | Outgoing Paths (Contextual) | Risk Level |
|---|---|---|---|
| `/home` | 4.09 | 8 | High (Analysis Paralysis) |
| `/login` | 3.91 | 5 | High (Analysis Paralysis) |
| `/sign-up` | 3.70 | 3 | High (Analysis Paralysis) |
| `/join-class` | 3.46 | 1 | Medium |
| `/onboarding` | 3.46 | 1 | Medium |
| `/` | 3.32 | 0 | Medium |
| `/profile` | 3.32 | 0 | Medium |
| `/test-accessibility` | 3.32 | 0 | Medium |
| `/test-charts` | 3.32 | 0 | Medium |
| `/brain-map` | 3.17 | 0 | Medium |
| `/chat` | 3.17 | 0 | Medium |
| `/classes` | 3.17 | 0 | Medium |
| `/mentor` | 3.17 | 0 | Medium |
| `/planner` | 3.17 | 0 | Medium |
| `/quiz` | 3.17 | 0 | Medium |
| `/rewards` | 3.17 | 0 | Medium |
| `/settings` | 3.17 | 0 | Medium |
| `/syllabus` | 3.17 | 0 | Medium |
| `/teacher/students/:studentId` | 2.81 | 3 | Medium |
| `/teacher/classes/:classId` | 2.58 | 2 | Medium |
| `/teacher-onboarding` | 2.32 | 1 | Low |
| `/teacher` | 2.32 | 2 | Low |
| `/teacher/student/:studentId` | 2.32 | 1 | Low |
| `/teacher/students` | 2.32 | 2 | Low |
| `/teacher/classes` | 2.00 | 1 | Low |

## 4. Path Efficiency Analysis
Measuring friction for critical user journeys. (Contextual Click = 1, Global Click = 5)

| Journey | Desktop Cost | Mobile Cost | Feasible? | Gap Analysis |
|---|---|---|---|---|
| Student: Quiz -> Revision | 5 | 6 | Yes | ✅ Efficient |
| Student: Home -> Quiz | 1 | 1 | Yes | ✅ Efficient |
| Teacher: Dashboard -> Intervention | ∞ | ∞ | No | 🚨 BROKEN LINK |
| Teacher: Dashboard -> Students | 5 | 6 | Yes | ✅ Efficient |

## 5. Dead-End Inventory
Pages where the user must use global navigation to leave (breaking flow).

- `/brain-map`: No visible "Next Step" buttons.
- `/chat`: No visible "Next Step" buttons.
- `/classes`: No visible "Next Step" buttons.
- `/mentor`: No visible "Next Step" buttons.
- `/planner`: No visible "Next Step" buttons.
- `/profile`: No visible "Next Step" buttons.
- `/quiz`: No visible "Next Step" buttons.
- `/rewards`: No visible "Next Step" buttons.
- `/settings`: No visible "Next Step" buttons.
- `/syllabus`: No visible "Next Step" buttons.
- `/test-accessibility`: No visible "Next Step" buttons.
- `/test-charts`: No visible "Next Step" buttons.

## 6. Prioritized Backlog
Based on the audit, here are the top issues:

1. **CRITICAL**: The `/quiz` page is a dead-end. Users finish a quiz and have no direct button to "Review Weak Areas" or "Go to Planner".
2. **CRITICAL**: The Teacher Intervention flow is broken. `/teacher/interventions` is not reachable from the dashboard.

## 7. Interactive Flow Graph (Mermaid)
```mermaid
graph TD
  "/join-class"
  "/":::deadEnd
  "/login"
  "/onboarding"
  "/sign-up"
  "/teacher-onboarding"
  "/brain-map":::deadEnd
  "/chat":::deadEnd
  "/classes":::deadEnd
  "/home"
  "/mentor":::deadEnd
  "/planner":::deadEnd
  "/profile":::deadEnd
  "/quiz":::deadEnd
  "/rewards":::deadEnd
  "/settings":::deadEnd
  "/syllabus":::deadEnd
  "/teacher/classes/:classId"
  "/teacher/classes"
  "/teacher"
  "/teacher/student/:studentId"
  "/teacher/students/:studentId"
  "/teacher/students"
  "/test-accessibility":::deadEnd
  "/test-charts":::deadEnd
  "/join-class" -->|1| "/home"
  "/login" -->|1| "/forgot-password"
  "/login" -->|1| "/sign-up"
  "/login" -->|1| "/teacher"
  "/login" -->|1| "/home"
  "/login" -->|1| "/home"
  "/onboarding" -->|1| "/home"
  "/sign-up" -->|1| "/login"
  "/sign-up" -->|1| "/teacher-onboarding"
  "/sign-up" -->|1| "/onboarding"
  "/teacher-onboarding" -->|1| "/teacher"
  "/home" -->|1| "/quiz"
  "/home" -->|1| "/planner"
  "/home" -->|1| "/chat"
  "/home" -->|1| "/classes"
  "/home" -->|1| "/planner"
  "/home" -->|1| "/quiz"
  "/home" -->|1| "/syllabus"
  "/home" -->|1| "/chat"
  "/teacher/classes/:classId" -->|1| "/teacher/classes"
  "/teacher/classes/:classId" -->|1| "/teacher/classes"
  "/teacher/classes" -->|1| "/teacher/classes/:id"
  "/teacher" -->|1| "/teacher/student/:id"
  "/teacher" -->|1| "/teacher/student/:id"
  "/teacher/student/:studentId" -->|1| "/teacher"
  "/teacher/students/:studentId" -->|1| "/teacher/students"
  "/teacher/students/:studentId" -->|1| "/teacher/students"
  "/teacher/students/:studentId" -->|1| "/teacher/students"
  "/teacher/students" -->|1| "/teacher/students/:id"
  "/teacher/students" -->|1| "/teacher/students/:id"
  classDef deadEnd fill:#fecaca,stroke:#ef4444,stroke-width:2px;
  classDef highLoad fill:#fef08a,stroke:#eab308,stroke-width:2px;
```
