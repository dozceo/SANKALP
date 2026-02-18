# Internationalization (i18n) Readiness Report

This report identifies potential hardcoded strings in JSX that need to be externalized for localization.

## Summary
- Total Files Scanned: 125
- Files with Hardcoded Strings: 50
- Total Hardcoded Strings Detected: 444

## Files Requiring Attention
### src/app/(main)/teacher/classes/[classId]/page.tsx (27 strings)
- `Class Not Found`
- `Back to Classes`
- `Back`
- `Class Code`
- `Copied`
- ... and 22 more

### src/app/(main)/teacher/classes/page.tsx (25 strings)
- `My Classes`
- `Manage your classes and students`
- `Create Class`
- `Create New Class`
- `Class Name`
- ... and 20 more

### src/app/(main)/teacher/students/page.tsx (23 strings)
- `s.progress`
- `Students`
- `Monitor student performance and engagement`
- `Total Students`
- `At-Risk Students`
- ... and 18 more

### src/app/(main)/home/page.tsx (22 strings)
- `Failed to load student intelligence`
- `Take Quiz`
- `Test your knowledge`
- `Start Quiz`
- `Revision Plan`
- ... and 17 more

### src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx (19 strings)
- `Student Analytics`
- `Subject Performance`
- `Mastery level across different subjects`
- `No performance data available`
- `Strengths`
- ... and 14 more

### src/app/(main)/teacher/students/[studentId]/page.tsx (19 strings)
- `Student Not Found`
- `Back to Students`
- `Back`
- `Avg. Score`
- `Quizzes Taken`
- ... and 14 more

### src/app/(main)/settings/page.tsx (18 strings)
- `Settings`
- `General`
- `Profile`
- `Appearance`
- `Theme`
- ... and 13 more

### src/app/test-accessibility/page.tsx (18 strings)
- `Accessibility Test Page`
- `Buttons`
- `Default Button`
- `Destructive`
- `Outline`
- ... and 13 more

### src/app/(main)/quiz/page.tsx (15 strings)
- `Take Another Quiz`
- `Submit Answer`
- `Adaptive Quiz Engine`
- `Create a Quiz`
- `Topic`
- ... and 10 more

### src/components/InteractiveGraph.tsx (15 strings)
- `void;
  onZoom: (factor: number, ref: MutableRefObject`
- `void;
  onReset: (ref: MutableRefObject`
- `Show All`
- `High Risk Students`
- `Topics Only`
- ... and 10 more

### src/app/(main)/classes/page.tsx (14 strings)
- `My Classroom`
- `This will remove you from`
- `Cancel`
- `Leave Class`
- `Official Enrolled Class`
- ... and 9 more

### src/components/planner/AddStudyMaterial.tsx (14 strings)
- `Add New Study Material`
- `Subject`
- `Topic`
- `Detailed Notes`
- `Reference Links`
- ... and 9 more

### src/app/(auth)/teacher-onboarding/page.tsx (12 strings)
- `Teacher Setup`
- `Your Full Name`
- `Subjects`
- `Grade Levels`
- `About your institution`
- ... and 7 more

### src/app/(main)/syllabus/page.tsx (12 strings)
- `Syllabus`
- `Syllabus Finder`
- `Search Failed`
- `Structure`
- `Strategy & Timeline`
- ... and 7 more

### src/components/profile/StudentProfile.tsx (12 strings)
- `Student Profile Not Found`
- `Sankalp High`
- `Edit Profile`
- `About`
- `Subject Mastery`
- ... and 7 more

### src/components/SankalpSwitch.tsx (11 strings)
- `SANKALP Loop`
- `Session Duration`
- `15 minutes`
- `30 minutes`
- `45 minutes`
- ... and 6 more

### src/components/planner/FocusTimer.tsx (11 strings)
- `Pomodoro`
- `No topics available`
- `25-min Focus`
- `5-min Break`
- `15-min Long Break`
- ... and 6 more

### src/app/(auth)/sign-up/page.tsx (10 strings)
- `Create an Account`
- `I am a`
- `Student`
- `Teacher`
- `Full Name`
- ... and 5 more

### src/app/(main)/rewards/page.tsx (10 strings)
- `Your Rewards & Progress`
- `Current Streak`
- `days`
- `Overall Mastery`
- `Your average mastery across all subjects is`
- ... and 5 more

### src/components/planner/StudyLibrary.tsx (10 strings)
- `Your Study Library`
- `All Subjects`
- `No study materials found`
- `View Details`
- `Notes`
- ... and 5 more

### src/components/profile/TeacherProfile.tsx (9 strings)
- `Teacher Profile Not Found`
- `Educator`
- `Edit Profile`
- `Professional Summary`
- `Subjects & Expertise`
- ... and 4 more

### src/app/(main)/brain-map/page.tsx (8 strings)
- `My Brain Map`
- `Visualize your learning journey and mastery`
- `Mastery`
- `Legend`
- `Me`
- ... and 3 more

### src/app/(main)/chat/page.tsx (8 strings)
- `Start Audio Conversation`
- `English`
- `Spanish`
- `French`
- `Hindi`
- ... and 3 more

### src/app/(main)/teacher/page.tsx (8 strings)
- `Student`
- `Syllabus Progress`
- `Absentee Streak`
- `Predicted Dropout Risk`
- `Actions`
- ... and 3 more

### src/components/settings/StudentProfileForm.tsx (8 strings)
- `Student Profile`
- `Your Name`
- `Grade/Class`
- `Subjects`
- `Daily Study Time`
- ... and 3 more

### src/components/settings/TeacherProfileForm.tsx (8 strings)
- `Teacher Profile`
- `Your Name`
- `Subjects`
- `Grade Levels`
- `School/Institution Name`
- ... and 3 more

### src/app/(auth)/login/page.tsx (7 strings)
- `Welcome Back`
- `Email`
- `Password`
- `Or continue with`
- `Google`
- ... and 2 more

### src/components/PersonalKnowledgeGraph.tsx (7 strings)
- `My Knowledge Network`
- `title="Zoom in"`
- `aria-label="Zoom in"`
- `title="Zoom out"`
- `aria-label="Zoom out"`
- ... and 2 more

### src/components/planner/ScheduleView.tsx (6 strings)
- `AI Generated Plan`
- `An Error Occurred`
- `Revise Now`
- `Upcoming Deadlines`
- `Materials that need review soon`
- ... and 1 more

### src/app/(main)/planner/page.tsx (5 strings)
- `My Planner`
- `Add Data`
- `Organize`
- `Schedule`
- `Focus Timer`

### src/components/LearningStateCard.tsx (5 strings)
- `Learning State`
- `Attention Risk`
- `Mastery Level`
- `Learning Mode`
- `aria-label="More information about learning state"`

### src/components/app/teacher-sidebar-nav.tsx (5 strings)
- `SANKALP`
- `Teacher Portal`
- `My Teacher ID`
- `Help & Feedback`
- `title="Copy ID"`

### src/app/(auth)/onboarding/page.tsx (4 strings)
- `Progress`
- `placeholder="e.g. Alex Johnson"`
- `placeholder="Other goals..."`
- `placeholder="e.g., MATH2024-A"`

### src/components/TopicMasteryGrid.tsx (4 strings)
- `Real-time predictions based on your quiz history and revision patterns`
- `aria-label="High Priority"`
- `aria-label="Strong Mastery"`
- `aria-label="Standard Priority"`

### src/components/app/header.tsx (4 strings)
- `Toggle theme`
- `Light`
- `Dark`
- `System`

### src/components/app/sidebar-nav.tsx (4 strings)
- `SANKALP`
- `My User ID`
- `Help & Feedback`
- `title="Copy ID"`

### src/components/theme-toggle.tsx (4 strings)
- `Toggle theme`
- `Light`
- `Dark`
- `System`

### src/app/(main)/mentor/page.tsx (3 strings)
- `Mindful Mentor`
- `Your Private Counselor`
- `placeholder="Tell me what's on your mind..."`

### src/components/ErrorBoundary.tsx (3 strings)
- `Something went wrong`
- `Stack trace`
- `Reload Page`

### src/components/ui/sidebar.tsx (3 strings)
- `Toggle Sidebar`
- `aria-label="Toggle Sidebar"`
- `title="Toggle Sidebar"`

### src/app/(auth)/join-class/page.tsx (2 strings)
- `Join a Class`
- `Join Class`

### src/app/(main)/teacher/student/[studentId]/page.tsx (2 strings)
- `Student Not Found`
- `Back to Teacher Dashboard`

### src/components/ui/carousel.tsx (2 strings)
- `Previous slide`
- `Next slide`

### src/components/ui/sheet.tsx (2 strings)
- `Mobile Menu`
- `Close`

### src/app/(main)/profile/page.tsx (1 strings)
- `Please Log In`

### src/app/api/intelligence/student/route.ts (1 strings)
- `r.topic))];

        // Process each topic through ML → ADK pipeline
        const mastery: Record`

### src/app/api/teacher/students/route.ts (1 strings)
- `0 ? totalScore / quizResults.length : 0;

            const topicMastery: Record`

### src/app/test-charts/page.tsx (1 strings)
- `Charts Visual Regression Test Page`

### src/components/ui/dialog.tsx (1 strings)
- `Close`

### src/components/ui/toast.tsx (1 strings)
- `type ToastActionElement = React.ReactElement`

