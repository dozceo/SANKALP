"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ListChecks, FileQuestion, MessageCircle, Loader2, Book, Users } from "lucide-react";
import { LearningStateCard } from "@/components/LearningStateCard";
import { SankalpSwitch } from "@/components/SankalpSwitch";
import { useStudent } from "@/hooks/useStudent";
import { generateStudentIntelligence } from "@/lib/generateStudentIntelligence";
import type { StudentIntelligence } from "@/types/intelligence";

// ⚡ Bolt: Lazy load heavy visualization components to reduce initial bundle size
// 📊 Impact: Improves First Contentful Paint (FCP) by deferring JS execution for below-the-fold content
const TopicMasteryGrid = dynamic(() => import('@/components/TopicMasteryGrid').then(mod => mod.TopicMasteryGrid), {
  loading: () => <Skeleton className="h-[300px] w-full rounded-xl" />,
  ssr: false
});

const PersonalKnowledgeGraph = dynamic(() => import('@/components/PersonalKnowledgeGraph').then(mod => mod.PersonalKnowledgeGraph), {
  loading: () => <Skeleton className="h-[450px] w-full rounded-xl" />,
  ssr: false
});

export default function HomePage() {
  const { currentStudent, loading: studentLoading } = useStudent();
  const [intelligence, setIntelligence] = useState<StudentIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchIntelligence() {
      if (!currentStudent) return;

      try {
        const res = await fetch(`/api/intelligence/student?studentId=${currentStudent.id}`);
        if (res.ok) {
          const data = await res.json();
          setIntelligence(data);
        } else {
          console.warn('Failed to fetch intelligence from API, falling back to local generation');
          const intel = generateStudentIntelligence(currentStudent);
          setIntelligence(intel);
        }
      } catch (error) {
        console.error('Error fetching intelligence:', error);
        const intel = generateStudentIntelligence(currentStudent);
        setIntelligence(intel);
      } finally {
        setIsLoading(false);
      }
    }

    if (currentStudent && !studentLoading) {
      fetchIntelligence();
    }
  }, [currentStudent, studentLoading]);

  if (isLoading || studentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { urgentTopics, priorityTopics, needsRevisionCount } = useMemo(() => {
    if (!intelligence?.mastery) return { urgentTopics: [], priorityTopics: [], needsRevisionCount: 0 };
    const entries = Object.entries(intelligence.mastery);
    const urgent = [];
    const priority = [];
    let needsRevision = 0;

    for (const [topic, signal] of entries) {
      if (signal.priority === "HIGH") {
        urgent.push([topic, signal]);
      }
      if (signal.needsRevision) {
        needsRevision++;
        priority.push([topic, signal]);
      }
    }

    return {
      urgentTopics: urgent,
      priorityTopics: priority.slice(0, 3),
      needsRevisionCount: needsRevision
    };
  }, [intelligence]);

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
        <h1 className="text-3xl font-bold font-headline">Welcome back, {currentStudent?.name}!</h1>
        <p className="text-muted-foreground">
          Here&apos;s your AI-powered learning dashboard for today.
        </p>
      </div>

      {/* SANKALP Loop Session */}
      <SankalpSwitch />

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
            <Link href="/chat">
              <Button variant="outline" className="w-full">
                Ask AI
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Join Class CTA if not enrolled */}
      {!currentStudent?.classId && (
        <Card className="border-primary/30 bg-primary/5 shadow-md overflow-hidden relative">
          <div className="absolute right-0 top-0 p-8 opacity-10 pointer-events-none">
            <Users className="h-32 w-32" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Users className="h-6 w-6" />
              Enrolled in a Class?
            </CardTitle>
            <CardDescription className="text-foreground/70">
              Join your official classroom to get personalized feedback and tracked progress from your teacher.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/classes">
              <Button className="shadow-lg shadow-primary/20">
                Join Your Classroom
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Personal Knowledge Network */}
      <Card>
        <CardHeader>
          <CardTitle>My Knowledge Network</CardTitle>
          <CardDescription>
            Your study materials, strengths, weaknesses, and study group visualized
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStudent && <PersonalKnowledgeGraph student={currentStudent} height={450} />}
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
            {urgentTopics.map(([topic, signal]) => (
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
            <Link href="/chat">
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
            {priorityTopics.map(([topic, signal]) => (
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
            {needsRevisionCount === 0 && (
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
