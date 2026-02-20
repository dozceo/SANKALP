import StudentAnalyticsClient from "@/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient";
import { InteractiveGraph } from "@/components/InteractiveGraph";

const MOCK_STUDENT = {
  id: "student-123",
  name: "John Doe",
  email: "john.doe@example.com",
  grade: "10",
  lastLoginDate: "2023-10-27T10:00:00Z",
  chatbotPersonality: "friendly-encouraging",
  chatbotInstructions: "Use analogies related to sports.",
};

const MOCK_PERFORMANCE = {
  avgScore: 75,
  quizzesTaken: 10,
  topicMastery: {
    "Math": { avg: 80, count: 5, trend: "up" },
    "Science": { avg: 70, count: 3, trend: "stable" },
    "History": { avg: 60, count: 2, trend: "down" },
  },
  recentQuizzes: [],
  strengths: ["Algebra", "Physics"],
  weaknesses: ["Geometry", "Chemistry"],
  riskLevel: "Low" as const,
};

const MOCK_GRAPH_DATA = {
  nodes: [
    { id: "student-1", name: "Student A", type: "student", val: 20 },
    { id: "student-2", name: "Student B", type: "student", val: 20 },
    { id: "topic-1", name: "Algebra", type: "topic", val: 10 },
    { id: "topic-2", name: "Physics", type: "topic", val: 10 },
  ],
  links: [
    { source: "student-1", target: "topic-1" },
    { source: "student-1", target: "topic-2" },
    { source: "student-2", target: "topic-1" },
  ]
};

export default function ChartsTestPage() {
  return (
    <div className="p-8 space-y-12">
      <div>
        <h1 className="text-2xl font-bold mb-6">Student Analytics Charts</h1>
        <StudentAnalyticsClient
          student={MOCK_STUDENT}
          performance={MOCK_PERFORMANCE}
        />
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-6">Teacher Network Graph</h1>
        <div className="border rounded-lg h-[500px] w-full bg-card overflow-hidden">
             <InteractiveGraph
                graphData={MOCK_GRAPH_DATA}
             />
        </div>
      </div>
    </div>
  );
}
