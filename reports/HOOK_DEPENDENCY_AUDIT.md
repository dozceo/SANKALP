# Hook Dependency Audit

| File | Line | Hook | Dependencies | Status |
|---|---|---|---|---|
| src/app/(main)/brain-map/page.tsx | 15 | useEffect | `[user]` | ✅ Array Present |
| src/app/(main)/chat/page.tsx | 39 | useEffect | `[]` | ℹ️ Mount only |
| src/app/(main)/chat/page.tsx | 51 | useEffect | `[messages]` | ✅ Array Present |
| src/app/(main)/chat/page.tsx | 57 | useEffect | `[messages]` | ✅ Array Present |
| src/app/(main)/home/page.tsx | 27 | useEffect | `[currentStudent, studentLoading]` | ✅ Array Present |
| src/app/(main)/mentor/page.tsx | 33 | useEffect | `[messages]` | ✅ Array Present |
| src/app/(main)/syllabus/page.tsx | 28 | useEffect | `[]` | ℹ️ Mount only |
| src/app/(main)/syllabus/page.tsx | 40 | useEffect | `[syllabus]` | ✅ Array Present |
| src/app/(main)/teacher/classes/[classId]/page.tsx | 71 | useEffect | `[classId]` | ✅ Array Present |
| src/app/(main)/teacher/classes/[classId]/page.tsx | 126 | useMemo | `[students, searchQuery]` | ✅ Array Present |
| src/app/(main)/teacher/classes/[classId]/page.tsx | 135 | useMemo | `[students]` | ✅ Array Present |
| src/app/(main)/teacher/classes/page.tsx | 124 | useEffect | `[user, authLoading]` | ✅ Array Present |
| src/app/(main)/teacher/classes/page.tsx | 196 | useMemo | `[classes]` | ✅ Array Present |
| src/app/(main)/teacher/classes/page.tsx | 201 | useMemo | `[classes]` | ✅ Array Present |
| src/app/(main)/teacher/classes/page.tsx | 207 | useMemo | `[classes, searchQuery, subjectFilter, gradeFilter, sortBy]` | ✅ Array Present |
| src/app/(main)/teacher/classes/page.tsx | 249 | useMemo | `[classes]` | ✅ Array Present |
| src/app/(main)/teacher/page.tsx | 54 | useMemo | `[graphData, students]` | ✅ Array Present |
| src/app/(main)/teacher/page.tsx | 78 | useEffect | `[user]` | ✅ Array Present |
| src/app/(main)/teacher/students/[studentId]/page.tsx | 91 | useEffect | `[studentId]` | ✅ Array Present |
| src/app/(main)/teacher/students/page.tsx | 83 | useEffect | `[user, authLoading]` | ✅ Array Present |
| src/app/(main)/teacher/students/page.tsx | 113 | useMemo | `[students]` | ✅ Array Present |
| src/app/(main)/teacher/students/page.tsx | 119 | useMemo | `[students, searchQuery, classFilter, performanceFilter, activityFilter, sortBy]` | ✅ Array Present |
| src/app/(main)/teacher/students/page.tsx | 174 | useMemo | `[students]` | ✅ Array Present |
| src/app/page.tsx | 13 | useEffect | `[user, role, authLoading, router]` | ✅ Array Present |
| src/components/EventTrackerInit.tsx | 15 | useEffect | `[user]` | ✅ Array Present |
| src/components/InteractiveGraph.tsx | 64 | useEffect | `[hoveredNode]` | ✅ Array Present |
| src/components/InteractiveGraph.tsx | 68 | useEffect | `[highlightedNode]` | ✅ Array Present |
| src/components/InteractiveGraph.tsx | 74 | useMemo | `[]` | ✅ Array Present |
| src/components/InteractiveGraph.tsx | 77 | useMemo | `[fullGraphData]` | ✅ Array Present |
| src/components/InteractiveGraph.tsx | 104 | useMemo | `[fullGraphData]` | ✅ Array Present |
| src/components/InteractiveGraph.tsx | 111 | useMemo | `[highlightedNode, isGlobalView, fullGraphData, adjacencyMap, nodeLinksMap, nodeMap]` | ✅ Array Present |
| src/components/InteractiveGraph.tsx | 160 | useMemo | `[baseGraphData, filter]` | ✅ Array Present |
| src/components/InteractiveGraph.tsx | 196 | useEffect | `[isExpanded]` | ✅ Array Present |
| src/components/InteractiveGraph.tsx | 213 | useEffect | `[highlightedNode]` | ✅ Array Present |
| src/components/InteractiveGraph.tsx | 222 | useCallback | `[onNodeClick]` | ✅ Array Present |
| src/components/InteractiveGraph.tsx | 234 | useCallback | `[]` | ✅ Array Present |
| src/components/InteractiveGraph.tsx | 240 | useCallback | `[]` | ✅ Array Present |
| src/components/InteractiveGraph.tsx | 247 | useCallback | `[]` | ✅ Array Present |
| src/components/InteractiveGraph.tsx | 361 | useCallback | `[]` | ✅ Array Present |
| src/components/InteractiveGraph.tsx | 411 | useCallback | `[]` | ✅ Array Present |
| src/components/LearningStateCard.tsx | 26 | useMemo | `[intelligence.mastery]` | ✅ Array Present |
| src/components/LearningStateCard.tsx | 36 | useMemo | `[intelligence.attentionRisk, overallMastery]` | ✅ Array Present |
| src/components/PersonalKnowledgeGraph.tsx | 37 | useMemo | `[student]` | ✅ Array Present |
| src/components/PersonalKnowledgeGraph.tsx | 40 | useEffect | `[isExpanded, height]` | ✅ Array Present |
| src/components/PersonalKnowledgeGraph.tsx | 56 | useCallback | `[]` | ✅ Array Present |
| src/components/PersonalKnowledgeGraph.tsx | 62 | useCallback | `[]` | ✅ Array Present |
| src/components/PersonalKnowledgeGraph.tsx | 69 | useCallback | `[]` | ✅ Array Present |
| src/components/PersonalKnowledgeGraph.tsx | 84 | useCallback | `[student.id]` | ✅ Array Present |
| src/components/PersonalKnowledgeGraph.tsx | 175 | useCallback | `[student.id]` | ✅ Array Present |
| src/components/PersonalKnowledgeGraph.tsx | 210 | useCallback | `[]` | ✅ Array Present |
| src/components/SankalpSwitch.tsx | 27 | useEffect | `[isActive, session]` | ✅ Array Present |
| src/components/TopicMasteryGrid.tsx | 23 | useMemo | `[intelligence.mastery]` | ✅ Array Present |
| src/components/planner/FocusTimer.tsx | 60 | useMemo | `[studyMaterials]` | ✅ Array Present |
| src/components/planner/FocusTimer.tsx | 137 | useEffect | `[isRunning, timeLeft]` | ✅ Array Present |
| src/components/planner/FocusTimer.tsx | 155 | useEffect | `[timeLeft, isRunning]` | ✅ Array Present |
| src/components/planner/ScheduleView.tsx | 21 | useMemo | `[studyMaterials]` | ✅ Array Present |
| src/components/planner/StudyLibrary.tsx | 36 | useMemo | `[studyMaterials]` | ✅ Array Present |
| src/components/planner/StudyLibrary.tsx | 39 | useMemo | `[studyMaterials, searchTerm, filterSubject]` | ✅ Array Present |
| src/components/settings/StudentProfileForm.tsx | 47 | useEffect | `[user, toast]` | ✅ Array Present |
| src/components/settings/TeacherProfileForm.tsx | 41 | useEffect | `[user, toast]` | ✅ Array Present |
