import StudentAnalyticsClient from "@/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient";

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

export default function ChartsTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Charts Visual Regression Test Page</h1>
      <StudentAnalyticsClient
        student={MOCK_STUDENT}
        performance={MOCK_PERFORMANCE}
      />
    </div>
  );
}
