
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Star, Zap, BookOpen, ShieldCheck, Quote, LineChart as LineChartIcon, Trophy, Award } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { useStudent } from "@/contexts/StudentContext";
import { Skeleton } from "@/components/ui/skeleton";

// Icon mapping for dynamic badges
const iconMap: Record<string, any> = {
  flame: Flame,
  star: Star,
  zap: Zap,
  book: BookOpen,
  shield: ShieldCheck,
  trophy: Trophy,
  award: Award,
};

const chartConfig = {
  current: {
    label: "Current You",
    color: "hsl(var(--primary))",
  },
  past: {
    label: "Past You",
    color: "hsl(var(--muted-foreground))",
  },
  projected: {
    label: "Projected You (without app)",
    color: "hsl(var(--destructive))",
  },
};

export default function RewardsPage() {
  const { currentStudent, loading } = useStudent();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32 md:col-span-2" />
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Calculate dynamic progress from mastery scores
  const masteryScores = currentStudent?.masteryScores || {};
  const subjects = Object.keys(masteryScores);
  const averageMastery = subjects.length > 0
    ? Math.round((Object.values(masteryScores).reduce((a, b) => a + b, 0) / subjects.length) * 100)
    : 0;

  // Generate dynamic chart data based on real mastery
  const progressData = [
    { week: 'Week 1', past: Math.max(0, averageMastery - 30), current: Math.max(0, averageMastery - 25), projected: Math.max(0, averageMastery - 28) },
    { week: 'Week 2', past: Math.max(0, averageMastery - 20), current: Math.max(0, averageMastery - 15), projected: Math.max(0, averageMastery - 18) },
    { week: 'Week 3', past: Math.max(0, averageMastery - 10), current: Math.max(0, averageMastery - 5), projected: Math.max(0, averageMastery - 8) },
    { week: 'Week 4', past: averageMastery, current: averageMastery, projected: Math.max(0, averageMastery - 3) },
  ];

  const studentBadges = currentStudent?.badges || [
    // Fallback badges if none earned yet
    { id: 'consistency', title: "Getting Started", description: "Complete your first study session", icon: 'zap', earnedAt: new Date().toISOString(), color: 'text-blue-500' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Your Rewards & Progress</h1>
        <p className="text-muted-foreground">
          Stay motivated by tracking your achievements and streaks.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flame className="text-orange-500"/> Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">{currentStudent?.streak || 0} <span className="text-lg text-muted-foreground font-normal">days</span></p>
            <p className="text-xs text-muted-foreground mt-1">Keep it going to unlock new badges!</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
           <CardHeader>
            <CardTitle>Overall Mastery</CardTitle>
            <CardDescription>Your average mastery across all subjects is <strong>{averageMastery}%</strong>.</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={averageMastery} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Quote className="w-5 h-5 text-primary" /> Daily Motivation</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="border-l-4 border-primary pl-4 italic text-lg">
              "The secret to getting ahead is getting started."
              <footer className="text-sm text-muted-foreground mt-2">- Mark Twain</footer>
            </blockquote>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badges Earned</CardTitle>
          <CardDescription>Recognitions for your hard work and dedication.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {studentBadges.map((badge, index) => {
            const IconComponent = iconMap[badge.icon] || Award;
            return (
              <div key={index} className="flex flex-col items-center text-center p-4 border rounded-lg hover:bg-accent transition-colors">
                <IconComponent className={`w-12 h-12 mb-2 ${badge.color || 'text-primary'}`} />
                <p className="font-semibold">{badge.title}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5 text-primary"/>
              Personalized Progress Projection
            </CardTitle>
            <CardDescription>Visualize your growth and the impact of consistent learning.</CardDescription>
        </CardHeader>
        <CardContent>
           <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <LineChart
                data={progressData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} label={{ value: 'Mastery %', angle: -90, position: 'insideLeft' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="past"
                  stroke="var(--color-past)"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  name="Past You"
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="var(--color-current)"
                  strokeWidth={3}
                  name="Current You"
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="var(--color-projected)"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  name="Projected (without app)"
                />
              </LineChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
