"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ListChecks, FileQuestion, MessageCircle, Loader2, Book } from "lucide-react";
import { LearningStateCard } from "@/components/LearningStateCard";
import { TopicMasteryGrid } from "@/components/TopicMasteryGrid";
import { InteractiveGraph } from "@/components/InteractiveGraph";
import { useStudent } from "@/contexts/StudentContext";
import { generateStudentIntelligence } from "@/lib/generateStudentIntelligence";
import type { StudentIntelligence } from "@/types/intelligence";

export default function HomePage() {
  const { currentStudent } = useStudent();
  const [intelligence, setIntelligence] = useState<StudentIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentStudent) {
      // Generate intelligence from student data
      const intel = generateStudentIntelligence(currentStudent);
      setIntelligence(intel);
      setIsLoading(false);
    }
  }, [currentStudent]);

  if (isLoading || !currentStudent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!intelligence) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load student intelligence</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, {currentStudent.name}!</h1>
        <p className="text-muted-foreground">
          Here&apos;s your AI-powered learning dashboard for today.
        </p>
      </div>

      {/* ML-Driven Intelligence Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Learning State Card - Shows ML + ADK intelligence */}
        <div className="md:col-span-2 lg:col-span-1">
          <LearningStateCard intelligence={intelligence} />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              Take Quiz
            </CardTitle>
            <CardDescription>Test your knowledge</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/quiz">
              <Button className="w-full">
                Start Quiz
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Revision Plan
            </CardTitle>
            <CardDescription>Smart spaced repetition</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/planner">
              <Button variant="outline" className="w-full">
                View Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              AI Chatbot
            </CardTitle>
            <CardDescription>Get instant help</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/chatbot">
              <Button variant="outline" className="w-full">
                Ask AI
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Brain Map Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Student Learning Network</CardTitle>
          <CardDescription>
            Interactive visualization of student connections, topics, and skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InteractiveGraph
            onNodeClick={(nodeId) => console.log('Node clicked:', nodeId)}
            highlightedNode={currentStudent.id}
          />
        </CardContent>
      </Card>

      {/* Topic Mastery Grid - Replaces static Brain Map */}
      <TopicMasteryGrid intelligence={intelligence} />

      {/* Urgent Revisions Alert */}
      {intelligence.revisionUrgency === "URGENT" && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">⚠️ Urgent Revision Needed</CardTitle>
            <CardDescription>
              Our AI detected topics that need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(intelligence.mastery)
              .filter(([_, signal]) => signal.priority === "HIGH")
              .map(([topic, signal]) => (
                <div key={topic} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{topic}</h4>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(signal.score * 100)}% mastery
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Reason: Low mastery ({Math.round(signal.score * 100)}%) · {signal.daysSinceRevision} days since last revision
                  </p>
                </div>
              ))}
            <Link href="/planner">
              <Button className="w-full mt-4">
                Start Revision
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to a learning activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/quiz">
              <Button className="w-full justify-start">
                <FileQuestion className="mr-2 h-4 w-4" />
                Take a Quiz
              </Button>
            </Link>
            <Link href="/syllabus">
              <Button variant="outline" className="w-full justify-start">
                <Book className="mr-2 h-4 w-4" />
                Generate Syllabus
              </Button>
            </Link>
            <Link href="/chatbot">
              <Button variant="outline" className="w-full justify-start">
                <MessageCircle className="mr-2 h-4 w-4" />
                Ask AI Chatbot
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Today&apos;s Priorities
            </CardTitle>
            <CardDescription>
              Based on ML analysis and ADK decisions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(intelligence.mastery)
              .filter(([_, signal]) => signal.needsRevision)
              .slice(0, 3)
              .map(([topic, signal]) => (
                <div key={topic} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{topic}</h4>
                    <span className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive">
                      {signal.priority}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {signal.daysSinceRevision} days since last revision
                  </p>
                </div>
              ))}
            {Object.values(intelligence.mastery).filter(s => s.needsRevision).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                🎉 All caught up! Great work!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
