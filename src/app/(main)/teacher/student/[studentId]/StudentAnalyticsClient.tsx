"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, XAxis, YAxis, CartesianGrid, BarChart as RechartsBarChart } from "recharts";
import Link from "next/link";
import { saveChatbotConfiguration } from "@/app/actions/student-configuration";
import { useToast } from "@/hooks/use-toast";

// Get initials for avatar
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
};

interface StudentAnalyticsClientProps {
  student: {
    id: string;
    name: string;
    email: string;
    className?: string;
    grade?: string | number;
    lastLoginDate?: string | Date;
    chatbotPersonality: string;
    chatbotInstructions: string;
  };
  performance: {
    avgScore: number;
    quizzesTaken: number;
    topicMastery: Record<string, { avg: number; count: number; trend: string }>;
    recentQuizzes: any[];
    strengths: string[];
    weaknesses: string[];
    riskLevel: 'Low' | 'Medium' | 'High';
  };
}

export default function StudentAnalyticsClient({ student, performance }: StudentAnalyticsClientProps) {
  const [chatbotPersonality, setChatbotPersonality] = useState(student.chatbotPersonality);
  const [customInstructions, setCustomInstructions] = useState(student.chatbotInstructions);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Prepare chart data from mastery scores
  const chartData = Object.entries(performance.topicMastery).map(([subject, data]) => ({
    name: subject,
    progress: data.avg,
  }));

  const chartConfig = {
    progress: {
      label: "Progress",
      color: "hsl(var(--chart-1))",
    },
  };

  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    try {
      const result = await saveChatbotConfiguration(student.id, chatbotPersonality, customInstructions);
      if (result.success) {
        toast({
          title: "Configuration saved",
          description: "The chatbot configuration has been successfully updated.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save configuration. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          title="Back to teacher dashboard"
          aria-label="Back to teacher dashboard"
          asChild
        >
          <Link href="/teacher">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Student Analytics</h1>
          <p className="text-muted-foreground">
            Detailed view of {student.name}'s performance and settings.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Profile Card */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16 bg-primary">
                <AvatarFallback className="text-white font-medium">
                  {getInitials(student.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <CardTitle className="text-2xl">{student.name}</CardTitle>
                  <Badge variant={
                    performance.riskLevel === 'High' ? 'destructive' :
                      performance.riskLevel === 'Medium' ? 'secondary' :
                        'default'
                  }>
                    {performance.riskLevel} Risk
                  </Badge>
                </div>
                <CardDescription>
                  Grade {student.grade} · Overall Syllabus Progress: {performance.avgScore}%
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={performance.avgScore} className="h-3" />
            </CardContent>
          </Card>

          {/* Subject Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Subject Performance
              </CardTitle>
              <CardDescription>
                Mastery level across different subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                  <RechartsBarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.length > 10 ? value.slice(0, 10) + '...' : value}
                    />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="progress" fill="var(--color-progress)" radius={[8, 8, 0, 0]} />
                  </RechartsBarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  No performance data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="text-green-500 h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                {performance.strengths && performance.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {performance.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No strengths recorded yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingDown className="text-red-500 h-5 w-5" />
                  Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {performance.weaknesses && performance.weaknesses.length > 0 ? (
                  <ul className="space-y-2">
                    {performance.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">⚠</span>
                        <span className="text-sm">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No weaknesses identified</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Chatbot Customization */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Customization</CardTitle>
              <CardDescription>
                Tailor the AI's personality and instructions for this student.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personality">Personality & Tone</Label>
                <Select value={chatbotPersonality} onValueChange={setChatbotPersonality}>
                  <SelectTrigger id="personality">
                    <SelectValue placeholder="Select a tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly-encouraging">Friendly & Encouraging</SelectItem>
                    <SelectItem value="direct-formal">Direct & Formal</SelectItem>
                    <SelectItem value="patient-supportive">Patient & Supportive</SelectItem>
                    <SelectItem value="challenging-motivating">Challenging & Motivating</SelectItem>
                    <SelectItem value="calm-reassuring">Calm & Reassuring</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Custom Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="e.g., Use analogies related to sports when explaining concepts..."
                  rows={8}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Provide specific guidance on how the AI mentor should interact with {student.name.split(' ')[0]}.
                </p>
              </div>

              <Button className="w-full" onClick={handleSaveConfiguration} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Configuration"}
              </Button>
            </CardContent>
          </Card>

          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                <span className="font-medium">{student.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Grade Level:</span>{" "}
                <span className="font-medium">{student.grade || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Active:</span>{" "}
                <span className="font-medium">
                    {student.lastLoginDate
                        ? new Date(student.lastLoginDate).toLocaleDateString()
                        : 'Never'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
