# Dark Mode / Theme Switching Consistency Audit

**Date:** 2026-02-18T19:34:14.533Z
**Scope:** /app/src

## 1. Global Configuration
- Status: **globals.css contains dark mode variables.**

## 2. Hardcoded Color Findings
Potential issues where colors are hardcoded instead of using semantic variables (e.g. `bg-background`, `text-foreground`).

Found 112 potential hardcoded color usages. Showing first 50:

| File | Line | Content |
|------|------|---------|
| `src/app/(main)/brain-map/page.tsx` | 97 | `bg-green-100` |
| `src/app/(main)/brain-map/page.tsx` | 97 | `text-green-700` |
| `src/app/(main)/brain-map/page.tsx` | 98 | `bg-red-100` |
| `src/app/(main)/brain-map/page.tsx` | 98 | `text-red-700` |
| `src/app/(main)/brain-map/page.tsx` | 138 | `bg-purple-600` |
| `src/app/(main)/brain-map/page.tsx` | 142 | `bg-gray-500` |
| `src/app/(main)/brain-map/page.tsx` | 146 | `bg-green-500` |
| `src/app/(main)/brain-map/page.tsx` | 150 | `bg-red-500` |
| `src/app/(main)/classes/page.tsx` | 124 | `text-green-600` |
| `src/app/(main)/quiz/page.tsx` | 150 | `text-yellow-500` |
| `src/app/(main)/quiz/page.tsx` | 167 | `bg-amber-50` |
| `src/app/(main)/quiz/page.tsx` | 167 | `text-amber-700` |
| `src/app/(main)/quiz/page.tsx` | 167 | `border-amber-100` |
| `src/app/(main)/quiz/page.tsx` | 188 | `border-green-500` |
| `src/app/(main)/quiz/page.tsx` | 188 | `bg-green-50` |
| `src/app/(main)/quiz/page.tsx` | 189 | `border-red-500` |
| `src/app/(main)/quiz/page.tsx` | 189 | `bg-red-50` |
| `src/app/(main)/quiz/page.tsx` | 194 | `text-green-500` |
| `src/app/(main)/quiz/page.tsx` | 195 | `text-red-500` |
| `src/app/(main)/rewards/page.tsx` | 69 | `text-orange-500` |
| `src/app/(main)/syllabus/page.tsx` | 171 | `bg-amber-50` |
| `src/app/(main)/syllabus/page.tsx` | 171 | `text-amber-700` |
| `src/app/(main)/syllabus/page.tsx` | 171 | `border-amber-100` |
| `src/app/(main)/syllabus/page.tsx` | 221 | `text-amber-500` |
| `src/app/(main)/teacher/classes/[classId]/page.tsx` | 215 | `text-green-500` |
| `src/app/(main)/teacher/classes/page.tsx` | 511 | `text-green-500` |
| `src/app/(main)/teacher/page.tsx` | 68 | `#ef4444` |
| `src/app/(main)/teacher/page.tsx` | 175 | `text-white` |
| `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx` | 121 | `text-white` |
| `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx` | 187 | `text-green-500` |
| `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx` | 196 | `text-green-500` |
| `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx` | 210 | `text-red-500` |
| `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx` | 219 | `text-red-500` |
| `src/app/(main)/teacher/students/[studentId]/page.tsx` | 76 | `text-green-500` |
| `src/app/(main)/teacher/students/[studentId]/page.tsx` | 77 | `text-red-500` |
| `src/components/InteractiveGraph.tsx` | 356 | `#ffffff` |
| `src/components/InteractiveGraph.tsx` | 356 | `#a1a1aa` |
| `src/components/PersonalKnowledgeGraph.tsx` | 170 | `#ffffff` |
| `src/components/PersonalKnowledgeGraph.tsx` | 170 | `#d1d5db` |
| `src/components/SankalpSwitch.tsx` | 167 | `bg-green-100` |
| `src/components/SankalpSwitch.tsx` | 167 | `text-green-700` |
| `src/components/SankalpSwitch.tsx` | 167 | `bg-gray-100` |
| `src/components/SankalpSwitch.tsx` | 167 | `text-gray-600` |
| `src/components/StudentSelector.tsx` | 34 | `bg-blue-500` |
| `src/components/StudentSelector.tsx` | 35 | `bg-purple-500` |
| `src/components/StudentSelector.tsx` | 36 | `bg-green-500` |
| `src/components/StudentSelector.tsx` | 37 | `bg-orange-500` |
| `src/components/StudentSelector.tsx` | 38 | `bg-pink-500` |
| `src/components/StudentSelector.tsx` | 50 | `text-white` |
| `src/components/TopicMasteryGrid.tsx` | 52 | `text-green-500` |

... and 62 more.
