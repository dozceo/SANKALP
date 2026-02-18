"use client";

import { TopicMasteryGrid } from "@/components/TopicMasteryGrid";
import { InteractiveGraph } from "@/components/InteractiveGraph";
import StudentAnalyticsClient from "@/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient";
import { StudentIntelligence } from "@/types/intelligence";
import { GraphData } from "@/data/docsData";

const MOCK_INTELLIGENCE_DATA: StudentIntelligence = {
  mastery: {
    "Algebra": {
      score: 0.85,
      confidence: 0.9,
      daysSinceRevision: 5,
      attempts: 10,
      trend: "STABLE",
      needsRevision: false,
      priority: "LOW"
    },
    "Geometry": {
      score: 0.45,
      confidence: 0.7,
      daysSinceRevision: 20,
      attempts: 5,
      trend: "DECLINING",
      needsRevision: true,
      priority: "HIGH"
    },
    "Calculus": {
      score: 0.60,
      confidence: 0.8,
      daysSinceRevision: 2,
      attempts: 8,
      trend: "IMPROVING",
      needsRevision: false,
      priority: "MEDIUM"
    }
  },
  attentionRisk: "MEDIUM",
  revisionUrgency: "SCHEDULED",
  adkDecision: "PROGRESS_MODE",
  confidence: "HIGH",
  generatedAt: new Date().toISOString(),
  studentId: "student-123",
  reasoning: ["Strong algebra skills", "Geometry needs revision"],
  flags: []
};

const MOCK_GRAPH_DATA: GraphData = {
  nodes: [
    { id: "node-1", name: "Math", val: 20, type: "subject", color: "#3b82f6" },
    { id: "node-2", name: "Algebra", val: 15, type: "topic", color: "#6b7280" },
    { id: "node-3", name: "Geometry", val: 15, type: "topic", color: "#ef4444" },
    { id: "node-4", name: "Calculus", val: 15, type: "topic", color: "#f59e0b" }
  ],
  links: [
    { source: "node-1", target: "node-2" },
    { source: "node-1", target: "node-3" },
    { source: "node-1", target: "node-4" }
  ]
};

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
    <div className="container mx-auto p-8 space-y-12">
      <h1 className="text-3xl font-bold mb-8">Visual Regression Test Page - Charts</h1>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Teacher Analytics (StudentAnalyticsClient)</h2>
        <div className="border p-4 rounded-lg bg-white">
            <StudentAnalyticsClient
                student={MOCK_STUDENT}
                performance={MOCK_PERFORMANCE}
            />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Topic Mastery Grid (Student Dashboard)</h2>
        <TopicMasteryGrid intelligence={MOCK_INTELLIGENCE_DATA} />
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Interactive Knowledge Graph (Student Dashboard)</h2>
        <div className="h-[500px] border rounded-lg bg-slate-50 relative overflow-hidden">
          <InteractiveGraph graphData={MOCK_GRAPH_DATA} />
        </div>
      </section>
    </div>
  );
}
