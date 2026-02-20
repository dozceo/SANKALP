# Internationalization (i18n) Readiness Assessment

This report identifies hardcoded strings in the codebase that need to be externalized for multi-language support.

## Summary
- Files with Hardcoded Strings: 79
- Total Strings to Externalize: 956

## Detailed Findings
The following files contain hardcoded user-facing text.

### `src/app/(auth)/join-class/page.tsx`
- **Text Content** (6):
  - ");
  }

  return ("
  - "Join a Class"
  - "Enter the 6-character code provided by your teacher."
  - "Joining..."
  - ") : ("
  - ... and 1 more
- **Attributes** (1):
  - placeholder: "X Y Z 1 2 3"

### `src/app/(auth)/login/page.tsx`
- **Text Content** (10):
  - "Welcome Back"
  - "Enter your credentials to access your account."
  - "Email"
  - "Password"
  - "Forgot password?"
  - ... and 5 more
- **Attributes** (1):
  - placeholder: "m@example.com"

### `src/app/(auth)/onboarding/page.tsx`
- **Text Content** (10):
  - "val?.toUpperCase() || ""),
});

type OnboardingFormData = z.infer"
  - "prev + 1);
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  return ("
  - "Progress"
  - "Tell us a bit about yourself to personalize your experience."
  - "Select the ones you want to focus on this year."
  - ... and 5 more
- **Attributes** (3):
  - placeholder: "e.g. Alex Johnson"
  - placeholder: "Other goals..."
  - placeholder: "e.g., MATH2024-A"

### `src/app/(auth)/sign-up/page.tsx`
- **Text Content** (12):
  - "Create an Account"
  - "Enter your information to get started."
  - "I am a"
  - "setValue("role", val as "student" | "teacher")}
              className="flex gap-4"
            >"
  - "Student"
  - ... and 7 more
- **Attributes** (2):
  - placeholder: "Alex Doe"
  - placeholder: "m@example.com"

### `src/app/(auth)/teacher-onboarding/page.tsx`
- **Text Content** (21):
  - "prev + 1);
        }
    };

    const prevStep = () => setStep((prev) => prev - 1);

    return ("
  - "Teacher Setup"
  - "👨‍🏫"
  - "Welcome, Teacher!"
  - "Let's set up your teaching dashboard and personalized tools."
  - ... and 16 more
- **Attributes** (2):
  - placeholder: "e.g. Sarah Mitchell"
  - placeholder: "e.g. Springfield High School"

### `src/app/(main)/brain-map/page.tsx`
- **Text Content** (12):
  - ");
    }

    return ("
  - "My Brain Map"
  - "Visualize your learning journey and mastery"
  - "Mastery"
  - "This is your personal learning node. It connects to all the topics you have studied."
  - ... and 7 more

### `src/app/(main)/chat/page.tsx`
- **Text Content** (12):
  - "([]);
    const [input, setInput] = useState("");
    const [language, setLanguage] = useState("English");
    const [isLoading, setIsLoading] = useState(false);
    const [audioPlaying, setAudioPlaying] = useState"
  - "(null);
    const [audioLoading, setAudioLoading] = useState"
  - "(null);
    const [isAudioChatOpen, setIsAudioChatOpen] = useState(false);

    const scrollAreaRef = useRef"
  - "(null);
    const audioRef = useRef"
  - "setAudioPlaying(null);
            }
            audioRef.current.src = audioDataUri;
            audioRef.current.play();
            setAudioPlaying(message.id);
        }
    }

    return ("
  - ... and 7 more
- **Attributes** (3):
  - aria-label: "Chat message"
  - aria-label: "Send message"
  - title: "Send message"

### `src/app/(main)/classes/page.tsx`
- **Text Content** (33):
  - "My Classroom"
  - "You are currently enrolled in an active class."
  - "}
                                Leave Class"
  - "Are you sure?"
  - "This will remove you from"
  - ... and 28 more
- **Attributes** (1):
  - placeholder: "e.g. AB1234"

### `src/app/(main)/home/page.tsx`
- **Text Content** (31):
  - "Failed to load student intelligence"
  - ");
  }

  return ("
  - "Here&apos;s your AI-powered learning dashboard for today."
  - "Take Quiz"
  - "Test your knowledge"
  - ... and 26 more

### `src/app/(main)/mentor/page.tsx`
- **Text Content** (5):
  - "[...prev, botMessage]);
        setIsLoading(false);
    };

    return ("
  - "Mindful Mentor"
  - "Your personal AI counselor for academic and emotional support."
  - "Your Private Counselor"
  - "A safe space to talk about your challenges."
- **Attributes** (1):
  - placeholder: "Tell me what's on your mind..."

### `src/app/(main)/planner/page.tsx`
- **Text Content** (6):
  - "My Planner"
  - "Your central hub for organizing, scheduling, and tackling your studies."
  - "Add Data"
  - "Organize"
  - "Schedule"
  - ... and 1 more

### `src/app/(main)/profile/page.tsx`
- **Text Content** (3):
  - "Please Log In"
  - "You must be logged in to view your profile."
  - ";
    }

    // Default to student profile for 'student' role or as fallback
    return"

### `src/app/(main)/quiz/page.tsx`
- **Text Content** (27):
  - "(null);
  const [isFallback, setIsFallback] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState"
  - "(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState"
  - "Generating your custom quiz..."
  - "0) ? (score / quizLength) * 100 : 0;
    return ("
  - "Quiz Complete!"
  - ... and 22 more
- **Attributes** (3):
  - placeholder: "e.g., Photosynthesis"
  - placeholder: "e.g., High School Biology"
  - placeholder: "Select difficulty"

### `src/app/(main)/rewards/page.tsx`
- **Text Content** (26):
  - ";
  }

  // Derive all data using utility functions
  const subjectsMastery = getSubjectMastery(currentStudent);
  const averageMastery = getOverallMastery(currentStudent);
  const progressData = getProgressProjection(currentStudent);
  const studentBadges = getStudentBadges(currentStudent);

  return ("
  - "Your Rewards & Progress"
  - "Stay motivated by tracking your achievements and streaks."
  - "Current Streak"
  - "days"
  - ... and 21 more

### `src/app/(main)/settings/page.tsx`
- **Text Content** (26):
  - "Settings"
  - "Manage your account, appearance, and data preferences."
  - "General"
  - "Profile"
  - "Appearance"
  - ... and 21 more
- **Attributes** (1):
  - placeholder: "Select language"

### `src/app/(main)/syllabus/page.tsx`
- **Text Content** (23):
  - "(null);
  const [source, setSource] = useState"
  - "(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState"
  - "= 1;

  return ("
  - "Syllabus"
  - "(Activates 3 days before exam)"
  - ... and 18 more
- **Attributes** (1):
  - placeholder: "e.g., 'AP Calculus BC', 'NEET Biology'"

### `src/app/(main)/teacher/classes/[classId]/page.tsx`
- **Text Content** (38):
  - "(null);
    const [students, setStudents] = useState"
  - "Class Not Found"
  - "The class you're looking for doesn't exist."
  - "router.push("/teacher/classes")}>"
  - "Back to Classes"
  - ... and 33 more
- **Attributes** (1):
  - placeholder: "Search students..."

### `src/app/(main)/teacher/classes/page.tsx`
- **Text Content** (40):
  - "([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState"
  - "(null);

  // Enhanced filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState"
  - "("all");
  const [gradeFilter, setGradeFilter] = useState"
  - "("all");
  const [sortBy, setSortBy] = useState"
  - "("recent");

  const form = useForm"
  - ... and 35 more
- **Attributes** (6):
  - placeholder: "e.g. Physics 101"
  - placeholder: "e.g. Physics"
  - placeholder: "e.g. 10th Grade"
  - placeholder: "Search classes..."
  - placeholder: "Subject"
  - ... and 1 more

### `src/app/(main)/teacher/page.tsx`
- **Text Content** (15):
  - "([]);
  const [graphData, setGraphData] = useState"
  - ");
  }

  return ("
  - "A real-time heatmap of class performance and student risk factors."
  - "Export Analytics (CSV)"
  - "Monitor student progress and identify who might need extra help."
  - ... and 10 more

### `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx`
- **Text Content** (32):
  - "Student Analytics"
  - "Subject Performance"
  - "Mastery level across different subjects"
  - "0 ? ("
  - "value.length > 10 ? value.slice(0, 10) + '...' : value}
                    />"
  - ... and 27 more
- **Attributes** (2):
  - placeholder: "Select a tone"
  - placeholder: "e.g., Use analogies related to sports when explaining concepts..."

### `src/app/(main)/teacher/student/[studentId]/page.tsx`
- **Text Content** (3):
  - "Student Not Found"
  - "Back to Teacher Dashboard"
  - ");
  }

  return"

### `src/app/(main)/teacher/students/[studentId]/page.tsx`
- **Text Content** (28):
  - ";
    if (trend === 'down') return"
  - ";
    return"
  - "(null);
    const [performance, setPerformance] = useState"
  - "Student Not Found"
  - "router.push("/teacher/students")}>"
  - ... and 23 more

### `src/app/(main)/teacher/students/page.tsx`
- **Text Content** (33):
  - "([]);
    const [classes, setClasses] = useState"
  - "([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters and search
    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState"
  - "("all");
    const [performanceFilter, setPerformanceFilter] = useState"
  - "("all");
    const [activityFilter, setActivityFilter] = useState"
  - "("all");
    const [sortBy, setSortBy] = useState"
  - ... and 28 more
- **Attributes** (4):
  - placeholder: "Search students..."
  - placeholder: "Class"
  - placeholder: "Performance"
  - placeholder: "Sort by"

### `src/app/api/intelligence/student/route.ts`
- **Text Content** (3):
  - "r.topic))];

        // Process each topic through ML → ADK pipeline
        const mastery: Record"
  - ";
            mlPrediction: Partial"
  - "| null;
        };
        const topicData: TopicData[] = [];
        const topicsToPredict: Array"

### `src/app/api/teacher/students/route.ts`
- **Text Content** (1):
  - "0 ? totalScore / quizResults.length : 0;

            const topicMastery: Record"

### `src/app/page.tsx`
- **Text Content** (1):
  - "Loading your personalized learning space..."

### `src/app/test-accessibility/page.tsx`
- **Text Content** (15):
  - "Accessibility Test Page"
  - "Buttons"
  - "Default Button"
  - "Destructive"
  - "Outline"
  - ... and 10 more
- **Attributes** (3):
  - aria-label: "Icon Button"
  - placeholder: "Email"
  - placeholder: "No Label Input"

### `src/app/test-charts/page.tsx`
- **Text Content** (1):
  - "Charts Visual Regression Test Page"

### `src/components/ErrorBoundary.tsx`
- **Text Content** (4):
  - "Something went wrong"
  - "We apologize for the inconvenience. The error has been logged and we'll look into it."
  - "Stack trace"
  - "window.location.reload()}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                            Reload Page"

### `src/components/InteractiveGraph.tsx`
- **Text Content** (23):
  - ">();
  const modalGraphRef = useRef"
  - ">();
  const containerRef = useRef"
  - "(null);
  const [filter, setFilter] = useState"
  - "('all');

  // Optimization: Use refs for frequent updates to avoid re-creating canvas functions
  const hoveredNodeRef = useRef"
  - "(null);
  const highlightedNodeRef = useRef"
  - ... and 18 more
- **Attributes** (6):
  - aria-label: "Close fullscreen view"
  - aria-label: "Filter Graph"
  - aria-label: "Zoom In"
  - aria-label: "Zoom Out"
  - aria-label: "Reset View"
  - ... and 1 more

### `src/components/LearningStateCard.tsx`
- **Text Content** (7):
  - "Learning State"
  - "Attention Risk"
  - "Mastery Level"
  - "Learning Mode"
  - "0 && ("
  - ... and 2 more
- **Attributes** (1):
  - aria-label: "More information about learning state"

### `src/components/LogoutButton.tsx`
- **Text Content** (1):
  - ") : ("

### `src/components/PersonalKnowledgeGraph.tsx`
- **Text Content** (5):
  - ">();
    const containerRef = useRef"
  - "handleZoom(1.5)}
                    className="p-1.5 bg-secondary/80 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                    title="Zoom in"
                    aria-label="Zoom in"
                >"
  - "handleZoom(0.67)}
                    className="p-1.5 bg-secondary/80 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                    title="Zoom out"
                    aria-label="Zoom out"
                >"
  - "My Knowledge Network"
  - "'replace'}
            />"
- **Attributes** (6):
  - title: "Zoom in"
  - aria-label: "Zoom in"
  - title: "Zoom out"
  - aria-label: "Zoom out"
  - title: "Reset view"
  - ... and 1 more

### `src/components/SankalpSwitch.tsx`
- **Text Content** (15):
  - "(30);
    const [session, setSession] = useState"
  - "(null);
    const [timeRemaining, setTimeRemaining] = useState"
  - "SANKALP Loop"
  - "Session status:"
  - "Session Duration"
  - ... and 10 more
- **Attributes** (1):
  - aria-label: "Select session duration"

### `src/components/TopicMasteryGrid.tsx`
- **Text Content** (8):
  - "Object.entries(intelligence.mastery), [intelligence.mastery]);

    return ("
  - "Topic Mastery (ML-Predicted)"
  - "Real-time predictions based on your quiz history and revision patterns"
  - "= 0.7;

                    return ("
  - ") : isStrong ? ("
  - ... and 3 more
- **Attributes** (3):
  - aria-label: "High Priority"
  - aria-label: "Strong Mastery"
  - aria-label: "Standard Priority"

### `src/components/app/audio-conversation.tsx`
- **Text Content** (3):
  - "("idle");
  const mediaRecorderRef = useRef"
  - "(null);
  const audioChunksRef = useRef"
  - "([]);
  const audioPlayerRef = useRef"

### `src/components/app/header.tsx`
- **Text Content** (7):
  - "Toggle theme"
  - "setTheme("light")}>"
  - "Light"
  - "setTheme("dark")}>"
  - "Dark"
  - ... and 2 more

### `src/components/app/sidebar-nav.tsx`
- **Text Content** (6):
  - "SANKALP"
  - "item.type === "separator" ? ("
  - ") : ("
  - ")
          )}"
  - "My User ID"
  - ... and 1 more
- **Attributes** (1):
  - title: "Copy ID"

### `src/components/app/teacher-sidebar-nav.tsx`
- **Text Content** (7):
  - "SANKALP"
  - "Teacher Portal"
  - "e.preventDefault()}
                                >"
  - "Soon"
  - ") : ("
  - ... and 2 more
- **Attributes** (1):
  - title: "Copy ID"

### `src/components/planner/AddStudyMaterial.tsx`
- **Text Content** (14):
  - "Add New Study Material"
  - "Input your new study information. This becomes the foundation for your flashcards and mind maps."
  - "Subject"
  - "Topic"
  - "Chapter (Optional)"
  - ... and 9 more
- **Attributes** (5):
  - placeholder: "e.g., Physics"
  - placeholder: "e.g., Newton's Laws of Motion"
  - placeholder: "e.g., Chapter 3: Motion"
  - placeholder: "Add your notes, key concepts, and summaries here..."
  - placeholder: "https://example.com"

### `src/components/planner/FocusTimer.tsx`
- **Text Content** (15):
  - "('25-min-focus');
    const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS[timerMode]);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef"
  - "(null);
    const audioContextRef = useRef"
  - "Pomodoro"
  - "What do you want to study?"
  - "0 ? (
                                topics.map(topic => ("
  - ... and 10 more
- **Attributes** (2):
  - placeholder: "Select a topic"
  - aria-label: "Time remaining"

### `src/components/planner/ScheduleView.tsx`
- **Text Content** (15):
  - "(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState"
  - "AI Generated Plan"
  - "Today's AI Suggestions - Click the button below to generate a personalized study plan for today."
  - "Generating..."
  - ") : (
                                "Generate Today's Plan"
                            )}"
  - ... and 10 more

### `src/components/planner/StudyLibrary.tsx`
- **Text Content** (18):
  - "Loading..."
  - ";
    }

    return ("
  - "Your Study Library"
  - "All your study materials in one place. Filter and search to manage your knowledge base."
  - "setSearchTerm(e.target.value)}
                                className="pl-10"
                                aria-label="Search study materials"
                            />"
  - ... and 13 more
- **Attributes** (4):
  - placeholder: "Search topics..."
  - aria-label: "Search study materials"
  - aria-label: "Filter by subject"
  - placeholder: "Filter by subject"

### `src/components/profile/StudentProfile.tsx`
- **Text Content** (25):
  - "Student Profile Not Found"
  - "Sankalp High"
  - "Edit Profile"
  - "About"
  - "Subject Mastery"
  - ... and 20 more

### `src/components/profile/TeacherProfile.tsx`
- **Text Content** (17):
  - "Teacher Profile Not Found"
  - "n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return ("
  - "Educator"
  - "Edit Profile"
  - "Professional Summary"
  - ... and 12 more

### `src/components/settings/StudentProfileForm.tsx`
- **Text Content** (9):
  - ";
    }

    return ("
  - "Student Profile"
  - "Update your personal information and study preferences."
  - "Your Name"
  - "Grade/Class"
  - ... and 4 more
- **Attributes** (2):
  - placeholder: "Enter your full name"
  - placeholder: "e.g., Score 95% in board exams, Master calculus, Improve problem-solving..."

### `src/components/settings/TeacherProfileForm.tsx`
- **Text Content** (9):
  - ";
    }

    return ("
  - "Teacher Profile"
  - "Update your professional information."
  - "Your Name"
  - "Subjects"
  - ... and 4 more
- **Attributes** (2):
  - placeholder: "Enter your full name"
  - placeholder: "e.g., Springfield High School"

### `src/components/theme-provider.tsx`
- **Text Content** (1):
  - "null,
}

const ThemeProviderContext = React.createContext"

### `src/components/theme-toggle.tsx`
- **Text Content** (4):
  - "Toggle theme"
  - "setTheme("light")}>
          Light"
  - "setTheme("dark")}>
          Dark"
  - "setTheme("system")}>
          System"

### `src/components/ui/accordion.tsx`
- **Text Content** (5):
  - ",
  React.ComponentPropsWithoutRef"
  - "))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"
  - "))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"

### `src/components/ui/alert-dialog.tsx`
- **Text Content** (13):
  - ",
  React.ComponentPropsWithoutRef"
  - "))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"
  - ") => ("
  - ") => ("
  - ... and 8 more

### `src/components/ui/alert.tsx`
- **Text Content** (3):
  - "& VariantProps"
  - "))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef"
  - "))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef"

### `src/components/ui/avatar.tsx`
- **Text Content** (5):
  - ",
  React.ComponentPropsWithoutRef"
  - "))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"
  - "))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"

### `src/components/ui/badge.tsx`
- **Text Content** (1):
  - ",
    VariantProps"

### `src/components/ui/button.tsx`
- **Text Content** (1):
  - ",
    VariantProps"

### `src/components/ui/card.tsx`
- **Text Content** (5):
  - "))
Card.displayName = "Card"

const CardHeader = React.forwardRef"
  - "))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef"
  - "))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef"
  - "))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef"
  - "))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef"

### `src/components/ui/carousel.tsx`
- **Text Content** (9):
  - "[0]
  api: ReturnType"
  - "[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext"
  - "")
  }

  return context
}

const Carousel = React.forwardRef"
  - ")
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef"
  - ")
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef"
  - ... and 4 more

### `src/components/ui/chart.tsx`
- **Text Content** (10):
  - "")
  }

  return context
}

const ChartContainer = React.forwardRef"
  - ")
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef"
  - "&
    React.ComponentProps"
  - ") : (
                      !hideIndicator && ("
  - ")
                    )}"
  - ... and 5 more

### `src/components/ui/checkbox.tsx`
- **Text Content** (1):
  - ",
  React.ComponentPropsWithoutRef"

### `src/components/ui/dialog.tsx`
- **Text Content** (10):
  - ",
  React.ComponentPropsWithoutRef"
  - "))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"
  - "Close"
  - ") => ("
  - ... and 5 more

### `src/components/ui/dropdown-menu.tsx`
- **Text Content** (15):
  - ",
  React.ComponentPropsWithoutRef"
  - "))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"
  - "))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"
  - ... and 10 more

### `src/components/ui/form.tsx`
- **Text Content** (8):
  - "= FieldPath"
  - "= FieldPath"
  - ")
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"
  - ")
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef"
  - ... and 3 more

### `src/components/ui/label.tsx`
- **Text Content** (2):
  - ",
  React.ComponentPropsWithoutRef"
  - "&
    VariantProps"

### `src/components/ui/menubar.tsx`
- **Text Content** (20):
  - "}

const Menubar = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"
  - "))
Menubar.displayName = MenubarPrimitive.Root.displayName

const MenubarTrigger = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"
  - "))
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

const MenubarSubTrigger = React.forwardRef"
  - ... and 15 more

### `src/components/ui/popover.tsx`
- **Text Content** (1):
  - ",
  React.ComponentPropsWithoutRef"

### `src/components/ui/progress.tsx`
- **Text Content** (1):
  - ",
  React.ComponentPropsWithoutRef"

### `src/components/ui/radio-group.tsx`
- **Text Content** (3):
  - ",
  React.ComponentPropsWithoutRef"
  - ")
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"

### `src/components/ui/scroll-area.tsx`
- **Text Content** (3):
  - ",
  React.ComponentPropsWithoutRef"
  - "))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"

### `src/components/ui/select.tsx`
- **Text Content** (13):
  - ",
  React.ComponentPropsWithoutRef"
  - "))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"
  - "))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"
  - ... and 8 more

### `src/components/ui/separator.tsx`
- **Text Content** (1):
  - ",
  React.ComponentPropsWithoutRef"

### `src/components/ui/sheet.tsx`
- **Text Content** (11):
  - ",
  React.ComponentPropsWithoutRef"
  - ",
    VariantProps"
  - "Mobile Menu"
  - "The main navigation menu for the application."
  - "Close"
  - ... and 6 more

### `src/components/ui/sidebar.tsx`
- **Text Content** (29):
  - "void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext"
  - "window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo"
  - ")
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef"
  - ")
    }

    return ("
  - ")
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef"
  - ... and 24 more
- **Attributes** (2):
  - aria-label: "Toggle Sidebar"
  - title: "Toggle Sidebar"

### `src/components/ui/slider.tsx`
- **Text Content** (1):
  - ",
  React.ComponentPropsWithoutRef"

### `src/components/ui/switch.tsx`
- **Text Content** (1):
  - ",
  React.ComponentPropsWithoutRef"

### `src/components/ui/table.tsx`
- **Text Content** (7):
  - "))
Table.displayName = "Table"

const TableHeader = React.forwardRef"
  - "))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef"
  - "))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef"
  - "))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef"
  - "))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef"
  - ... and 2 more

### `src/components/ui/tabs.tsx`
- **Text Content** (5):
  - ",
  React.ComponentPropsWithoutRef"
  - "))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"
  - "))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"

### `src/components/ui/toast.tsx`
- **Text Content** (13):
  - ",
  React.ComponentPropsWithoutRef"
  - ",
  React.ComponentPropsWithoutRef"
  - "&
    VariantProps"
  - ")
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef"
  - ",
  React.ComponentPropsWithoutRef"
  - ... and 8 more

### `src/components/ui/toaster.tsx`
- **Text Content** (1):
  - ")
      })}"

### `src/components/ui/tooltip.tsx`
- **Text Content** (1):
  - ",
  React.ComponentPropsWithoutRef"

## Recommendations
1. **Install i18n Library**: Use `next-intl` or `react-i18next`.
2. **Extract Strings**: Move the identified strings to JSON resource files (e.g., `en.json`).
3. **Replace with Keys**: Replace hardcoded strings with translation hooks (e.g., `t('welcome_message')`).
