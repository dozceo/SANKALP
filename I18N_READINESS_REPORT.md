# i18n Readiness Assessment Report

This report identifies potential hardcoded user-facing strings that need externalization.

## src/app/(auth)/join-class/page.tsx
- **Hardcoded Strings Found**: 5
- **Examples**: "Join a Class", "Enter the 6-character code provided by your teacher.", "Joining..."...

## src/app/(auth)/login/page.tsx
- **Hardcoded Strings Found**: 10
- **Examples**: "Welcome Back", "Enter your credentials to access your account.", "Email"...

## src/app/(auth)/onboarding/page.tsx
- **Hardcoded Strings Found**: 9
- **Examples**: "val?.toUpperCase() || ""),
});

type OnboardingFormData = z.infer", "Progress", "Tell us a bit about yourself to personalize your experience."...

## src/app/(auth)/sign-up/page.tsx
- **Hardcoded Strings Found**: 13
- **Examples**: "Create an Account", "Enter your information to get started.", "I am a"...

## src/app/(auth)/teacher-onboarding/page.tsx
- **Hardcoded Strings Found**: 18
- **Examples**: "Teacher Setup", "Welcome, Teacher!", "Let's set up your teaching dashboard and personalized tools."...

## src/app/(main)/brain-map/page.tsx
- **Hardcoded Strings Found**: 10
- **Examples**: "My Brain Map", "Visualize your learning journey and mastery", "Mastery"...

## src/app/(main)/chat/page.tsx
- **Hardcoded Strings Found**: 14
- **Examples**: "([]);
    const [input, setInput] = useState("");
    const [language, setLanguage] = useState("English");
    const [isLoading, setIsLoading] = useState(false);
    const [audioPlaying, setAudioPlaying] = useState", "(null);
    const [audioLoading, setAudioLoading] = useState", "(null);
    const [isAudioChatOpen, setIsAudioChatOpen] = useState(false);

    const scrollAreaRef = useRef"...

## src/app/(main)/classes/page.tsx
- **Hardcoded Strings Found**: 28
- **Examples**: "My Classroom", "You are currently enrolled in an active class.", "}
                                Leave Class"...

## src/app/(main)/home/page.tsx
- **Hardcoded Strings Found**: 28
- **Examples**: "Failed to load student intelligence", "Here&apos;s your AI-powered learning dashboard for today.", "Take Quiz"...

## src/app/(main)/mentor/page.tsx
- **Hardcoded Strings Found**: 5
- **Examples**: "Mindful Mentor", "Your personal AI counselor for academic and emotional support.", "Your Private Counselor"...

## src/app/(main)/planner/page.tsx
- **Hardcoded Strings Found**: 6
- **Examples**: "My Planner", "Your central hub for organizing, scheduling, and tackling your studies.", "Add Data"...

## src/app/(main)/profile/page.tsx
- **Hardcoded Strings Found**: 3
- **Examples**: "Please Log In", "You must be logged in to view your profile.", ";
    }

    // Default to student profile for 'student' role or as fallback
    return"

## src/app/(main)/quiz/page.tsx
- **Hardcoded Strings Found**: 22
- **Examples**: "(null);
  const [isFallback, setIsFallback] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState", "(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState", "Generating your custom quiz..."...

## src/app/(main)/rewards/page.tsx
- **Hardcoded Strings Found**: 19
- **Examples**: "Your Rewards & Progress", "Stay motivated by tracking your achievements and streaks.", "Current Streak"...

## src/app/(main)/settings/page.tsx
- **Hardcoded Strings Found**: 27
- **Examples**: "Settings", "Manage your account, appearance, and data preferences.", "General"...

## src/app/(main)/syllabus/page.tsx
- **Hardcoded Strings Found**: 23
- **Examples**: "(null);
  const [source, setSource] = useState", "(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState", "Syllabus"...

## src/app/(main)/teacher/classes/[classId]/page.tsx
- **Hardcoded Strings Found**: 33
- **Examples**: "(null);
    const [students, setStudents] = useState", "Class Not Found", "The class you're looking for doesn't exist."...

## src/app/(main)/teacher/classes/page.tsx
- **Hardcoded Strings Found**: 37
- **Examples**: "([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState", "(null);

  // Enhanced filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState", "("all");
  const [gradeFilter, setGradeFilter] = useState"...

## src/app/(main)/teacher/page.tsx
- **Hardcoded Strings Found**: 12
- **Examples**: "([]);
  const [graphData, setGraphData] = useState", "A real-time heatmap of class performance and student risk factors.", "Export Analytics (CSV)"...

## src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx
- **Hardcoded Strings Found**: 25
- **Examples**: "Student Analytics", "Subject Performance", "Mastery level across different subjects"...

## src/app/(main)/teacher/student/[studentId]/page.tsx
- **Hardcoded Strings Found**: 2
- **Examples**: "Student Not Found", "Back to Teacher Dashboard"

## src/app/(main)/teacher/students/[studentId]/page.tsx
- **Hardcoded Strings Found**: 24
- **Examples**: ";
    if (trend === 'down') return", ";
    return", "(null);
    const [performance, setPerformance] = useState"...

## src/app/(main)/teacher/students/page.tsx
- **Hardcoded Strings Found**: 32
- **Examples**: "([]);
    const [classes, setClasses] = useState", "([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters and search
    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState", "("all");
    const [performanceFilter, setPerformanceFilter] = useState"...

## src/app/api/intelligence/student/route.ts
- **Hardcoded Strings Found**: 3
- **Examples**: "r.topic))];

        // Process each topic through ML → ADK pipeline
        const mastery: Record", ";
            mlPrediction: Partial", "| null;
        };
        const topicData: TopicData[] = [];
        const topicsToPredict: Array"

## src/app/api/teacher/students/route.ts
- **Hardcoded Strings Found**: 1
- **Examples**: "0 ? totalScore / quizResults.length : 0;

            const topicMastery: Record"

## src/app/page.tsx
- **Hardcoded Strings Found**: 1
- **Examples**: "Loading your personalized learning space..."

## src/app/test-accessibility/page.tsx
- **Hardcoded Strings Found**: 18
- **Examples**: "Accessibility Test Page", "Buttons", "Default Button"...

## src/app/test-charts/page.tsx
- **Hardcoded Strings Found**: 1
- **Examples**: "Charts Visual Regression Test Page"

## src/components/ErrorBoundary.tsx
- **Hardcoded Strings Found**: 4
- **Examples**: "Something went wrong", "We apologize for the inconvenience. The error has been logged and we'll look into it.", "Stack trace"...

## src/components/InteractiveGraph.tsx
- **Hardcoded Strings Found**: 27
- **Examples**: ">();
  const modalGraphRef = useRef", ">();
  const containerRef = useRef", "(null);
  const [filter, setFilter] = useState"...

## src/components/LearningStateCard.tsx
- **Hardcoded Strings Found**: 6
- **Examples**: "Learning State", "Attention Risk", "Mastery Level"...

## src/components/PersonalKnowledgeGraph.tsx
- **Hardcoded Strings Found**: 11
- **Examples**: ">();
    const containerRef = useRef", "handleZoom(1.5)}
                    className="p-1.5 bg-secondary/80 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                    title="Zoom in"
                    aria-label="Zoom in"
                >", "handleZoom(0.67)}
                    className="p-1.5 bg-secondary/80 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                    title="Zoom out"
                    aria-label="Zoom out"
                >"...

## src/components/SankalpSwitch.tsx
- **Hardcoded Strings Found**: 15
- **Examples**: "(30);
    const [session, setSession] = useState", "(null);
    const [timeRemaining, setTimeRemaining] = useState", "SANKALP Loop"...

## src/components/TopicMasteryGrid.tsx
- **Hardcoded Strings Found**: 7
- **Examples**: "Topic Mastery (ML-Predicted)", "Real-time predictions based on your quiz history and revision patterns", ") : isStrong ? ("...

## src/components/app/audio-conversation.tsx
- **Hardcoded Strings Found**: 3
- **Examples**: "("idle");
  const mediaRecorderRef = useRef", "(null);
  const audioChunksRef = useRef", "([]);
  const audioPlayerRef = useRef"

## src/components/app/header.tsx
- **Hardcoded Strings Found**: 7
- **Examples**: "Toggle theme", "setTheme("light")}>", "Light"...

## src/components/app/sidebar-nav.tsx
- **Hardcoded Strings Found**: 5
- **Examples**: "SANKALP", "item.type === "separator" ? (", "My User ID"...

## src/components/app/teacher-sidebar-nav.tsx
- **Hardcoded Strings Found**: 7
- **Examples**: "SANKALP", "Teacher Portal", "e.preventDefault()}
                                >"...

## src/components/planner/AddStudyMaterial.tsx
- **Hardcoded Strings Found**: 18
- **Examples**: "Add New Study Material", "Input your new study information. This becomes the foundation for your flashcards and mind maps.", "Subject"...

## src/components/planner/FocusTimer.tsx
- **Hardcoded Strings Found**: 14
- **Examples**: "('25-min-focus');
    const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS[timerMode]);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef", "(null);
    const audioContextRef = useRef", "Pomodoro"...

## src/components/planner/ScheduleView.tsx
- **Hardcoded Strings Found**: 12
- **Examples**: "(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState", "AI Generated Plan", "Today's AI Suggestions - Click the button below to generate a personalized study plan for today."...

## src/components/planner/StudyLibrary.tsx
- **Hardcoded Strings Found**: 19
- **Examples**: "Loading...", "Your Study Library", "All your study materials in one place. Filter and search to manage your knowledge base."...

## src/components/profile/StudentProfile.tsx
- **Hardcoded Strings Found**: 17
- **Examples**: "Student Profile Not Found", "Sankalp High", "Edit Profile"...

## src/components/profile/TeacherProfile.tsx
- **Hardcoded Strings Found**: 12
- **Examples**: "Teacher Profile Not Found", "Educator", "Edit Profile"...

## src/components/settings/StudentProfileForm.tsx
- **Hardcoded Strings Found**: 10
- **Examples**: "Student Profile", "Update your personal information and study preferences.", "Your Name"...

## src/components/settings/TeacherProfileForm.tsx
- **Hardcoded Strings Found**: 10
- **Examples**: "Teacher Profile", "Update your professional information.", "Your Name"...

## src/components/theme-toggle.tsx
- **Hardcoded Strings Found**: 4
- **Examples**: "Toggle theme", "setTheme("light")}>
          Light", "setTheme("dark")}>
          Dark"...

## src/components/ui/alert.tsx
- **Hardcoded Strings Found**: 1
- **Examples**: "& VariantProps"

## src/components/ui/badge.tsx
- **Hardcoded Strings Found**: 1
- **Examples**: ",
    VariantProps"

## src/components/ui/button.tsx
- **Hardcoded Strings Found**: 1
- **Examples**: ",
    VariantProps"

## src/components/ui/carousel.tsx
- **Hardcoded Strings Found**: 3
- **Examples**: "[0]
  api: ReturnType", "Previous slide", "Next slide"

## src/components/ui/chart.tsx
- **Hardcoded Strings Found**: 2
- **Examples**: ") : (
                      !hideIndicator && (", "&
    Pick"

## src/components/ui/dialog.tsx
- **Hardcoded Strings Found**: 1
- **Examples**: "Close"

## src/components/ui/form.tsx
- **Hardcoded Strings Found**: 2
- **Examples**: "= FieldPath", "= FieldPath"

## src/components/ui/label.tsx
- **Hardcoded Strings Found**: 1
- **Examples**: "&
    VariantProps"

## src/components/ui/sheet.tsx
- **Hardcoded Strings Found**: 4
- **Examples**: ",
    VariantProps", "Mobile Menu", "The main navigation menu for the application."...

## src/components/ui/sidebar.tsx
- **Hardcoded Strings Found**: 4
- **Examples**: "Toggle Sidebar", "} & VariantProps", "Toggle Sidebar"...

## src/components/ui/toast.tsx
- **Hardcoded Strings Found**: 1
- **Examples**: "&
    VariantProps"


**Total Files with Hardcoded Strings:** 58
**Total Hardcoded Strings Detected:** 658

## Localization Effort Estimate
- **Low Effort**: < 50 strings. Can be manually extracted in a day.
- **Medium Effort**: 50-200 strings. Requires dedicated sprint task.
- **High Effort**: > 200 strings. Significant architectural change needed.
